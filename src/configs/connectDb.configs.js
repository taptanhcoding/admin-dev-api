// const mongoose = require('mongoose')

// async function connectDB() {
//     try {
//         await mongoose.connect('mongodb://localhost:27017/nodejs-aptech');
//         console.log('connected successfully to db');
//     }
//     catch(err) {
//         console.log('Kết nối thất bại :::',err);
//     }
// }

// module.exports = connectDB

const mongoose = require("mongoose");
const URL = "mongodb+srv://chuyendev:SxLmGjf8v1YY2BUY@mern-nodejs.zsy2goi.mongodb.net/?retryWrites=true&w=majority";

async function connectDB() {
  try {
    await mongoose.connect(URL,{ useNewUrlParser: true, useUnifiedTopology: true});
    console.log("connect successfully");
  } catch (error) {
    console.log("connect failure");
    console.log(error);
    process.exit(1);
  }
}

module.exports = connectDB