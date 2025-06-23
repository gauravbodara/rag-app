const { OllamaEmbeddings } = require("@langchain/ollama");
const { QdrantClient } = require("@qdrant/js-client-rest");
const { QdrantVectorStore } = require("@langchain/qdrant");
const opentracing = require('opentracing');

// Init embeddings
const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text:v1.5", // Default value
  baseUrl: process.env.OLLAMA_URL || "http://localhost:11434", // Default value
});

// Init vector client
const vectorClient = new QdrantClient({ url: process.env.QDRANT_URL || "http://localhost:6333" });

// Init vector store from existing collection if it exists
let vectorStore = null;
(async () => {
  const collections = await vectorClient.getCollections();
  const exists = collections.collections.some(c => c.name === "langchain-js-demo");
  if (exists) {
    vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      client: vectorClient,
      collectionName: "langchain-js-demo",
    });
  }
})();

// Create vector store from documents
async function createVectorStoreFromDocs(docs, parentSpan = null) {
  const tracer = opentracing.globalTracer();
  const span = tracer.startSpan('embedding_storage', parentSpan ? { childOf: parentSpan } : {});
  const embeddingStart = Date.now();
  vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, { 
    client: vectorClient,
    collectionName: "langchain-js-demo",
  });
  const embeddingEnd = Date.now();
  span.log({ event: 'embedding_storage_time', value: embeddingEnd - embeddingStart });
  span.finish();
}

// Search vector store
 async function searchVectorStore(query, parentSpan = null) {
  // Optionally, tracing can be added here in the future
  return await vectorStore.similaritySearch(query, 4);
}

module.exports = { createVectorStoreFromDocs, searchVectorStore };