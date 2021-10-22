const express                    = require('express');
const { body, validationResult } = require('express-validator');
const router                     = express.Router();
const moment                     = require('moment');

const settings                   = require('../settings')
const pool                       = require('../db_pool');

// 강의 등록 API
router.post(
    '/course-create', 
    settings.courseCreateValidator,
    async function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const body         = req.body;
        const name         = body.name;
        const description  = body.description;
        const price        = body.price;
        const categoryId   = body.category_id;
        const instructorId = body.instructor_id;

        // 강의명 중복 확인
        let [rows] = await pool.execute(
            'SELECT * FROM courses WHERE name = ?;', [name]
        )
        if (rows[0]){
            return res.status(400).json('message : COURSE_ALREADY_EXSISTS');
        }
        
        // 강사 존재 여부 확인
        [rows] = await pool.execute(
            'SELECT * FROM instructors WHERE id = ?;', [instructorId]
        )
        if (!rows[0]){
            return res.status(401).json('message : NOT_FOUND_INSTRUCTOR');
        }

        // 카테고리 존재 여부 확인
        [rows] = await pool.execute(
            'SELECT * FROM instructors WHERE id = ?;', [categoryId]
        )
        if (!rows[0]){
            return res.status(401).json('message : NOT_FOUND_CATEGORY');
        }

        // 강의 생성
        [rows] = await pool.query(
            'INSERT INTO courses(name, description, price, category_id, instructor_id) VALUES(?, ?, ?, ?, ?);',
            [name, description, price, categoryId, instructorId]
        );
        return res.status(200).json('message : SUCCESS');

    } catch(err) {
        return res.status(500).json(err)
    }
});

// 강의 수정 API
router.post(
    '/course-update', 
    settings.courseUpdateValidator,
    async function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const body         = req.body;
        const courseId     = body.course_id;
        const name         = body.name;
        const description  = body.description;
        const price        = body.price;

        // 강의 존재 여부 확인
        let [rows]  = await pool.execute(
            'SELECT * FROM courses WHERE id = ?;',[courseId]
        );
        if (!rows[0]){
            return res.status(401).json('message : NOT_FOUND_COURSE');
        };

        // 강의 수정
        [rows] = await pool.query(
            'UPDATE courses SET name = ?, description = ?, price = ? WHERE id = ?;',
            [name, description, price, courseId]
        );
        return res.status(200).json('message : SUCCESS');

    } catch(err) {
        return res.status(500).json(err)
    }
});

// 강의 오픈 API
router.post(
    '/course-open', 
    settings.courseOpenValidator,
    async function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const body     = req.body;
        const courseId = body.course_id;

        // 강의 존재 여부 확인
        let [rows]  = await pool.execute(
            'SELECT * FROM courses WHERE id = ?;',[courseId]
        );
        if (!rows[0]){
            return res.status(401).json('message : NOT_FOUND_COURSE');
        };

        // 강의 오픈
        [rows] = await pool.query(
            'UPDATE courses SET is_private = 0 WHERE id = ?;',
            [courseId]
        );
        return res.status(200).json('message : SUCCESS');

    } catch(err) {
        return res.status(500).json(err)
    }
});

// 강의 삭제 API
router.post(
    '/course-delete', 
    settings.courseDeleteValidator,
    async function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const body     = req.body;
        const courseId = body.course_id;

        // 강의 존재 여부 확인
        let [rows, fields]  = await pool.execute(
            'SELECT * FROM courses WHERE id = ?;',[courseId]
        );
        if (!rows[0]){
            return res.status(401).json('message : NOT_FOUND_COURSE');
        };

        // 수강생 존재 여부 확인
        [rows, fields]  = await pool.execute(
            'SELECT * FROM course_students WHERE course_id = ?;',[courseId]
        );
        if (rows[0]){
            return res.status(400).json('message : COURSE_STUDENTS_EXIST');
        };  

        // 강의 삭제
        [rows, fields] = await pool.query(
            'DELETE FROM courses WHERE id = ?;',
            [courseId]
        );
        return res.status(200).json('message : SUCCESS');

    } catch(err) {
        return res.status(500).json(err)
    }
});

// 수강 신청 API
router.post(
    '/course-register', 
    settings.courseRegisterValidator,
    async function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const body           = req.body;
        const courseId       = body.course_id;
        const identification = body.identification; 
        
        const connection = await pool.getConnection()

        try {
            // 강의 수강 신청 가능 여부 확인
            let [rows, fields]  = await connection.query(
                'SELECT * FROM courses WHERE id = ? AND is_private = ?;',
                [courseId, false]
            );
            if (!rows[0]){
                return res.status(401).json('message : NOT_FOUND_COURSE');
            };

            // 수강생 가입 여부 확인
            [rows,fields] = await connection.query(
                'SELECT * FROM students WHERE identification = ?;',
                [identification]
            )
            if (!rows[0]){
                return res.status(401).json('message : NO_STUDENT_EXISTS');
            };
 
            const studentId = rows[0].id;

            // 중복 수강 여부 확인
            [rows,fields] = await connection.query(
                'SELECT * FROM course_students WHERE course_id = ? AND student_id = ?;',
                [courseId, studentId]  
            )
            if (rows[0]){
                return res.status(400).json('message : NO_DUPLICATE_REGISTERATION');
            }
            
            // 강의 수강 신청
            [rows,fields] = await connection.query(
                'INSERT INTO course_students(course_id, student_id) VALUES(?, ?);',
                [courseId, studentId]  
            )
            return res.status(200).json('message : SUCCESS');

        } finally {
            connection.release()
        }

    } catch (err) {
        return res.status(500).json(err)
    } 
});

// 강의 목록 조회 API
router.get(
    '/course-list', 
    async function(req, res) {
    try {
        const queryStr = req.query;
        if (!queryStr){
            return res.status(400).json('message : INVALID_QUERY_STRING');
        };

        const sqlFirst = "SELECT c.id AS courseId, c.name AS courseName, c.description, \
        cc.name AS categoryName, i.name AS instructorName, c.price, c.created_at AS createdAt, \
        (SELECT COUNT(*) FROM course_students AS cs WHERE cs.course_id = c.id) AS studentNum\
        FROM courses AS c \
        INNER JOIN instructors AS i ON c.instructor_id = i.id \
        INNER JOIN course_categories AS cc ON c.category_id = cc.id \
        WHERE c.is_private='false'"

        const connection = await pool.getConnection()

        try {
            // queryStr의 key값에 따라 sql문을 다르게 정의 
            if (queryStr.course_name) {
                var sqlMiddle = ` AND c.name LIKE '%${queryStr.course_name}%'`;

            } else if (queryStr.instructor_name) {
                sqlMiddle     = ` AND i.name LIKE '%${queryStr.instructor_name}%'`;

            } else if (queryStr.category_name) {
                sqlMiddle     = ` AND cc.name LIKE '%${queryStr.category_name}%'`;

            } else if (queryStr.identification) {
                // 수강생 ID로 신청된 강의 조회
                let [courseStudObj]  = await connection.query(
                    'SELECT * FROM course_students AS cs WHERE cs.student_id = \
                    (SELECT students.id FROM students WHERE identification = ?);',
                    [queryStr.identification]
                );
                if (!courseStudObj[0]){
                    return res.status(400).json('message : NO_courseStudObj');
                }

                let courseIdLst = [];
                for (let i = 0; i < courseStudObj.length; i++) {
                    courseIdLst.push(courseStudObj[i].course_id);
                };
                sqlMiddle     = ` AND c.id IN (${courseIdLst})`;

            } else {
                return res.status(400).json('message : INVALID_QUERY_STRING');
            }; 

            // 정렬 조건에 따라 sql문을 다르게 정의
            if (queryStr.order_by_type == 'studentNum') {
                var sqlLast = ` ORDER BY ${queryStr.order_by_type} DESC;`;
            } else {
                sqlLast     = ` ORDER BY c.created_at DESC;`; 
            }
        
            // 강의 목록 조회
            let [courseObj]  = await connection.query(sqlFirst + sqlMiddle + sqlLast);
            if (!courseObj[0]) {
                return res.status(400).json('message : NO_courseObj');
            }

            let result = []
            for (let i = 0; i < courseObj.length; i++) {
                result.push(
                    {
                        "courseId"       : courseObj[i].courseId,
                        "categoryName"   : courseObj[i].categoryName,
                        "courseName"     : courseObj[i].courseName,
                        "instructorName" : courseObj[i].instructorName,
                        "price"          : courseObj[i].price,
                        "studentNum"     : courseObj[i].studentNum,
                        "createdAt"      : moment(courseObj[i].createdAt).format("YYYY년 MM월 DD일 HH:mm:ss")
                    }
                )
            };
            return res.status(200).json({"result" : result})

        } finally {
            connection.release()
        }
    } catch (err) {
        return res.status(500).json(err)
    } 
});

// 강의 상세 조회 API
router.get(
    '/:course_id',
    async function(req, res) {
    try {
        const courseId = req.params.course_id;

        // 수강생 존재 여부 확인
        let [rows] = await pool.execute(
            'SELECT * FROM course_students AS cs WHERE cs.course_id = ?;',
            [courseId]
        )
        if (rows[0]){
            var sql = 'SELECT c.name AS courseName, c.description, cc.name AS categoryName, \
            (SELECT COUNT(*) FROM course_students AS cs WHERE cs.course_id = c.id) AS studentNum, \
            c.price,  c.created_at AS createdAt, c.updated_at AS updatedAt, \
            (SELECT identification FROM students AS s WHERE s.id=cs.student_id) AS studentId, \
            cs.created_at AS registered_at\
            FROM courses AS c \
            INNER JOIN course_categories AS cc ON c.category_id = cc.id \
            INNER JOIN course_students AS cs ON c.id = cs.course_id \
            WHERE c.id = ?;'
        
        } else {
            sql = 'SELECT c.name AS courseName, c.description, cc.name AS categoryName, \
            (SELECT COUNT(*) FROM course_students AS cs WHERE cs.course_id = c.id) AS studentNum, \
            c.price,  c.created_at AS createdAt, c.updated_at AS updatedAt \
            FROM courses AS c \
            INNER JOIN course_categories AS cc ON c.category_id = cc.id \
            WHERE c.id = ?;'
        };

        // 강의 상세 조회
        [courseObj] = await pool.execute(sql, [courseId])
        if (!courseObj[0]){
            return res.status(401).json('message : NOT_FOUND_COURSE');
        }

        let studentInfoLst = [];
        for (let i = 0; i < courseObj.length; i++) {
            if (courseObj[i].studentId) {
                let now = moment(courseObj[i].registered_at)
                studentInfoLst.push(
                    {
                        "idenfication"  : courseObj[i].studentId,
                        "registered_at" : now.format("YYYY년 MM월 DD일 HH:mm:ss")
                    }
                );
            } else {
                studentInfoLst = null
                break;
            };
        };

        const result = [{
            "courseName"      : courseObj[0].courseName,
            "description"     : courseObj[0].description,
            "categoryName"    : courseObj[0].categoryName,
            "price"           : courseObj[0].price,
            "studentNum"      : courseObj[0].studentNum,
            "createdAt"       : moment(courseObj[0].createdAt).format("YYYY년 MM월 DD일 HH:mm:ss"),
            "updatedAt"       : moment(courseObj[0].updatedAt).format("YYYY년 MM월 DD일 HH:mm:ss"),
            "studentInfoLst" : studentInfoLst
        }]
        return res.status(200).json({"result" : result})
        
    } catch(err) {
        return res.status(500).json(err)
    }
});

module.exports = router