const express = require("express");
const multer = require("multer");
const { handleUpload } = require("../controller/upload.controller.js");
const fs = require("fs");

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

// allow only pdf files
uploadRouter.use((req, res, next) => {
  if (req.file && req.file.mimetype !== "application/pdf") {
    return res.status(400).json({ error: "Only PDF files are allowed" });
  }
  next();
});

uploadRouter.post("/", upload.single("file"), handleUpload);

module.exports = { uploadRouter };
