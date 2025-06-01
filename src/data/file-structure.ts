import type { FileNode } from '@/types';
import { BriefcaseMedical, Stethoscope, Siren, Baby, ScissorsIcon, ClipboardType, ListChecks, FileText } from 'lucide-react';

const DUMMY_FILE_CONTENT_CLINICAL = "This is a sample text from a medical PDF file about clinical cases. It contains various medical terms, patient history, examination findings, and diagnostic procedures. The main goal is to understand the key points, differential diagnoses, and final diagnosis discussed.";
const DUMMY_FILE_CONTENT_PRACTICAL = "This is a sample text from a medical PDF file about practical skills. It describes various medical procedures, step-by-step instructions, indications, contraindications, and potential complications. The focus is on hands-on application of medical knowledge.";

// Helper function to create display names from PDF filenames
const createDisplayNameFromPdf = (filename: string): string => {
  if (!filename) return 'Unnamed File';
  return filename
    .replace(/\.pdf$/i, '') // Remove .pdf extension
    .replace(/-/g, ' ')    // Replace hyphens with spaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(' ');
};

// Helper function to generate files for other sections (only for Khirurgiya now)
const generateFiles = (count: number, filePrefix: 'clinical_case' | 'practical_skill', basePathId: string, subFolderType: 'klin' | 'prakt', displayNamePrefix: 'Clinical Case' | 'Practical Skill'): FileNode[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${basePathId}-${subFolderType}-file-${i + 1}`, // ensure unique IDs
    name: `${displayNamePrefix} ${i + 1}.pdf`,
    type: 'file' as 'file',
    icon: FileText,
    path: `/pdfs/${basePathId}/${subFolderType}/${filePrefix}_${i + 1}.pdf`,
    contentPreview: filePrefix === 'clinical_case' ? DUMMY_FILE_CONTENT_CLINICAL : DUMMY_FILE_CONTENT_PRACTICAL,
  }));
};

// Akusherstvo files
const akusherstvoKlinFiles: FileNode[] = [
  { id: 'akusherstvo-klin-anemia-pregnancy', name: 'Анемія вагітних', type: 'file', icon: FileText, path: '/pdfs/akusherstvo/klin/pregnancy-anemia.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'akusherstvo-klin-arterial-hypertension', name: 'Артеріальна гіпертензія', type: 'file', icon: FileText, path: '/pdfs/akusherstvo/klin/arterial-hypertension.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'akusherstvo-klin-dysfunctional-uterine-bleeding', name: 'Дисфункціональна маткова кровотеча', type: 'file', icon: FileText, path: '/pdfs/akusherstvo/klin/dysfunctional-uterine-bleeding.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'akusherstvo-klin-threatened-preterm-labor-2', name: 'Загроза передчасних пологів -2', type: 'file', icon: FileText, path: '/pdfs/akusherstvo/klin/threatened-preterm-labor-2.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'akusherstvo-klin-threatened-preterm-labor-1', name: 'Загроза передчасних пологів-1', type: 'file', icon: FileText, path: '/pdfs/akusherstvo/klin/threatened-preterm-labor-1.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'akusherstvo-klin-threatened-preterm-labor-3', name: 'Загроза передчасних пологів-3', type: 'file', icon: FileText, path: '/pdfs/akusherstvo/klin/threatened-preterm-labor-3.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'akusherstvo-klin-risk-of-uterine-scar-rupture', name: 'Загроза розриву по рубцю', type: 'file', icon: FileText, path: '/pdfs/akusherstvo/klin/risk-of-uterine-scar-rupture.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'akusherstvo-klin-left-ovarian-cyst', name: 'Кіста лівого яєчника', type: 'file', icon: FileText, path: '/pdfs/akusherstvo/klin/left-ovarian-cyst.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'akusherstvo-klin-uterine-leiomyoma', name: 'Лейоміома матки', type: 'file', icon: FileText, path: '/pdfs/akusherstvo/klin/uterine-leiomyoma.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'akusherstvo-klin-ectopic-pregnancy', name: 'Порушена позаматкова вагітність', type: 'file', icon: FileText, path: '/pdfs/akusherstvo/klin/ectopic-pregnancy.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
];

const akusherstvoPraktFiles: FileNode[] = [
  { id: 'akusherstvo-prakt-manual-placental-removal', name: 'Ручне відділення плаценти та видалення посліду', type: 'file', icon: FileText, path: '/pdfs/akusherstvo/prakt/manual-placental-removal.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'akusherstvo-prakt-active-management-third-stage', name: 'Активне ведення третього періоду пологів', type: 'file', icon: FileText, path: '/pdfs/akusherstvo/prakt/active-management-third-stage-labor.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'akusherstvo-prakt-cervical-examination-with-speculum-2', name: 'B2 Огляд шийки матки в дзеркалах при гінекологічному дослідженні', type: 'file', icon: FileText, path: '/pdfs/akusherstvo/prakt/cervical-examination-with-speculum-2.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'akusherstvo-prakt-cervical-cytology-sampling', name: 'Взяття біологічного матеріалу з шийки матки для проведення цитологічного дослідження', type: 'file', icon: FileText, path: '/pdfs/akusherstvo/prakt/cervical-cytology-sampling.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'akusherstvo-prakt-bacterioscopic-sampling', name: 'Взяття мазків для бактеріоскопічного дослідження з уретри, цервікального каналу та піхви', type: 'file', icon: FileText, path: '/pdfs/akusherstvo/prakt/bacterioscopic-sampling.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'akusherstvo-prakt-pelvic-measurements', name: 'Вимірювання розмірів нормального тазу та визначення справжньої кон’югати', type: 'file', icon: FileText, path: '/pdfs/akusherstvo/prakt/pelvic-measurements.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'akusherstvo-prakt-fetal-heart-rate-auscultation', name: 'Вислуховування серцебиття плода', type: 'file', icon: FileText, path: '/pdfs/akusherstvo/prakt/fetal-heart-rate-auscultation.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'akusherstvo-prakt-internal-obstetric-examination', name: 'Внутрішнє акушерське дослідження', type: 'file', icon: FileText, path: '/pdfs/akusherstvo/prakt/internal-obstetric-examination.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'akusherstvo-prakt-clinical-breast-examination', name: 'Клінічне обстеження молочних залоз', type: 'file', icon: FileText, path: '/pdfs/akusherstvo/prakt/clinical-breast-examination.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'akusherstvo-prakt-cervical-examination-with-speculum', name: 'Огляд шийки матки в дзеркалах при гінекологічному дослідженні', type: 'file', icon: FileText, path: '/pdfs/akusherstvo/prakt/cervical-examination-with-speculum.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'akusherstvo-prakt-leopold-maneuvers', name: 'Прийоми зовнішнього акушерського дослідження (прийоми Леопольда)', type: 'file', icon: FileText, path: '/pdfs/akusherstvo/prakt/leopold-maneuvers.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'akusherstvo-prakt-culdocentesis', name: 'Пункція черевної порожнини через заднє склепіння піхви', type: 'file', icon: FileText, path: '/pdfs/akusherstvo/prakt/culdocentesis.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
];

// Ekstrenna Meditsyna files
const ekstrenkaKlinFiles: FileNode[] = [
  { id: 'ekstrenka-klin-cardiogenic-shock', name: '«Кардіогенний шок»', type: 'file', icon: FileText, path: '/pdfs/ekstrenka/klin/cardiogenic-shock.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'ekstrenka-klin-anaphylactic-shock', name: 'Анафілактичний шок', type: 'file', icon: FileText, path: '/pdfs/ekstrenka/klin/anaphylactic-shock.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'ekstrenka-klin-hyperthermia', name: 'Гіпертермія', type: 'file', icon: FileText, path: '/pdfs/ekstrenka/klin/hyperthermia.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'ekstrenka-klin-hypoglycemia', name: 'Гіпоглікемія', type: 'file', icon: FileText, path: '/pdfs/ekstrenka/klin/hypoglycemia.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'ekstrenka-klin-closed-tibia-fracture', name: 'Закритий перелом гомілки', type: 'file', icon: FileText, path: '/pdfs/ekstrenka/klin/closed-tibia-fracture.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'ekstrenka-klin-drug-overdose', name: 'Передозування наркотичними речовинами', type: 'file', icon: FileText, path: '/pdfs/ekstrenka/klin/drug-overdose.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'ekstrenka-klin-upper-limb-fracture', name: 'Перелом верхньої кінцівки', type: 'file', icon: FileText, path: '/pdfs/ekstrenka/klin/upper-limb-fracture.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'ekstrenka-klin-pneumothorax', name: 'Пневмоторакс', type: 'file', icon: FileText, path: '/pdfs/ekstrenka/klin/pneumothorax.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
];

const ekstrenkaPraktFiles: FileNode[] = [
  { id: 'ekstrenka-prakt-subclavian-vein-catheterization', name: '«Катетеризація підключичної вени»', type: 'file', icon: FileText, path: '/pdfs/ekstrenka/prakt/subclavian-vein-catheterization.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'ekstrenka-prakt-intraosseous-access', name: '«Внутрішньокістковий доступ»', type: 'file', icon: FileText, path: '/pdfs/ekstrenka/prakt/intraosseous-access.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'ekstrenka-prakt-needle-decompression', name: '«Голкова декомпресія»', type: 'file', icon: FileText, path: '/pdfs/ekstrenka/prakt/needle-decompression.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'ekstrenka-prakt-peripheral-vein-catheterization', name: '«Катетеризація периферичної(ліктьової) вени»', type: 'file', icon: FileText, path: '/pdfs/ekstrenka/prakt/peripheral-vein-catheterization.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'ekstrenka-prakt-laryngeal-mask', name: '«Постановка ларінгеальної маски»', type: 'file', icon: FileText, path: '/pdfs/ekstrenka/prakt/laryngeal-mask.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'ekstrenka-prakt-glycemia-measurement', name: 'Визначення рівня глікемії, гіпоглікемія', type: 'file', icon: FileText, path: '/pdfs/ekstrenka/prakt/glycemia-measurement.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'ekstrenka-prakt-oropharyngeal-airway', name: 'Встановлення орофарингеального повітряпроводу', type: 'file', icon: FileText, path: '/pdfs/ekstrenka/prakt/oropharyngeal-airway.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'ekstrenka-prakt-upper-limb-immobilization', name: 'Іммобілізація верхньої кінцівки', type: 'file', icon: FileText, path: '/pdfs/ekstrenka/prakt/upper-limb-immobilization.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'ekstrenka-prakt-lower-limb-immobilization', name: 'Іммобілізація нижньої кінцівки', type: 'file', icon: FileText, path: '/pdfs/ekstrenka/prakt/lower-limb-immobilization.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'ekstrenka-prakt-tracheal-intubation', name: 'Інтубація трахеї', type: 'file', icon: FileText, path: '/pdfs/ekstrenka/prakt/tracheal-intubation.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'ekstrenka-prakt-cardiopulmonary-resuscitation', name: 'Серцево-легенева реанімація', type: 'file', icon: FileText, path: '/pdfs/ekstrenka/prakt/cardiopulmonary-resuscitation.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
];

// Vnutrishnya Meditsyna files
const vmKlinFiles: FileNode[] = [
  { id: 'vm-klin-t-bronchial-asthma', name: 'Бронхіальна астма', type: 'file', icon: FileText, path: '/pdfs/vm/klin/t-bronchial-asthma.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'vm-klin-t-toxic-nodular-goiter', name: 'Вузловий токсичний зоб', type: 'file', icon: FileText, path: '/pdfs/vm/klin/t-toxic-nodular-goiter.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'vm-klin-t-hypertension', name: 'Гіпертонічна хвороба', type: 'file', icon: FileText, path: '/pdfs/vm/klin/t-hypertension.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'vm-klin-t-hypertrophic-cardiomyopathy', name: 'Гіпертрофічна кардіоміопатія', type: 'file', icon: FileText, path: '/pdfs/vm/klin/t-hypertrophic-cardiomyopathy.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'vm-klin-t-infectious-mononucleosis', name: 'Інфекційний мононуклеоз', type: 'file', icon: FileText, path: '/pdfs/vm/klin/t-infectious-mononucleosis.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'vm-klin-t-infective-endocarditis', name: 'Інфекційний ендокардит', type: 'file', icon: FileText, path: '/pdfs/vm/klin/t-infective-endocarditis.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'vm-klin-t-community-acquired-pneumonia', name: 'Негоспітальна пневмонія', type: 'file', icon: FileText, path: '/pdfs/vm/klin/t-community-acquired-pneumonia.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'vm-klin-t-urolithiasis', name: 'Сечокам’яна хвороба', type: 'file', icon: FileText, path: '/pdfs/vm/klin/t-urolithiasis.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'vm-klin-t-chronic-hepatitis-c', name: 'Хронічний вірусний гепатит С', type: 'file', icon: FileText, path: '/pdfs/vm/klin/t-chronic-hepatitis-c.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'vm-klin-t-shigellosis', name: 'Шигельоз', type: 'file', icon: FileText, path: '/pdfs/vm/klin/t-shigellosis.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
];

// Удаляем букву "П" из пути и id, а также из имени файла, если есть, для практических файлов Внутрішня медицина
const vmPraktFiles: FileNode[] = [
  { id: 'vm-prakt-bronchial-asthma', name: 'Бронхіальна астма', type: 'file', icon: FileText, path: '/pdfs/vm/prakt/p-bronchial-asthma.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'vm-prakt-toxic-nodular-goiter', name: 'Вузловий токсичний зоб', type: 'file', icon: FileText, path: '/pdfs/vm/prakt/p-toxic-nodular-goiter.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'vm-prakt-hypertension', name: 'Гіпертонічна хвороба', type: 'file', icon: FileText, path: '/pdfs/vm/prakt/p-hypertension.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'vm-prakt-hypertrophic-cardiomyopathy', name: 'Гіпертрофічна кардіоміопатія', type: 'file', icon: FileText, path: '/pdfs/vm/prakt/p-hypertrophic-cardiomyopathy.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'vm-prakt-infective-endocarditis', name: 'Інфекційний ендокардит', type: 'file', icon: FileText, path: '/pdfs/vm/prakt/p-infective-endocarditis.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'vm-prakt-infectious-mononucleosis', name: 'Інфекційний мононуклеоз', type: 'file', icon: FileText, path: '/pdfs/vm/prakt/p-infectious-mononucleosis.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'vm-prakt-community-acquired-pneumonia', name: 'Негоспітальна пневмонія', type: 'file', icon: FileText, path: '/pdfs/vm/prakt/p-community-acquired-pneumonia.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'vm-prakt-urolithiasis', name: 'Сечокам’яна хвороба', type: 'file', icon: FileText, path: '/pdfs/vm/prakt/p-urolithiasis.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'vm-prakt-chronic-hepatitis-c', name: 'Хронічний вірусний гепатит С', type: 'file', icon: FileText, path: '/pdfs/vm/prakt/p-chronic-hepatitis-c.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'vm-prakt-shigellosis', name: 'Шигельоз', type: 'file', icon: FileText, path: '/pdfs/vm/prakt/p-shigellosis.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
];

// Pediatriya files
const pediatriyaKlinFiles: FileNode[] = [
  { id: 'pediatriya-klin-anemia', name: 'Анемія', type: 'file', icon: FileText, path: '/pdfs/pediatriya/klin/anemia.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'pediatriya-klin-asphyxia', name: 'Асфіксія', type: 'file', icon: FileText, path: '/pdfs/pediatriya/klin/asphyxia.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'pediatriya-klin-bronchial-asthma', name: 'Бронх Астма', type: 'file', icon: FileText, path: '/pdfs/pediatriya/klin/bronchial-asthma.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'pediatriya-klin-hepatitis', name: 'Гепатит', type: 'file', icon: FileText, path: '/pdfs/pediatriya/klin/hepatitis.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'pediatriya-klin-measles', name: 'Кір', type: 'file', icon: FileText, path: '/pdfs/pediatriya/klin/measles.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'pediatriya-klin-pneumonia', name: 'Пневмонія', type: 'file', icon: FileText, path: '/pdfs/pediatriya/klin/pneumonia.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'pediatriya-klin-respiratory-distress-syndrome', name: 'РДС', type: 'file', icon: FileText, path: '/pdfs/pediatriya/klin/respiratory-distress-syndrome.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'pediatriya-klin-urinary-tract-disorders', name: 'Сечові', type: 'file', icon: FileText, path: '/pdfs/pediatriya/klin/urinary-tract-disorders.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'pediatriya-klin-tachycardia', name: 'Тахікардія', type: 'file', icon: FileText, path: '/pdfs/pediatriya/klin/tachycardia.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'pediatriya-klin-diabetes-mellitus', name: 'Цукровий діабет', type: 'file', icon: FileText, path: '/pdfs/pediatriya/klin/diabetes-mellitus.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
];

const pediatriyaPraktFiles: FileNode[] = [
  { id: 'pediatriya-prakt-ambu-bag', name: 'АМБУ', type: 'file', icon: FileText, path: '/pdfs/pediatriya/prakt/ambu-bag.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'pediatriya-prakt-korotkoff-blood-pressure', name: 'АТ КОРОТКОВ', type: 'file', icon: FileText, path: '/pdfs/pediatriya/prakt/korotkoff-blood-pressure.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'pediatriya-prakt-lung-auscultation', name: 'Аускультація легких', type: 'file', icon: FileText, path: '/pdfs/pediatriya/prakt/lung-auscultation.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'pediatriya-prakt-heart-auscultation', name: 'Аускультація СЕРДЦЕ', type: 'file', icon: FileText, path: '/pdfs/pediatriya/prakt/heart-auscultation.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'pediatriya-prakt-heimlich-maneuver', name: 'ГЕЙмлих', type: 'file', icon: FileText, path: '/pdfs/pediatriya/prakt/heimlich-maneuver.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'pediatriya-prakt-urinary-catheter', name: 'Катетер міхура', type: 'file', icon: FileText, path: '/pdfs/pediatriya/prakt/urinary-catheter.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'pediatriya-prakt-lumbar-puncture', name: 'Люмбальна пункція', type: 'file', icon: FileText, path: '/pdfs/pediatriya/prakt/lumbar-puncture.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'pediatriya-prakt-two-finger-massage', name: 'Масаж 2 пальця', type: 'file', icon: FileText, path: '/pdfs/pediatriya/prakt/two-finger-massage.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'pediatriya-prakt-thumb-massage', name: 'Масаж великі пальці', type: 'file', icon: FileText, path: '/pdfs/pediatriya/prakt/thumb-massage.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'pediatriya-prakt-nasogastric-tube', name: 'НАЗО зонд', type: 'file', icon: FileText, path: '/pdfs/pediatriya/prakt/nasogastric-tube.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
];

// Khirurgiya files
const khirurgiyaKlinFiles: FileNode[] = [
  { id: 'khirurgiya-klin-pleural-puncture', name: 'ДІАГНОСТИЧНА ПЛЕВРАЛЬНА ПУНКЦІЯ', type: 'file', icon: FileText, path: '/pdfs/khirurgiya/klin/pleural-puncture.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'khirurgiya-klin-suture-removal', name: 'Зняття шкірних швів', type: 'file', icon: FileText, path: '/pdfs/khirurgiya/klin/suture-removal.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'khirurgiya-klin-foley-catheterization', name: 'Катетеризація сечового міхура катетером Фолея', type: 'file', icon: FileText, path: '/pdfs/khirurgiya/klin/foley-catheterization.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'khirurgiya-klin-cricothyrotomy', name: 'Конікотомія', type: 'file', icon: FileText, path: '/pdfs/khirurgiya/klin/cricothyrotomy.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'khirurgiya-klin-cervical-collar', name: 'Накладання коміру Шанца', type: 'file', icon: FileText, path: '/pdfs/khirurgiya/klin/cervical-collar.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'khirurgiya-klin-occlusive-dressing', name: 'Накладання оклюзійної пов’язки', type: 'file', icon: FileText, path: '/pdfs/khirurgiya/klin/occlusive-dressing.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'khirurgiya-klin-cat-tourniquet', name: 'Накладання турнікета CAT', type: 'file', icon: FileText, path: '/pdfs/khirurgiya/klin/cat-tourniquet.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'khirurgiya-klin-skin-sutures', name: 'Накладання шкірних швів', type: 'file', icon: FileText, path: '/pdfs/khirurgiya/klin/skin-sutures.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  { id: 'khirurgiya-klin-breast-examination', name: 'Пальпація молочних залоз', type: 'file', icon: FileText, path: '/pdfs/khirurgiya/klin/breast-examination.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
  // { id: 'khirurgiya-klin-rectal-examination', name: 'Пальцьове дослідження прямої кишки', type: 'file', icon: FileText, path: '/pdfs/khirurgiya/klin/Пальцьове дослідження прямої кишки.pdf', contentPreview: DUMMY_FILE_CONTENT_CLINICAL },
];

const khirurgiyaPraktFiles: FileNode[] = [
  { id: 'khirurgiya-prakt-breast-examination', name: 'Пальпація молочних залоз', type: 'file', icon: FileText, path: '/pdfs/khirurgiya/prakt/breast-examination.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'khirurgiya-prakt-cervical-collar', name: 'Накладання коміру Шанца', type: 'file', icon: FileText, path: '/pdfs/khirurgiya/prakt/cervical-collar.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'khirurgiya-prakt-cricothyrotomy', name: 'Конікотомія', type: 'file', icon: FileText, path: '/pdfs/khirurgiya/prakt/cricothyrotomy.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'khirurgiya-prakt-foley-catheterization', name: 'Катетеризація сечового міхура катетером Фолея', type: 'file', icon: FileText, path: '/pdfs/khirurgiya/prakt/foley-catheterization.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'khirurgiya-prakt-occlusive-dressing', name: 'Накладання оклюзійної пов’язки', type: 'file', icon: FileText, path: '/pdfs/khirurgiya/prakt/occlusive-dressing.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'khirurgiya-prakt-pleural-puncture', name: 'ДІАГНОСТИЧНА ПЛЕВРАЛЬНА ПУНКЦІЯ', type: 'file', icon: FileText, path: '/pdfs/khirurgiya/prakt/pleural-puncture.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'khirurgiya-prakt-rectal-examination', name: 'Пальцьове дослідження прямої кишки', type: 'file', icon: FileText, path: '/pdfs/khirurgiya/prakt/rectal-examination.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'khirurgiya-prakt-skin-sutures', name: 'Накладання шкірних швів', type: 'file', icon: FileText, path: '/pdfs/khirurgiya/prakt/skin-sutures.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'khirurgiya-prakt-suture-removal', name: 'Зняття шкірних швів', type: 'file', icon: FileText, path: '/pdfs/khirurgiya/prakt/suture-removal.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
  { id: 'khirurgiya-prakt-tourniquet', name: 'Накладання турнікета CAT', type: 'file', icon: FileText, path: '/pdfs/khirurgiya/prakt/tourniquet.pdf', contentPreview: DUMMY_FILE_CONTENT_PRACTICAL },
];


export const fileStructureData: FileNode[] = [
  {
    id: 'akusherstvo',
    name: 'Акушерство',
    type: 'folder',
    icon: BriefcaseMedical,
    children: [
      {
        id: 'akusherstvo-klin',
        name: 'Клинические станции',
        type: 'folder',
        icon: ClipboardType,
        children: akusherstvoKlinFiles,
      },
      {
        id: 'akusherstvo-prakt',
        name: 'Практические станции',
        type: 'folder',
        icon: ListChecks,
        children: akusherstvoPraktFiles,
      },
    ],
  },
  {
    id: 'vm',
    name: 'Внутрішня медицина',
    type: 'folder',
    icon: Stethoscope,
    children: [
      {
        id: 'vm-klin',
        name: 'Клинические станции',
        type: 'folder',
        icon: ClipboardType,
        children: vmKlinFiles,
      },
      {
        id: 'vm-prakt',
        name: 'Практические станции',
        type: 'folder',
        icon: ListChecks,
        children: vmPraktFiles,
      },
    ],
  },
  {
    id: 'ekstrenka',
    name: 'Екстренна медицина',
    type: 'folder',
    icon: Siren,
    children: [
       {
        id: 'ekstrenka-klin',
        name: 'Клинические станции',
        type: 'folder',
        icon: ClipboardType,
        children: ekstrenkaKlinFiles,
      },
      {
        id: 'ekstrenka-prakt',
        name: 'Практические станции',
        type: 'folder',
        icon: ListChecks,
        children: ekstrenkaPraktFiles,
      },
    ],
  },
  {
    id: 'pediatriya',
    name: 'Педіатрія',
    type: 'folder',
    icon: Baby,
    children: [
      {
        id: 'pediatriya-klin',
        name: 'Клинические станции',
        type: 'folder',
        icon: ClipboardType,
        children: pediatriyaKlinFiles,
      },
      {
        id: 'pediatriya-prakt',
        name: 'Практические станции',
        type: 'folder',
        icon: ListChecks,
        children: pediatriyaPraktFiles,
      },
    ],
  },
  {
    id: 'khirurgiya',
    name: 'Хірургія',
    type: 'folder',
    icon: ScissorsIcon,
    children: [
      {
        id: 'khirurgiya-klin',
        name: 'Клинические станции',
        type: 'folder',
        icon: ClipboardType,
        children: khirurgiyaKlinFiles,
      },
      {
        id: 'khirurgiya-prakt',
        name: 'Практические станции',
        type: 'folder',
        icon: ListChecks,
        children: khirurgiyaPraktFiles,
      },
    ],
  },
];



