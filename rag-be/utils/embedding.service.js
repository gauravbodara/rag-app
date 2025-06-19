import { QdrantClient } from '@qdrant/js-client-rest';
import { QdrantVectorStore } from '@langchain/community/vectorstores/qdrant';
import { pipeline } from '@xenova/transformers';

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION || 'rag_collection';

// LocalEmbeddings class for langchain compatibility
class LocalEmbeddings {
  constructor() {
    this.initialized = false;
  }
  async init() {
    if (!this.initialized) {
      this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      this.initialized = true;
    }
  }
  async embedDocuments(texts) {
    await this.init();
    const results = await Promise.all(texts.map(async (text) => {
      const output = await this.embedder(text, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    }));
    console.log(results);
    return results;
  }
  async embedQuery(text) {
    await this.init();
    const output = await this.embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }
}

const localEmbeddings = new LocalEmbeddings();
const qdrantClient = new QdrantClient({ url: QDRANT_URL });

export async function createVectorStoreFromDocs(docs) {
  // Upsert documents into Qdrant
  await qdrantClient.upsert(QDRANT_COLLECTION, {
    points: docs.map((doc, index) => ({
      id: index,
      vector: localEmbeddings.embedDocuments([doc.pageContent])[0],
      payload: doc.metadata,
    })),
  });
}

export async function searchVectorStore(query, _unused, k = 4) {
  const results = await qdrantClient.search(QDRANT_COLLECTION, {
    query: query,
    limit: k,
    vector: localEmbeddings.embedQuery(query),
  });
  return results;
} 