const express = require('express');
const cors = require('cors');
const path = require('path');
const oracledb = require('oracledb');
var QRcode = require('qrcode');

// router
const studentRouter = require("./routes/student");
const userRouter = require("./routes/user");
const boardRouter = require("./routes/board");
const productRouter = require("./routes/product");
const db = require("./db");

const app = express();
app.use(cors());

// ejs 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '.')); // .은 경로
app.use(express.json());

// 라우터 설정
app.use("/student", studentRouter);
app.use("/user", userRouter);
app.use("/board", boardRouter);
app.use("/product", productRouter);

// Oracle 데이터베이스와 연결을 유지하기 위한 전역 변수
let connection;

async function startServer() {
  try {
    await db.init();
    console.log('Successfully connected to Oracle database');

    app.listen(3010, () => {
      console.log('Server is running on port 3010');
    });

  } catch (err) {
    console.error('Error connecting to Oracle database. Server not started.', err);
    process.exit(1); // DB 연결 실패 시 프로세스 종료 (선택 사항)
  }
}

app.get("/qrcode", async (req, res) => {
  try {
    let qrImg = await QRcode.toDataURL("https://github.com/4288-yerim");
    res.send(
      `
      <img src=${qrImg}>
      `
    )
  } catch (err) {
    console.log(err);
  }
})
startServer();

// user


// 서버 시작
// app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });