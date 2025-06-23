const { searchVectorStore } = require("../service/embedding.service.js");
const { callLLMWithContext } = require("../service/llm.service.js");
const logger = require("../../utils/logger.js");
const opentracing = require("opentracing");

const handleQuery = async (req, res) => {
  const tracer = req.app.get("tracer");
  const parentSpan = tracer.startSpan("query_flow");
  const { query } = req.body;
  if (!query) {
    logger.warn("Query is required");
    parentSpan.setTag("error", true);
    parentSpan.finish();
    return res.status(400).json({ error: "Query is required" });
  }
  try {
    logger.info("Processing query");
    // clean query using langchain

    const cleanSpan = tracer.startSpan("query_clean", { childOf: parentSpan });
    logger.info(`Cleaned query: ${query}`);
    cleanSpan.finish();
    const embeddingSpan = tracer.startSpan("query_embedding", {
      childOf: parentSpan,
    });
    const embeddingStart = Date.now();
    // Embedding is part of vector search
    const results = await searchVectorStore(query, parentSpan);
    const embeddingEnd = Date.now();
    logger.info(
      `Query embedding/vector search time: ${embeddingEnd - embeddingStart}ms`
    );
    embeddingSpan.log({
      event: "query_vector_time",
      value: embeddingEnd - embeddingStart,
    });
    embeddingSpan.finish();
    if (!results || results.length === 0) {
      logger.info("No relevant documents found");
      parentSpan.finish();
      return res
        .status(200)
        .json({ answer: "No relevant documents found.", references: [] });
    }
    console.log(
      "results",
      results,
      results.map((item) => item.metadata.pageNumber)
    );
    const context = results.map((r) => r.pageContent).join("\n---\n");
    const llmSpan = tracer.startSpan("query_llm", { childOf: parentSpan });
    const llmStart = Date.now();
    const answer = await callLLMWithContext(
      query,
      context,
      process.env.OPENAI_API_KEY,
      parentSpan
    );
    const llmEnd = Date.now();
    logger.info(`Query LLM time: ${llmEnd - llmStart}ms`);
    llmSpan.log({ event: "query_llm_time", value: llmEnd - llmStart });
    llmSpan.finish();
    parentSpan.finish();
    logger.info("Query processed successfully");
    // Only return page numbers as references
    res.json({
      answer: answer.content,
      references: results
        .map((r) => {
          return {
            pageNumber: r.metadata?.pageNumber,
            pageContent: r.pageContent,
          };
        })
        .filter(Boolean),
    });
  } catch (err) {
    logger.error("Query error:", err);
    parentSpan.setTag("error", true);
    parentSpan.log({ event: "error", message: err.message });
    parentSpan.finish();
    res
      .status(500)
      .json({ error: "Failed to process query", details: err.message });
  }
};

module.exports = { handleQuery };
