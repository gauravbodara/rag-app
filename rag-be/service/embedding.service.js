import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OllamaEmbeddings } from "@langchain/ollama";
import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore } from "@langchain/qdrant";


const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text:v1.5", // Default value
  baseUrl: "http://localhost:11434", // Default value
});

const vectorClient = new QdrantClient({ url: "http://localhost:6333" });
// Step 4: Create Qdrant vector store and add documents

//Make this singleton 
let vectorStore = null;
const collections = await vectorClient.getCollections();
const exists = collections.collections.some(c => c.name === "langchain-js-demo");
if (exists) {
  vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    client: vectorClient,
    collectionName: "langchain-js-demo",
  });
}

export async function createVectorStoreFromDocs(docs) {
  vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, { 
    client: vectorClient,
    collectionName: "langchain-js-demo",
  });
}

export async function searchVectorStore(query) {
  // console.log("Searching for:", query, "with embeddings:", embeddings, "in vector store:", vectorStore);
  return await vectorStore.similaritySearch(query, 4);
}