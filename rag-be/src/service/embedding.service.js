import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OllamaEmbeddings } from "@langchain/ollama";
import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore } from "@langchain/qdrant";
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
export async function createVectorStoreFromDocs(docs) {
  vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, { 
    client: vectorClient,
    collectionName: "langchain-js-demo",
  });
}

// Search vector store
export async function searchVectorStore(query) {
  return await vectorStore.similaritySearch(query, 4);
}