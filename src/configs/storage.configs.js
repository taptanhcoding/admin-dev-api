const rootPath = require('app-root-path').path
const path = require('path')
const fs = require('fs')
const express = require("express");
const app = express();
const multer = require("multer");

const UPLOAD_DIRECTORY =path.join(rootPath,"src","public","uploads"); 

const storageImg = multer.diskStorage({
    destination: function (req, file, cb) {
      const { id, collection } = req.params;
      const PATH = `${UPLOAD_DIRECTORY}/${collection}/${id}`
      if(!fs.existsSync(PATH)) {
        fs.mkdirSync(PATH, { recursive: true })
      }
      cb(null, PATH)
    },
    filename: function (req, file, cb) {
      console.log('file storage',file);
      // Xử lý tên file cho chuẩn
    const fileInfo = path.parse(file.originalname);
    const safefileName =
      fileInfo.name.replace(/[^a-z0-9]/gi, "_").toLowerCase() + fileInfo.ext;
    // return
    cb(null, safefileName);
    }
  })

module.exports = {
    storageImg
}