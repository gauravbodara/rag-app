const express = require("express");
const multer = require("multer");
const { handleUpload } = require("../controller/upload.controller.js");
const fs = require("fs");
const rateLimit = require('express-rate-limit');

// create temp folder if it doesn't exist
if (!fs.existsSync("temp")) {
  fs.mkdirSync("temp");
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "temp");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });
const uploadRouter = express.Router();

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many uploads, please try again later.' }
});

// allow only pdf files
uploadRouter.use((req, res, next) => {
  if (req.file && req.file.mimetype !== "application/pdf") {
    return res.status(400).json({ error: "Only PDF files are allowed" });
  }
  next();
});

uploadRouter.use(uploadLimiter);

uploadRouter.post("/", upload.single("file"), handleUpload);

module.exports = { uploadRouter };
