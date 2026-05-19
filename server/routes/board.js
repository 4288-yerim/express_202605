const express = require('express');
const oracledb = require('oracledb');
const db = require("../db");
const router = express.Router();

router.get('/', async (req, res) => {
  const { keyword = '', sortOption = 'date' } = req.query;
  let connection;

  try {
    connection = await db.getConnection();

    let orderBy = 'CDATETIME DESC';

    if (sortOption == "date") {
      orderBy = 'CDATETIME DESC';
    } else if (sortOption == "title") {
      orderBy = 'TITLE ASC';
    } else if (sortOption == "view") {
      orderBy = 'CNT DESC';
    }

    const result = await connection.execute(
      `SELECT
        BOARDNO AS "boardNo",
        USERID AS "userId",
        TITLE AS "title",
        CONTENTS AS "contents",
        CNT AS "cnt",
        TO_CHAR(CDATETIME, 'YY.MM.DD') AS "cdateTime"
      FROM TBL_BOARD
      WHERE TITLE LIKE '%' || :keyword || '%'
      ORDER BY ${orderBy}`,
      { keyword },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({
      result: "success",
      list: result.rows
    });

  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: error.message });

  } finally {
    await connection.close();
  }
});

router.get('/:boardNo', async (req, res) => {
  const { boardNo } = req.params;
  let connection;
  try {
    connection = await db.getConnection();
    const result = await connection.execute(
      `
      SELECT
        BOARDNO AS "boardNo",
        USERID AS "userId",
        TITLE AS "title",
        CONTENTS AS "contents",
        CNT AS "cnt",
        TO_CHAR(CDATETIME, 'YY.MM.DD') AS "cdateTime"
      FROM TBL_BOARD
      WHERE BOARDNO = :boardNo
      `,
      [boardNo],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({
      result : "success",
      info : result.rows[0]
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: error.message });
  } finally {
    await connection.close();
  }
});

router.delete('/:boardNo', async (req, res) => {
  const { boardNo } = req.params;
  let connection;
  try {
    connection = await db.getConnection();
    const result = await connection.execute(
      `DELETE FROM TBL_BOARD WHERE BOARDNO = :boardNo`,
      [boardNo],
      {autoCommit : true}
    );

    res.json({
        result : "success",
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  } finally {
    await connection.close();
  }
});

router.put('/:boardNo', async (req, res) => {
  const { boardNo } = req.params;
  const { title, contents } = req.body;

  let connection;
  try {
    connection = await db.getConnection();
    const result = await connection.execute(
      `
        UPDATE TBL_BOARD SET 
        TITLE = :title, 
        CONTENTS = :contents 
        WHERE BOARDNO = :boardNo
      `,
      [title, contents, boardNo],
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

router.post('/', async (req, res) => {
  const { userId, title, contents, kind } = req.body;

  let connection;
  try {
    connection = await db.getConnection();
    const result = await connection.execute(
      `INSERT INTO TBL_BOARD (BOARDNO, USERID, TITLE, CONTENTS, KIND, CNT, CDATETIME, UDATETIME) 
      VALUES(BOARD_SEQ.NEXTVAL, :userId, :title, :contents, :kind, 0, SYSDATE, SYSDATE)`,
      [userId, title, contents, kind],
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

module.exports = router;