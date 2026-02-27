'use client';

import React from 'react';
import Image from 'next/image';
import * as ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
import { Coffee, CircleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import qr1Img from '../../../docs/qr1.jpg';
import qr2Img from '../../../docs/qr2.jpg';
import FeedbackWidget from './FeedbackWidget';

export default function HeaderUtilityButtons() {
  const [showLegalDisclaimer, setShowLegalDisclaimer] = React.useState(false);
  const [showCoffeeSupport, setShowCoffeeSupport] = React.useState(false);

  return (
    <>
      <FeedbackWidget onVoteYes={() => setShowCoffeeSupport(true)} />
      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Правовой дисклеймер"
          aria-label="Открыть правовой дисклеймер"
          className="h-9 w-9 border-red-300 bg-red-50 text-red-700 shadow-sm hover:bg-red-100 hover:text-red-800"
          onClick={() => setShowLegalDisclaimer(true)}
        >
          <motion.span
            className="inline-flex"
            animate={{ scale: [1, 1.08, 1], opacity: [0.92, 1, 0.92] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <CircleAlert className="h-4.5 w-4.5 text-red-600" />
          </motion.span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Кофе автору"
          aria-label="Открыть окно поддержки автора"
          className="h-9 w-9 border-amber-300 bg-amber-50 text-amber-800 shadow-sm hover:bg-amber-100 hover:text-amber-900"
          onClick={() => setShowCoffeeSupport(true)}
        >
          <Coffee className="h-4.5 w-4.5 text-amber-700" />
        </Button>
      </div>

      {showLegalDisclaimer && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowLegalDisclaimer(false)}>
          <div className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl border border-red-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-red-100 bg-gradient-to-r from-red-50 to-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <CircleAlert className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-900">Правовой дисклеймер</h3>
                  <p className="text-xs text-red-700">Пожалуйста, ознакомьтесь перед использованием материалов сайта</p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-lg leading-none text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                aria-label="Закрыть дисклеймер"
                onClick={() => setShowLegalDisclaimer(false)}
              >
                ×
              </button>
            </div>
            <div className="space-y-4 px-6 py-5 text-sm leading-6 text-gray-700">
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
              <div className="rounded-xl border border-red-100 bg-red-50/60 p-4">
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
              <p className="text-xs text-gray-500">
                Продолжая пользоваться сайтом, вы подтверждаете, что понимаете указанный характер ресурса, принимаете данный дисклеймер и используете материалы
                добровольно, на свой страх и риск.
              </p>
            </div>
            <div className="flex justify-end border-t bg-gray-50 px-6 py-4">
              <Button variant="secondary" onClick={() => setShowLegalDisclaimer(false)}>
                Понятно
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showCoffeeSupport && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowCoffeeSupport(false)}>
          <div className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl border border-amber-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-amber-100 bg-gradient-to-r from-amber-50 via-orange-50 to-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <Coffee className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-900">Кофе автору</h3>
                  <p className="text-xs text-amber-700">Небольшое спасибо за удобный инструмент для учёбы</p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-lg leading-none text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                aria-label="Закрыть окно поддержки"
                onClick={() => setShowCoffeeSupport(false)}
              >
                ×
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
                <p className="text-sm leading-6 text-amber-950">
                  Если вам нравится сайт, если он помог вам в учёбе и если вам действительно удобно им пользоваться, вы можете поблагодарить автора
                  за его незаурядные способности в программировании и угостить его чашечкой кофе.
                </p>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 text-center text-sm font-medium text-gray-700">QR-код 1</div>
                  <div className="overflow-hidden rounded-xl border bg-white p-2">
                    <Image
                      src={qr1Img}
                      alt="QR-код для поддержки автора, вариант 1"
                      className="h-auto w-full rounded-md"
                    />
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 text-center text-sm font-medium text-gray-700">QR-код 2</div>
                  <div className="overflow-hidden rounded-xl border bg-white p-2">
                    <Image
                      src={qr2Img}
                      alt="QR-код для поддержки автора, вариант 2"
                      className="h-auto w-full rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end border-t bg-gray-50 px-6 py-4">
              <Button variant="secondary" onClick={() => setShowCoffeeSupport(false)}>
                Спасибо
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
