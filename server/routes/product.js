const express = require('express');
const oracledb = require('oracledb');
const db = require("../db");
const router = express.Router();


router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const result = await connection.execute(
      `SELECT * FROM PRODUCT`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({
      result: "success",
      list: result.rows
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  } finally {
    await connection.close();
  }
});

router.get('/view/:productNo', async (req, res) => {
  const { productNo } = req.params;
  let connection;
  try {
    connection = await db.getConnection();
    const result = await connection.execute(
      `
        SELECT *
        FROM PRODUCT WHERE PRODUCT_ID = :productNo
      `,
      [productNo],
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
  } finally {
    await connection.close();
  }
});

router.post('/', async (req, res) => {
  const { id, name, brand, price, desc } = req.body;
  let pid = id;
  let desciption = desc;
  let connection;
  try {
    connection = await db.getConnection();
    const result = await connection.execute(
      `
        INSERT INTO PRODUCT(PRODUCT_ID, PRODUCT_NAME, BRAND, PRICE, DESCRIPTION)
        VALUES(:pid, :name, :brand, :price, :desciption)
      `,
      [pid, name, brand, price, desciption],
      // result 안에 rows는 키 안에 json형태로 db데이터를 반환
      {autoCommit : true}
    );

    res.json({
        result : "success"
    });

  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  } finally {
    await connection.close();
  }
});

module.exports = router;