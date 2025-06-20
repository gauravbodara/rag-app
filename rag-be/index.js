import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { parseAndChunkPDF } from './service/pdf.service.js';
import { createVectorStoreFromDocs, searchVectorStore } from './service/embedding.service.js';
import { callLLMWithContext, callLLMWithContextLLaMA } from './service/llm.service.js';
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
    await createVectorStoreFromDocs(docs);
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
  try {
    const results = await searchVectorStore(query);
    
    if (!results || results.length === 0) {
      return res.status(200).json({ answer: 'No relevant documents found.', references: [] });
    }

    const context = results.map(r => r.pageContent).join('\n---\n');
    const answer = await callLLMWithContext(query, context, process.env.OPENAI_API_KEY);
    // const answer = await callLLMWithContextLLaMA(query, context, process.env.OPENAI_API_KEY);

    res.json({ answer: answer.content, references: results });
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: 'Failed to process query', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 