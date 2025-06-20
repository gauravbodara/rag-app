import { searchVectorStore } from '../service/embedding.service.js';
import { callLLMWithContext } from '../service/llm.service.js';
import logger from '../../utils/logger.js';

export const handleQuery = async (req, res) => {
  const { query } = req.body;
  if (!query) {
    logger.warn('Query is required');
    return res.status(400).json({ error: 'Query is required' });
  }
  try {
    logger.info('Processing query');
    const results = await searchVectorStore(query);
    if (!results || results.length === 0) {
      logger.info('No relevant documents found');
      return res.status(200).json({ answer: 'No relevant documents found.', references: [] });
    }
    const context = results.map(r => r.pageContent).join('\n---\n');
    const answer = await callLLMWithContext(query, context, process.env.OPENAI_API_KEY);
    logger.info('Query processed successfully');
    res.json({ answer: answer.content, references: results });
  } catch (err) {
    logger.error('Query error:', err);
    res.status(500).json({ error: 'Failed to process query', details: err.message });
  }
};
