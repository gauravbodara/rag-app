const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
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
  const chunkingEnd = Date.now();
  span.log({ event: 'pdf_chunking_time', value: chunkingEnd - chunkingStart });
  span.finish();
  return { docs, chunks: docs.map(doc => doc.pageContent) };
}

module.exports = { parseAndChunkPDF };