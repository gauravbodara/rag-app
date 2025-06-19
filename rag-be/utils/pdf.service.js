import { Document } from 'langchain/document';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export async function parseAndChunkPDF(buffer) {
  // Convert Buffer to Uint8Array for pdfjs-dist
  const uint8array = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data: uint8array });
  const pdf = await loadingTask.promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }
  // Simple chunking: split every 1000 chars
  const chunks = text.match(/(.|\n){1,1000}/g) || [];
  const docs = chunks.map((chunk, i) => new Document({ pageContent: chunk, metadata: { chunk: i } }));
  return { docs, chunks };
} 