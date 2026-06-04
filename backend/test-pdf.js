import fs from 'fs';
const buffer = fs.readFileSync('./docs/resume.pdf');
const pdfParse = await import('pdf-parse');
const data = await pdfParse.default(buffer);
console.log('Text length:', data.text.length);
