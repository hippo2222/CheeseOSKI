const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const PDF_ROOT = path.join(__dirname, '../../public/pdfs');
const OUTPUT = path.join(__dirname, 'pdf-index.json');

function getAllPdfFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllPdfFiles(filePath));
    } else if (file.toLowerCase().endsWith('.pdf')) {
      results.push(filePath);
    }
  });
  return results;
}

async function indexPdfs() {
  const pdfFiles = getAllPdfFiles(PDF_ROOT);
  const index = [];
  for (const file of pdfFiles) {
    const relPath = path.relative(path.join(__dirname, '../../public'), file).replace(/\\/g, '/');
    try {
      const data = fs.readFileSync(file);
      const parsed = await pdfParse(data);
      // parsed.text - весь текст, parsed.numpages, parsed.info, parsed.metadata, parsed.version
      // parsed.texts - массив по страницам (если есть)
      let pages = [];
      if (parsed.text && parsed.text.length > 0 && parsed.numpages && parsed.numpages > 1 && parsed.hasOwnProperty('text')) {
        // Если есть разбивка по страницам (pdf-parse >=1.1.1)
        if (parsed.hasOwnProperty('pages') && Array.isArray(parsed.pages)) {
          pages = parsed.pages;
        } else if (parsed.hasOwnProperty('text') && typeof parsed.text === 'string') {
          // Если нет разбивки, делим по \f (form feed)
          pages = parsed.text.split('\f');
        }
      } else if (parsed.text) {
        pages = [parsed.text];
      }
      index.push({
        path: '/' + relPath,
        text: parsed.text,
        pages: pages,
      });
      console.log('Indexed:', relPath);
    } catch (e) {
      console.error('Failed to parse', relPath, e);
    }
  }
  fs.writeFileSync(OUTPUT, JSON.stringify(index, null, 2), 'utf-8');
  console.log('PDF index written to', OUTPUT);
}

indexPdfs(); 