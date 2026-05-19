const express = require('express');
const oracledb = require('oracledb');
const db = require("../db");
const bcrypt = require('bcrypt');
const router = express.Router();

const saltRounds = 10;

router.post('/login', async (req, res) => {
  const { userId, pwd } = req.body;
  try {
    let connection = await db.getConnection();
    const result = await connection.execute(
      `SELECT * FROM TBL_USER WHERE USERID = :userId`,
      [userId],
      {outFormat : oracledb.OUT_FORMAT_OBJECT}
    );
    console.log(result.rows);
    let message = "";
    let info = {};

    if(result.rows.length > 0) {
      match = await bcrypt.compare(pwd, result.rows[0].PWD);
      
      message = "success";
      info = {
        userId : result.rows[0].USERID,
        userName : result.rows[0].USERNAME,
      }
    } else {
      // 로그인 실패 - 아이디 맞는거 없음
      message = "fail";
    }


    res.json({
        result : message,
        info : info,
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

router.post('/join', async (req, res) => {
  const { userId, pwd, userName } = req.body;
  const hashPwd = await bcrypt.hash(pwd, saltRounds);
  try {
    let connection = await db.getConnection();
    const result = await connection.execute(
      `INSERT INTO TBL_USER (USERID, PWD, USERNAME) VALUES(:userId, :hashPwd, :userName)`,
      [userId, hashPwd, userName],
      {autoCommit : true}
    );
    console.log(result);
    res.json({
        result : "success",
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

module.exports = router;