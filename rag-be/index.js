const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { uploadRouter } = require('./src/routes/upload.route.js');
const { queryRouter } = require('./src/routes/query.route.js');
const logger = require('./utils/logger.js');
const initJaegerTracer = require('./utils/jaeger');
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize Jaeger tracer
const tracer = initJaegerTracer('rag-be');
app.set('tracer', tracer);

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