const fs = require('fs');
const path = require('path');

const PDF_ROOT = path.join(__dirname, '../../public/pdfs');
const OUTPUT = path.join(__dirname, 'pdf-index.json');

function getAllPdfFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getAllPdfFiles(filePath));
    } else if (file.toLowerCase().endsWith('.pdf')) {
      results.push(filePath);
    }
  }
  return results;
}

function textContentToString(textContent) {
  let out = '';
  for (const item of textContent.items || []) {
    if (!item || typeof item.str !== 'string') continue;
    out += item.str;
    out += item.hasEOL ? '\n' : ' ';
  }
  return out
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

async function extractPagesWithPdfJs(fileBuffer) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(fileBuffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const pages = [];

  try {
    for (let i = 1; i <= pdf.numPages; i += 1) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      pages.push(textContentToString(textContent));
    }
  } finally {
    await pdf.destroy();
  }

  return pages;
}

async function indexPdfs() {
  const pdfFiles = getAllPdfFiles(PDF_ROOT);
  const index = [];
  let multiPageCount = 0;

  for (const file of pdfFiles) {
    const relPath = path.relative(path.join(__dirname, '../../public'), file).replace(/\\/g, '/');

    try {
      const data = fs.readFileSync(file);
      const pages = await extractPagesWithPdfJs(data);
      const text = pages.join('\n\f\n');

      if (pages.length > 1) multiPageCount += 1;

      index.push({
        path: `/${relPath}`,
        text,
        pages,
      });

      console.log(`Indexed: ${relPath} (pages=${pages.length})`);
    } catch (error) {
      console.error('Failed to parse', relPath, error);
    }
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(index, null, 2), 'utf-8');
  console.log('PDF index written to', OUTPUT);
  console.log(`Indexed files: ${index.length}, with page-level splits (>1 page): ${multiPageCount}`);
}

indexPdfs().catch((error) => {
  console.error('Indexing failed', error);
  process.exit(1);
});
