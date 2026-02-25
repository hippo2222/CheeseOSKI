'use client';

import React from 'react';
import type { FileNode } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Устанавливаем workerSrc для react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PdfViewerProps {
  selectedFile: FileNode | null;
  initialPage?: number;
  searchText?: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ selectedFile, initialPage = 1, searchText }) => {
  const [numPages, setNumPages] = React.useState<number>(0);
  const pageRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [pageRendered, setPageRendered] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = React.useState(1.0);

  const handleZoomIn = () => setZoom(z => Math.min(2.0, +(z + 0.1).toFixed(2)));
  const handleZoomOut = () => setZoom(z => Math.max(0.5, +(z - 0.1).toFixed(2)));

  React.useEffect(() => {
    if (numPages > 0 && initialPage > 0 && initialPage <= numPages) {
      const ref = pageRefs.current[initialPage - 1];
      const container = containerRef.current;
      if (ref) {
        if (container) {
          const top = ref.offsetTop;
          container.scrollTo({ top, behavior: 'smooth' });
        } else {
          ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [numPages, initialPage, selectedFile?.path]);

  React.useEffect(() => {
    if (numPages === 0 || !containerRef.current) return;
    let attempts = 0;
    const maxAttempts = 20;
    const interval = 200;
    let timeoutId: NodeJS.Timeout;

    function tryScrollToPage() {
      const ref = pageRefs.current[initialPage - 1];
      const container = containerRef.current;
      if (ref && container) {
        const top = ref.offsetTop;
        container.scrollTo({ top, behavior: 'smooth' });
        return;
      }
      attempts++;
      if (attempts < maxAttempts) {
        timeoutId = setTimeout(tryScrollToPage, interval);
      }
    }
    tryScrollToPage();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numPages, initialPage, selectedFile?.path]);

  // После рендера страницы ищем искомый текст и скроллим к нему (с повторными попытками)
  React.useEffect(() => {
    if (!pageRendered) return;
    if (!searchText) return;
    const ref = pageRefs.current[initialPage - 1];
    if (!ref) return;
    let attempts = 0;
    let found = false;
    const maxAttempts = 20;
    const interval = 200; // мс
    let timeoutId: NodeJS.Timeout;

    function tryScrollToText() {
      if (!ref || !searchText) return;
      const textSpans = Array.from(ref.querySelectorAll('.react-pdf__Page__textContent span'));
      if (textSpans.length === 0) {
        attempts++;
        if (attempts < maxAttempts) {
          timeoutId = setTimeout(tryScrollToText, interval);
        }
        return;
      }
      // Собираем весь текст страницы
      const allText = textSpans.map(s => s.textContent || '').join('');
      const search = searchText.replace(/\s+/g, ' ').trim().toLowerCase();
      const pageText = allText.replace(/\s+/g, ' ').trim().toLowerCase();
      const idx = pageText.indexOf(search);
      if (idx === -1) {
        attempts++;
        if (attempts < maxAttempts) {
           timeoutId = setTimeout(tryScrollToText, interval);
        }
        return;
      }
      // Определяем, в каком span начинается совпадение
      let charCount = 0;
      for (const span of textSpans) {
        const spanText = (span.textContent || '').replace(/\s+/g, ' ');
        const nextCharCount = charCount + spanText.length;
        if (charCount <= idx && idx < nextCharCount) {
          (span as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
          found = true;
          break;
        }
        charCount = nextCharCount;
      }
      attempts++;
      if (!found && attempts < maxAttempts) {
        timeoutId = setTimeout(tryScrollToText, interval);
      }
    }
    tryScrollToText();
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageRendered, searchText, initialPage]);

  if (!selectedFile) {
    return (
      <Card className="h-full flex items-center justify-center shadow-lg">
        <CardContent className="text-center">
          <p className="text-lg text-muted-foreground p-8">Select a file to view its content.</p>
        </CardContent>
      </Card>
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
      <CardContent ref={containerRef} className="flex-1 p-0 relative overflow-auto max-h-[80vh] w-full flex justify-center">
        <Document
          file={selectedFile.path}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<div className="p-8 text-center">Загрузка PDF...</div>}
          error={<div className="p-8 text-center text-destructive">Ошибка загрузки PDF</div>}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={800 * zoom}
              inputRef={ref => { pageRefs.current[index] = ref; }}
              onRenderSuccess={() => {
                if (index + 1 === initialPage) setPageRendered(true);
              }}
            />
          ))}
        </Document>
      </CardContent>
    </Card>
  );
};

export default PdfViewer;

