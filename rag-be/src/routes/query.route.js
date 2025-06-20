import express from 'express';
import { handleQuery } from '../controller/query.controller.js';

const queryRouter = express.Router();

queryRouter.post('/', handleQuery);

export { queryRouter }; 