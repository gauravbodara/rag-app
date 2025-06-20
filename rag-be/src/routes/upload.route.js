import express from 'express';
import multer from 'multer';
import { handleUpload } from '../controller/upload.controller.js';

const upload = multer({ storage: multer.memoryStorage() });
const uploadRouter = express.Router();

uploadRouter.post('/', upload.single('file'), handleUpload);

export { uploadRouter }; 