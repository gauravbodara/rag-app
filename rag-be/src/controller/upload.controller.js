const { parseAndChunkPDF } = require("../service/pdf.service.js");
const {
  createVectorStoreFromDocs,
} = require("../service/embedding.service.js");
const logger = require("../../utils/logger.js");
const path = require("path");
const fs = require("fs");
const opentracing = require("opentracing");
const handleUpload = async (req, res) => {
  const tracer = req.app.get("tracer");
  const parentSpan = tracer.startSpan("document_upload_flow");
  const filePath = path.join("temp", req.file.filename);
  const uploadStart = Date.now();
  const fileBuffer = fs.readFileSync(filePath);
  const uploadEnd = Date.now();
  if (!fileBuffer) {
    logger.warn("No file uploaded");
    parentSpan.setTag("error", true);
    parentSpan.finish();
    return res.status(400).json({ error: "No file uploaded" });
  }
  try {
    logger.info("Processing uploaded PDF");
    parentSpan.log({ event: "upload_time", value: uploadEnd - uploadStart });
    const chunkingSpan = tracer.startSpan("chunking", { childOf: parentSpan });
    const chunkingStart = Date.now();
    const { docs, chunks } = await parseAndChunkPDF(fileBuffer, parentSpan);
    const chunkingEnd = Date.now();
    logger.info(`Chunking time: ${chunkingEnd - chunkingStart}ms`);

    chunkingSpan.log({
      event: "chunking_time",
      value: chunkingEnd - chunkingStart,
    });
    chunkingSpan.finish();

    const embeddingSpan = tracer.startSpan("embedding", {
      childOf: parentSpan,
    });
    const embeddingStart = Date.now();

    await createVectorStoreFromDocs(docs, parentSpan);
    const embeddingEnd = Date.now();
    logger.info(`Embedding & storage time: ${embeddingEnd - embeddingStart}ms`);
    embeddingSpan.log({
      event: "embedding_time",
      value: embeddingEnd - embeddingStart,
    });
    embeddingSpan.finish();
    parentSpan.finish();

    logger.info("PDF uploaded, parsed, and embedded successfully");
    res.json({
      message: "PDF uploaded, parsed, and embedded successfully",
      chunks: chunks.length,
    });
  } catch (err) {
    logger.error("Upload error:", err);
    parentSpan.setTag("error", true);
    parentSpan.log({ event: "error", message: err.message });
    parentSpan.finish();
    res
      .status(500)
      .json({ error: "Failed to process PDF", details: err.message });
  }
};

module.exports = { handleUpload };
