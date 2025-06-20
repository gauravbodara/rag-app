import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OllamaEmbeddings } from "@langchain/ollama";


const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text:v1.5", // Default value
  baseUrl: "http://localhost:11434", // Default value
});

let vectorStore = null;

export async function createVectorStoreFromDocs(docs) {
  vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
}

export async function searchVectorStore(query) {
  // console.log("Searching for:", query, "with embeddings:", embeddings, "in vector store:", vectorStore);
  return await vectorStore.similaritySearch(query, 4);
} 

export async function embedQuery(query) {
  return await embeddings.embedQuery(query);
}