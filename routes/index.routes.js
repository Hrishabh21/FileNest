const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { ID } = require('node-appwrite');
const mime = require('mime-types');
const upload = require('../config/multer.config');
const fileModel = require('../models/files.models');
const authMiddleware = require('../middlewares/auth');
const { storage } = require('../config/appwrite.config');
require('dotenv').config();
const sdk = require('node-appwrite');
const { InputFile } = require('node-appwrite/file');


router.get('/home', authMiddleware, async (req, res) => {
    const userFiles = await fileModel.find({ user: req.user.userId });
    res.render('home', { files: userFiles ,user: req.user.username});
});
const uniqueId = Date.now().toString();


router.post('/upload',authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const filePath = path.resolve(req.file.path);
    const nodeFile = InputFile.fromPath(filePath, req.file.originalname);

    const uploaded = await storage.createFile(
      process.env.APPWRITE_BUCKET_ID,
      ID.unique(),
      nodeFile
    );
  

    fs.unlinkSync(filePath);

    await fileModel.create({
      path: uploaded.$id,
      originalname: uploaded.name,
      user: req.user.userId || req.user._id || req.user.id

    });

    // res.json({
    //   message: "Uploaded to Appwrite & saved in MongoDB",
    //   file: uploaded
    // });
    res.redirect('/home')
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/download/:fileId', authMiddleware,async (req, res) => {
  try {
    const fileId = req.params.fileId;
    console.log(fileId)
   // const downloadUrl = await storage.getFileDownload(process.env.APPWRITE_BUCKET_ID, fileId); // 
     const downloadUrl = `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${process.env.APPWRITE_BUCKET_ID}/files/${fileId}/download?project=${process.env.APPWRITE_PROJECT_ID}`;

    return res.redirect(downloadUrl);
  } catch (err) {
    console.error('Download error:', err.message);
    return res.status(404).send('File not found.');
  }
});

module.exports = router;
