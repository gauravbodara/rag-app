import { parseAndChunkPDF } from '../service/pdf.service.js';
import { createVectorStoreFromDocs } from '../service/embedding.service.js';
import logger from '../../utils/logger.js';

export const handleUpload = async (req, res) => {
  if (!req.file) {
    logger.warn('No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    logger.info('Processing uploaded PDF');
    const { docs, chunks } = await parseAndChunkPDF(req.file.buffer);
    await createVectorStoreFromDocs(docs);
    logger.info('PDF uploaded, parsed, and embedded successfully');
    res.json({ message: 'PDF uploaded, parsed, and embedded successfully', chunks: chunks.length });
  } catch (err) {
    logger.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to process PDF', details: err.message });
  }
};
