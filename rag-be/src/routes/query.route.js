const express = require('express');
const { handleQuery } = require('../controller/query.controller.js');

const queryRouter = express.Router();

queryRouter.post('/', handleQuery);

module.exports = { queryRouter }; 