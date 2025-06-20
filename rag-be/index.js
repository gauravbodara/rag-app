import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { uploadRouter } from './src/routes/upload.route.js';
import { queryRouter } from './src/routes/query.route.js';
import logger from './utils/logger.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// API routes
app.use('/upload', uploadRouter);
app.use('/query', queryRouter);

// Centralized error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
}); 