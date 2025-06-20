import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
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
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const docs = await textSplitter.createDocuments([text]);
  return { docs, chunks: docs.map(doc => doc.pageContent) };
}