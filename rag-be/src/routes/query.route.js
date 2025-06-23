const express = require('express');
const { handleQuery } = require('../controller/query.controller.js');

const queryRouter = express.Router();

// create middleware to check for query text validations
queryRouter.use((req, res, next) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }
  if (query.length < 3) {
    return res.status(400).json({ error: 'Query must be at least 3 characters long' });
  }
  if (query.length > 200) {
    return res.status(400).json({ error: 'Query must be less than 200 characters long' });
  }
  if (query.includes('```')) {
    return res.status(400).json({ error: 'Query must not contain ```' });
  }
  next();
});
queryRouter.post('/', handleQuery);

module.exports = { queryRouter }; 