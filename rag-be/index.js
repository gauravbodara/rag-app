import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { parseAndChunkPDF } from './utils/pdf.service.js';
import { createVectorStoreFromDocs, searchVectorStore } from './utils/embedding.service.js';
import { callLLMWithContext } from './utils/llm.service.js';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// POST /upload - PDF upload and parsing
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    const { docs, chunks } = await parseAndChunkPDF(req.file.buffer);
    try {
      await createVectorStoreFromDocs(docs);
    } catch (qdrantErr) {
      console.error('Qdrant error:', qdrantErr);
      return res.status(500).json({ error: 'Failed to connect to Qdrant or create collection', details: qdrantErr.message });
    }
    res.json({ message: 'PDF uploaded, parsed, and embedded successfully', chunks: chunks.length });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to process PDF', details: err.message });
  }
});

// POST /query - Handle queries
app.post('/query', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }
  if (!vectorStore) {
    return res.status(400).json({ error: 'No documents uploaded yet' });
  }
  try {
    let results;
    try {
      results = await searchVectorStore(query, null, 4);
    } catch (qdrantErr) {
      console.error('Qdrant search error:', qdrantErr);
      return res.status(500).json({ error: 'Failed to search Qdrant', details: qdrantErr.message });
    }
    if (!results || results.length === 0) {
      return res.status(200).json({ answer: 'No relevant documents found.', references: [] });
    }
    const context = results.map(r => r.pageContent).join('\n---\n');
    let answer;
    try {
      answer = await callLLMWithContext(query, context, process.env.OPENAI_API_KEY);
    } catch (llmErr) {
      console.error('LLM error:', llmErr);
      return res.status(500).json({ error: 'Failed to generate answer from LLM', details: llmErr.message });
    }
    res.json({ answer, references: results });
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: 'Failed to process query', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 