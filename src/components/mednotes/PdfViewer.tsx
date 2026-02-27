'use client';

import React from 'react';
import type { FileNode } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { findMatchRawRange } from '@/lib/pdf-search-highlight';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PdfViewerProps {
  selectedFile: FileNode | null;
  initialPage?: number;
  searchText?: string;
  searchJumpToken?: number;
}

function isPdfDebugEnabled() {
  if (typeof window === 'undefined') return false;
  return (
    localStorage.getItem('pdfDebug') === '1' ||
    (window as typeof window & { __PDF_DEBUG__?: boolean }).__PDF_DEBUG__ === true
  );
}

function pdfDebugLog(event: string, payload?: Record<string, unknown>) {
  if (!isPdfDebugEnabled()) return;
  const time = new Date().toISOString().slice(11, 23);
  console.log(`[PDFDBG ${time}] ${event}`, payload ?? {});
}

function getPageTextSpans(pageRoot: HTMLElement): HTMLElement[] {
  const preferred = Array.from(
    pageRoot.querySelectorAll<HTMLElement>('.react-pdf__Page__textContent span[role="presentation"]')
  ).filter((el) => (el.textContent ?? '').trim().length > 0);

  if (preferred.length > 0) return preferred;

  return Array.from(
    pageRoot.querySelectorAll<HTMLElement>('.react-pdf__Page__textContent span')
  ).filter((el) => el.childElementCount === 0 && (el.textContent ?? '').trim().length > 0);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function clearPageHighlights(pageRoot: HTMLElement) {
  const spans = Array.from(pageRoot.querySelectorAll<HTMLElement>('[data-search-highlighted="true"]'));
  for (const span of spans) {
    const original = span.dataset.searchOriginal;
    if (typeof original === 'string') {
      span.textContent = original;
    }
    delete span.dataset.searchHighlighted;
    delete span.dataset.searchOriginal;
  }
}

function scrollElementIntoContainer(container: HTMLDivElement | null, element: HTMLElement) {
  if (!container) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const containerRect = container.getBoundingClientRect();
  const targetRect = element.getBoundingClientRect();
  const nextTop =
    container.scrollTop +
    (targetRect.top - containerRect.top) -
    (container.clientHeight / 2 - targetRect.height / 2);

  container.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
}

function highlightTextOnPdfPage(
  pageRoot: HTMLElement,
  searchText: string,
  container: HTMLDivElement | null
): { ok: boolean; spanCount: number; marks: number; matchMode?: string } {
  const textSpans = getPageTextSpans(pageRoot);
  const spanCount = textSpans.length;
  if (!searchText.trim() || spanCount === 0) {
    return { ok: false, spanCount, marks: 0 };
  }

  const spansWithText = textSpans.map((span) => ({ span, text: span.textContent || '' }));
  const fullText = spansWithText.map((x) => x.text).join('');
  if (!fullText) {
    return { ok: false, spanCount, marks: 0 };
  }

  const match = findMatchRawRange(fullText, searchText);
  if (!match) {
    return { ok: false, spanCount, marks: 0 };
  }

  let rawCursor = 0;
  let firstHighlightedSpan: HTMLElement | null = null;
  let marks = 0;

  for (const { span, text } of spansWithText) {
    const spanStart = rawCursor;
    const spanEnd = rawCursor + text.length;
    rawCursor = spanEnd;

    if (!text) continue;
    if (spanEnd <= match.startRaw || spanStart >= match.endRawExclusive) continue;

    const localStart = Math.max(0, match.startRaw - spanStart);
    const localEnd = Math.min(text.length, match.endRawExclusive - spanStart);
    if (localStart >= localEnd) continue;

    const before = escapeHtml(text.slice(0, localStart));
    const matchText = escapeHtml(text.slice(localStart, localEnd));
    const after = escapeHtml(text.slice(localEnd));

    span.dataset.searchOriginal = text;
    span.dataset.searchHighlighted = 'true';
    span.innerHTML = `${before}<mark class="bg-yellow-200 text-yellow-900 font-bold px-0.5 rounded">${matchText}</mark>${after}`;
    marks += 1;

    if (!firstHighlightedSpan) firstHighlightedSpan = span;
  }

  if (!firstHighlightedSpan) {
    return { ok: false, spanCount, marks: 0 };
  }

  scrollElementIntoContainer(container, firstHighlightedSpan);
  return { ok: true, spanCount, marks, matchMode: match.mode };
}

function buildPageSearchOrder(initialPage: number, numPages: number): number[] {
  const pages: number[] = [];
  if (initialPage >= 1 && initialPage <= numPages) pages.push(initialPage);
  for (let p = 1; p <= numPages; p += 1) {
    if (p !== initialPage) pages.push(p);
  }
  return pages;
}

const PdfViewer: React.FC<PdfViewerProps> = ({
  selectedFile,
  initialPage = 1,
  searchText,
  searchJumpToken = 0,
}) => {
  const [numPages, setNumPages] = React.useState(0);
  const [zoom, setZoom] = React.useState(1.0);
  const [containerWidth, setContainerWidth] = React.useState(800);
  const pageRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const highlightRunIdRef = React.useRef(0);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === container) {
          // Вычитаем 32px для отступов и скроллбара, чтобы избежать горизонтального скроллинга
          setContainerWidth(Math.max(300, entry.contentRect.width - 32));
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [selectedFile?.path]);

  const handleZoomIn = () => setZoom((z) => Math.min(2.0, +(z + 0.1).toFixed(2)));
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)));

  React.useEffect(() => {
    setNumPages(0);
    pageRefs.current = [];
    highlightRunIdRef.current += 1;
    pdfDebugLog('viewer.reset', {
      file: selectedFile?.path ?? null,
      initialPage,
      searchText: searchText ?? null,
      searchJumpToken,
    });
  }, [selectedFile?.path, initialPage, searchText, searchJumpToken]);

  React.useEffect(() => {
    if (numPages === 0 || initialPage < 1 || initialPage > numPages) {
      pdfDebugLog('scroll.page.skip', { numPages, initialPage, reason: 'invalid-page' });
      return;
    }

    let attempts = 0;
    const maxAttempts = 25;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const tryScrollToPage = () => {
      if (cancelled) return;
      const pageRef = pageRefs.current[initialPage - 1];
      const container = containerRef.current;

      if (pageRef) {
        pdfDebugLog('scroll.page.success', {
          initialPage,
          attempt: attempts,
          pageOffsetTop: pageRef.offsetTop,
          beforeScrollTop: container?.scrollTop ?? null,
        });
        if (container) {
          container.scrollTo({ top: pageRef.offsetTop, behavior: 'smooth' });
        } else {
          pageRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      attempts += 1;
      pdfDebugLog('scroll.page.retry', { initialPage, attempt: attempts });
      if (attempts < maxAttempts) timeoutId = setTimeout(tryScrollToPage, 120);
      else pdfDebugLog('scroll.page.giveup', { initialPage, attempts });
    };

    pdfDebugLog('scroll.page.start', { initialPage, numPages, searchJumpToken });
    tryScrollToPage();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [numPages, initialPage, selectedFile?.path, searchJumpToken]);

  React.useEffect(() => {
    for (const pageRef of pageRefs.current) {
      if (pageRef) clearPageHighlights(pageRef);
    }

    const query = searchText?.trim();
    if (!query || numPages === 0 || initialPage < 1 || initialPage > numPages) {
      pdfDebugLog('highlight.skip', {
        query: query ?? null,
        numPages,
        initialPage,
        reason: 'missing-query-or-invalid-page',
      });
      return;
    }

    const runId = ++highlightRunIdRef.current;
    let attempts = 0;
    const maxAttempts = 30;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const tryHighlight = () => {
      if (cancelled || highlightRunIdRef.current !== runId) return;

      const pageOrder = buildPageSearchOrder(initialPage, numPages);
      let found = false;
      let hasAnyPageRef = false;
      let triedPages = 0;

      for (const pageNumber of pageOrder) {
        const pageRef = pageRefs.current[pageNumber - 1];
        if (!pageRef) {
          continue;
        }
        hasAnyPageRef = true;
        triedPages += 1;

        clearPageHighlights(pageRef);
        const result = highlightTextOnPdfPage(pageRef, query, containerRef.current);
        pdfDebugLog('highlight.attempt', {
          runId,
          requestedInitialPage: initialPage,
          pageTried: pageNumber,
          attempt: attempts,
          ok: result.ok,
          spanCount: result.spanCount,
          marks: result.marks,
          matchMode: result.matchMode ?? null,
        });

        if (result.ok) {
          found = true;
          break;
        }
      }

      if (!found) {
        attempts += 1;
        if (!hasAnyPageRef) {
          pdfDebugLog('highlight.retry.no-page-ref', { runId, initialPage, attempt: attempts });
        } else {
          pdfDebugLog('highlight.retry.no-match-yet', {
            runId,
            initialPage,
            attempt: attempts,
            triedPages,
          });
        }
        if (attempts < maxAttempts) timeoutId = setTimeout(tryHighlight, 120);
        else {
          pdfDebugLog('highlight.giveup', {
            runId,
            initialPage,
            attempts,
            query,
            triedPages,
            hasAnyPageRef,
          });
        }
      }
    };

    pdfDebugLog('highlight.start', { runId, initialPage, query, zoom, searchJumpToken });
    tryHighlight();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [searchText, initialPage, numPages, selectedFile?.path, zoom, searchJumpToken]);

  if (!selectedFile) {
    return (
      <div className="h-full flex flex-col items-center overflow-y-auto w-full mx-auto py-8 px-4 sm:px-6">
        <div className="w-full flex flex-col gap-6">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold font-headline text-foreground">Добро пожаловать в CheeseOSKI!</h2>
            <p className="text-muted-foreground text-lg mx-auto">
              Это удобный навигатор по материалам для подготовки к экзамену ОСКИ.
              Выберите нужную станцию или файл в боковом меню слева, чтобы начать работу.
            </p>
            <p className="text-muted-foreground text-md mx-auto">
              💡 Если вы уже знаете, какие задачи вам попадутся, воспользуйтесь режимом <b>«Я знаю, какие будут станции»</b> для быстрого переключения только между ними.
            </p>
          </div>

          <Card className="border-red-200 shadow-sm mt-4">
            <CardHeader className="border-b border-red-100 bg-gradient-to-r from-red-50 to-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-900 leading-tight">Правовой дисклеймер</h3>
                  <p className="text-xs text-red-700">Пожалуйста, ознакомьтесь перед использованием материалов сайта</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-6 py-5 text-sm leading-6 text-gray-700">
              <p>
                Материалы, представленные на сайте, собраны из открытых источников и размещены исключительно в информационно-образовательных целях
                для более комфортной подготовки студентов ХНМУ к экзаменационной сессии. Сайт не является официальным ресурсом университета, кафедры,
                экзаменационной комиссии, медицинского учреждения или иного государственного/частного органа.
              </p>
              <p>
                Автор сайта не заявляет права собственности на учебные материалы, не гарантирует их происхождение от конкретного правообладателя и не
                подтверждает их актуальность, полноту, точность, научную корректность, методическую достаточность или соответствие текущим требованиям
                учебной программы, стандартов, приказов, локальных регламентов и экзаменационных критериев.
              </p>
              <p>
                Использование любых материалов осуществляется пользователем исключительно по собственному усмотрению и на свой риск. Пользователь самостоятельно
                оценивает релевантность, достоверность и допустимость применения информации в учебных, профессиональных, научных, практических или иных целях,
                а также самостоятельно несёт ответственность за любые решения, действия или бездействие, совершённые на основе размещённых материалов.
              </p>
              <div className="rounded-xl border border-red-100 bg-red-50/60 p-4 shadow-sm">
                <p className="font-medium text-red-900">Важно:</p>
                <p className="mt-1 text-red-800">
                  Материалы сайта не являются медицинской консультацией, клинической рекомендацией, официальным протоколом лечения, юридической консультацией
                  или заменой очного обучения с преподавателем. Их нельзя воспринимать как руководство к оказанию медицинской помощи пациентам.
                </p>
              </div>
              <p>
                Автор сайта не несёт ответственности за прямые или косвенные убытки, вред, претензии, санкции, академические последствия, дисциплинарные меры,
                неверную подготовку к экзаменам, неверную интерпретацию материалов, использование материалов третьими лицами, а также за любое незаконное,
                недобросовестное, неэтичное или нецелевое использование контента сайта.
              </p>
              <p>
                Пользователь обязуется соблюдать применимое законодательство, нормы академической добросовестности, авторские и смежные права, внутренние правила
                учебного заведения и иные обязательные требования. При наличии сомнений относительно правомерности использования конкретного материала пользователь
                должен воздержаться от его использования до получения необходимых разрешений или официальных разъяснений.
              </p>
              <p>
                Если вы являетесь правообладателем либо уполномоченным представителем и считаете, что размещение какого-либо материала нарушает ваши права,
                вы можете направить обращение с подтверждающими сведениями. Автор оставляет за собой право ограничить доступ к материалу, удалить его либо
                скорректировать описание в разумный срок после рассмотрения обращения.
              </p>
              <p className="text-xs text-gray-500 pt-2 border-t mt-4">
                Продолжая пользоваться сайтом, вы подтверждаете, что понимаете указанный характер ресурса, принимаете данный дисклеймер и используете материалы
                добровольно, на свой страх и риск.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (selectedFile.type === 'folder' || !selectedFile.path) {
    return (
      <Card className="h-full flex items-center justify-center shadow-lg">
        <CardContent className="text-center p-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <p className="text-lg text-destructive-foreground">Cannot display this item.</p>
          <p className="text-sm text-muted-foreground">This is a folder or the file path is missing.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col shadow-lg overflow-hidden">
      <CardHeader>
        <CardTitle className="font-headline text-2xl truncate">{selectedFile.name}</CardTitle>
        <div className="flex gap-2 mt-2">
          <button
            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
          >
            -
          </button>
          <span className="text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
          <button
            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={handleZoomIn}
            disabled={zoom >= 2.0}
          >
            +
          </button>
        </div>
      </CardHeader>

      <CardContent
        ref={containerRef}
        data-testid="pdf-scroll-container"
        className="flex-1 p-0 relative overflow-auto max-h-[80vh] w-full flex justify-center"
      >
        <Document
          file={selectedFile.path}
          onLoadSuccess={({ numPages: loadedPages }) => {
            pdfDebugLog('document.loadSuccess', { file: selectedFile.path, loadedPages });
            setNumPages(loadedPages);
          }}
          loading={<div className="p-8 text-center">Загрузка PDF...</div>}
          error={<div className="p-8 text-center text-destructive">Ошибка загрузки PDF</div>}
        >
          {Array.from(new Array(numPages), (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={containerWidth * zoom}
              inputRef={(ref) => {
                pageRefs.current[index] = ref;
                if (ref && index + 1 === initialPage) {
                  pdfDebugLog('page.ref.ready', {
                    page: index + 1,
                    file: selectedFile.path,
                    offsetTop: ref.offsetTop,
                  });
                }
              }}
              onRenderTextLayerSuccess={() => {
                if (index + 1 === initialPage) {
                  const pageRef = pageRefs.current[index];
                  pdfDebugLog('page.textLayer.ready', {
                    page: index + 1,
                    file: selectedFile.path,
                    spans: pageRef ? getPageTextSpans(pageRef).length : 0,
                  });
                }
              }}
            />
          ))}
        </Document>
      </CardContent>
    </Card>
  );
};

export default PdfViewer;
