const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { Document } = require("@langchain/core/documents");
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');
const opentracing = require('opentracing');

async function parseAndChunkPDF(buffer, parentSpan = null) {
  const tracer = opentracing.globalTracer();
  const span = tracer.startSpan('pdf_chunking', parentSpan ? { childOf: parentSpan } : {});
  const chunkingStart = Date.now();
  // Convert Buffer to Uint8Array for pdfjs-dist
  const uint8array = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data: uint8array });
  const pdf = await loadingTask.promise;
  let pageTexts = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    pageTexts.push({ text: pageText, pageNumber: i });
  }

  // Create Document objects with page number metadata
  let docsWithMetadata = pageTexts.map(({ text, pageNumber }) =>
    new Document({ pageContent: text, metadata: { pageNumber } })
  );

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  // Split each page separately, preserving page number metadata
  let allChunks = [];
  for (const doc of docsWithMetadata) {
    const chunks = await textSplitter.splitDocuments([doc]);
    allChunks.push(...chunks);
  }
  const chunkingEnd = Date.now();
  span.log({ event: 'pdf_chunking_time', value: chunkingEnd - chunkingStart });
  span.finish();
  return { docs: allChunks, chunks: allChunks.map(doc => doc.pageContent) };
}

module.exports = { parseAndChunkPDF };