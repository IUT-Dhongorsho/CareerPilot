import fs from "fs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

// Some PDFs need external CMAPs for character mapping
const CMAP_URL = "./node_modules/pdfjs-dist/cmaps/";
const CMAP_PACKED = true;
const STANDARD_FONT_DATA_URL = "./node_modules/pdfjs-dist/standard_fonts/";

export const extractTextFromPDF = async (buffer: Buffer): Promise<string> => {
  try {
    const data = new Uint8Array(buffer);
    const loadingTask = getDocument({
      data,
      cMapUrl: CMAP_URL,
      cMapPacked: CMAP_PACKED,
      standardFontDataUrl: STANDARD_FONT_DATA_URL,
    });

    const pdfDocument = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => (item as any).str).join(" ");
      fullText += pageText + "\n";
    }

    return fullText.trim() || " ";
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Failed to parse PDF");
  }
};