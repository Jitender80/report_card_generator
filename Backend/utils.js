

const { PDFDocument } = require("pdf-lib");

async function mergePdfBuffers(pdfBuffers) {
    const mergedPdf = await PDFDocument.create();
    const addedPages = new Set();
  
    for (const pdfBuffer of pdfBuffers) {
      const pdf = await PDFDocument.load(pdfBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
  
      copiedPages.forEach((page, index) => {
        const pageIndex = `${pdfBuffer}-${index}`;
        if (!addedPages.has(pageIndex)) {
          mergedPdf.addPage(page);
          addedPages.add(pageIndex);
        }
      });
    }
  
    return await mergedPdf.save();
  }
  module.exports = { mergePdfBuffers };