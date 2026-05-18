const express = require('express');
const cors = require('cors');
const path = require('path');
const oracledb = require('oracledb');

const app = express();
app.use(cors());

// ejs 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '.')); // .은 경로
app.use(express.json());

const config = {
  user: 'SYSTEM',
  password: 'test1234',
  connectString: 'localhost:1521/xe'
};

// Oracle 데이터베이스와 연결을 유지하기 위한 전역 변수
let connection;

async function startServer() {
  try {
    connection = await oracledb.getConnection(config);
    console.log('Successfully connected to Oracle database');

    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });

  } catch (err) {
    console.error('Error connecting to Oracle database. Server not started.', err);
    process.exit(1); // DB 연결 실패 시 프로세스 종료 (선택 사항)
  }
}

startServer();

// RESTful API 적용
app.get('/student', async (req, res) => {
  const { } = req.query;
  try {
    const result = await connection.execute(
      `SELECT * FROM STUDENT`,
      [],
      {outFormat : oracledb.OUT_FORMAT_OBJECT}
    );
    // const columnNames = result.metaData.map(column => column.name);
    // // 쿼리 결과를 JSON 형태로 변환
    // const rows = result.rows.map(row => {
    //   // 각 행의 데이터를 컬럼명에 맞게 매핑하여 JSON 객체로 변환
    //   const obj = {};
    //   columnNames.forEach((columnName, index) => {
    //     obj[columnName] = row[index];
    //   });
    //   return obj;
    // });
    res.json({
        result : "success",
        list : result.rows
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

app.delete('/student/:stuNo', async (req, res) => {
  const { stuNo } = req.params;

  try {
    const result = await connection.execute(
      `DELETE FROM STUDENT WHERE STU_NO = :stuNo`,
      [stuNo],
      {autoCommit : true}
    );

    res.json({
        result : "success",
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

app.post('/student', async (req, res) => {
  const { stuNo, stuName, stuDept, stuGrade } = req.body;

  try {
    const result = await connection.execute(
      `INSERT INTO STUDENT (STU_NO, STU_NAME, STU_DEPT, STU_GRADE) VALUES(:stuNo, :stuName, :stuDept, :stuGrade)`,
      [stuNo, stuName, stuDept, stuGrade],
      {autoCommit : true}
    );

    res.json({
        result : "success",
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

app.get('/student/:stuNo', async (req, res) => {
  const { stuNo } = req.params;
  try {
    const result = await connection.execute(
      `
        SELECT 
        STU_NO AS "stuNo",
        STU_NAME AS "stuName",
        STU_DEPT AS "stuDept",
        STU_GRADE AS "stuGrade"
        FROM STUDENT WHERE STU_NO = :stuNo
      `,
      [stuNo],
      // result 안에 rows는 키 안에 json형태로 db데이터를 반환
      {outFormat : oracledb.OUT_FORMAT_OBJECT}
    );

    res.json({
        result : "success",
        info : result.rows[0]
    });

  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

app.put('/student/:stuNo', async (req, res) => {
  const { stuNo } = req.params;
  const { stuName, stuDept, stuGrade} = req.body;

  try {
    const result = await connection.execute(
      `
        UPDATE STUDENT SET 
        STU_NAME = :stuName, 
        STU_DEPT = :stuDept, 
        STU_GRADE = :stuGrade 
        WHERE STU_NO = :stuNo
      `,
      [stuName, stuDept, stuGrade, stuNo],
      {autoCommit : true}
    );

    res.json({
        result : "success",
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

// user
app.get('/login', async (req, res) => {
  const { userId, pwd } = req.query;
  try {
    const result = await connection.execute(
      `SELECT * FROM TBL_USER WHERE USERID = :userId AND PWD = :pwd`,
      [userId, pwd],
      {outFormat : oracledb.OUT_FORMAT_OBJECT}
    );

    res.json({
        result : "success",
        list : result.rows
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

app.post('/login', async (req, res) => {
  const { userId, pwd } = req.body;
  try {
    const result = await connection.execute(
      `SELECT * FROM TBL_USER WHERE USERID = :userId AND PWD = :pwd`,
      [userId, pwd],
      {outFormat : oracledb.OUT_FORMAT_OBJECT}
    );
    
    res.json({
        result : "success",
        list : result.rows
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

// 서버 시작
// app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });