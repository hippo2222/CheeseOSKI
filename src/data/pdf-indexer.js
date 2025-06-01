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
      index.push({
        path: '/' + relPath,
        text: parsed.text,
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