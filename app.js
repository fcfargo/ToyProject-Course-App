const express   = require('express');
const cors      = require('cors');
const mysql     = require('mysql2/promise');
const app       = express();

const user      = require('./routes/users')
const course    = require('./routes/courses')
const settings  = require('./settings');

// 서버 생성
const server = app.listen(8000, () => 
 console.log('Start Server: localhost:8000')
);

// request의 body 데이터에 접근하기 위해 미들웨어 등록
app.use(express.json() );
app.use(express.urlencoded( {extended : true } ));

// users.js를 미들웨어로 등록
app.use('/users', user)

// courses.js를 미들웨어로 등록
app.use('/courses', course)

// CORS 미들웨어 등록
app.use(cors());

// 오류 처리 미들웨어 등록
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('JsonDecodeError!')
});

module.exports = server