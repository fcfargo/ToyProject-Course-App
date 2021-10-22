const express                    = require('express');
const { body, validationResult } = require('express-validator');
const router                     = express.Router();

const settings                   = require('../settings')
const pool                       = require('../db_pool');

router.post(
    '/sign-up',
    settings.studentCreateValidator,
    async function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try { 
        const body           = req.body;
        const identification = body.identification;
        const email          = body.email;
        const nickname       = body.nickname;

        // ID 중복 체크
        let [rows] = await pool.execute(
            'SELECT * FROM students WHERE  identification = ?;', [identification]
        );
        if (rows[0]){
            return res.status(400).json('message : DUPLICATE_ID_ERROR');
        };
       
        // email 중복 체크
        [rows] = await pool.execute(
            'SELECT * FROM students WHERE  email = ?;', [email]
        );
        if (rows[0]){
            return res.status(400).json('message : DUPLICATE_EMAIL_ERROR');
        };

        // nickname 중복 체크
        [rows] = await pool.execute(
            'SELECT * FROM students WHERE  nickname = ?;', [nickname]
        );
        if (rows[0]){
            return res.status(400).json('message : DUPLICATE_NICKNAME_ERROR');
        };
        
        // students 데이터 생성
        [rows] = await pool.query(
            'INSERT INTO students(identification, email, nickname) VALUES(?, ?, ?);',
            [identification, email, nickname]
        );
        return res.status(200).json('message : SUCCESS');

    } catch (err) { 
        return res.status(500).json(err)
    } 
});

module.exports = router