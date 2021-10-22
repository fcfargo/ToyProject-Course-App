let chai           = require("chai");
let chaiHttp       = require("chai-http");
const { response } = require("express");
let server         = require("../app");
const pool         = require('../db_pool');

// Assertion Style
chai.should();
chai.use(chaiHttp);

// Set up
before(async function(){
    console.log('SetUp')
    let [rows] = await pool.execute(
        "INSERT INTO courses(name, description, price, category_id, instructor_id, is_private) \
        VALUES('파이썬 심화', '파이선 언어를 심도있게 알려드립니다. closer, generator, deep copy 내용 포함', 100000, 1, 1, 0);"
    );

    [rows] = await pool.execute(
        "INSERT INTO courses(name, description, price, category_id, instructor_id) \
        VALUES('Node.js 고급', 'Node.js 고급 과정입니다. promise, 자료 구조 내용 등을 포함', 100000, 1, 2);"
    );

    [rows] = await pool.query(
        "INSERT INTO students(identification, email, nickname) VALUES('joyworld','joy@gmail.com','김풍');"
    );

    [rows] = await pool.execute(
        "INSERT INTO instructors(name, email) VALUES('김코딩', 'kim@gmail.com');"
    );

    [courseObj] = await pool.execute(
        "SELECT * FROM courses WHERE courses.name = '파이썬 심화';"
    );
    [courseObjDel] = await pool.execute(
        "SELECT * FROM courses WHERE courses.name = 'Node.js 고급';"
    );

    global.TestcourseId    = parseInt(courseObj[0].id)
    global.TestcourseIdDel = parseInt(courseObjDel[0].id)

});

// Tear down
after(async function(){
    console.log('TearDown')
    let [rows] = await pool.execute(
        "DELETE FROM courses WHERE courses.name = '웹 크롤링 기초 강의';"
    );

    [rows] = await pool.execute(
        "DELETE FROM courses WHERE courses.name = '파이썬 심화';"
    );

    [rows] = await pool.execute(
        "DELETE FROM students WHERE students.identification = 'joyworld';"
    );

    [rows] = await pool.execute(
        "DELETE FROM instructors WHERE instructors.name = '김코딩';"
    );

    console.log('TestEnd!!')
});

// 강의 상세 조회 test
describe('test_course_details', () => {
    describe("GET /courses/course-list success", () => {
        it("It shoud GET details", (done) => {
            chai.request(server)
                .get("/courses/" + TestcourseId)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.result.length.should.be.eq(1);
                    response.body.result[0].should.have.property('courseName');
                    response.body.result[0].should.have.property('description');
                    response.body.result[0].should.have.property('categoryName');
                    response.body.result[0].should.have.property('price');
                    response.body.result[0].should.have.property('studentNum');
                    response.body.result[0].should.have.property('createdAt');
                    response.body.result[0].should.have.property('updatedAt');
                    response.body.result[0].should.have.property('studentInfoLst');    
                done();
                });
        });
    });

    describe("GET /courses/course-list not_found_course", () => {
        it("It shoud throw err", (done) => {
            const TestcourseId = 9999
            chai.request(server)
                .get("/courses/" + TestcourseId)
                .end((err, response) => {
                    response.should.have.status(401);
                    response.text.should.be.include('NOT_FOUND');
                done();
                });
        });
    });
});

// // 강의 목록 보기 test
describe('test_course_list', () => {
    describe("GET /courses/course-list success", () => {
        it("It shoud GET list", (done) => {
            const queryStr = {
                identification : 'fcfargo',
                order_by_type  : 'studentNum'
            };
            chai.request(server)
                .get("/courses/course-list")
                .query(queryStr)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.result[0].should.have.property('courseId');
                    response.body.result[0].should.have.property('categoryName');
                    response.body.result[0].should.have.property('courseName');
                    response.body.result[0].should.have.property('instructorName');
                    response.body.result[0].should.have.property('price');
                    response.body.result[0].should.have.property('studentNum');
                    response.body.result[0].should.have.property('createdAt');
                done();
                });
        });
    });

    describe("GET /courses/course-list invalid_query_string", () => {
        it("It shoud throw err", (done) => {
            const queryStr = {};
            chai.request(server)
                .get("/courses/course-list")
                .query(queryStr)
                .end((err, response) => {
                    response.should.have.status(400);
                    response.text.should.be.include('INVALID_QUERY');
                done();
                });
        });
    });

    describe("GET /courses/course-list no_courseStudObj", async () => {
        it("It shoud throw err", (done) => {
            const queryStr = {
                identification : 'joyworld',
                order_by_type  : 'studentNum'             
            };
            chai.request(server)
                .get("/courses/course-list")
                .query(queryStr)
                .end((err, response) => {
                    response.should.have.status(400);
                    response.text.should.be.include('courseStudObj');
                done();
                });
        });
    });

    describe("GET /courses/course-list no_courseObj", () => {
        it("It shoud throw err", (done) => {
            const queryStr = {
                instructor_name : '김코딩'
            };
            chai.request(server)
                .get("/courses/course-list")
                .query(queryStr)
                .end((err, response) => {
                    response.should.have.status(400);
                    response.text.should.be.include('courseObj');
                    
                done();
                });
        });
    });
});

// 강의 등록 test
describe('test_course_create', () => {
    describe("POST /courses/course-create success", () => {
        it("It shoud POST courses", (done) => {
            const body = {
                name : '웹 크롤링 기초 강의',
                description : 'selenium을 활용한 python 웹 크롤링의 기초에 대해 알려드립니다.',
                price : 80000,
                category_id : 1,
                instructor_id : 3
            }
            chai.request(server)
                .post("/courses/course-create")
                .send(body)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.text.should.be.include('SUCCESS');    
                done();
                });
        });
    });

    describe("POST /courses/course-create course_already_exists", () => {
        it("It shoud throw err", (done) => {
            const body = {
                name : '웹 크롤링 기초 강의',
                description : 'selenium을 활용한 python 웹 크롤링의 기초에 대해 알려드립니다.',
                price : 80000,
                category_id : 1,
                instructor_id : 3
            }
            chai.request(server)
                .post("/courses/course-create")
                .send(body)
                .end((err, response) => {
                    response.should.have.status(400);
                    response.text.should.be.include('ALREADY_EXSISTS');    
                done();
                });
        });
    });

    describe("POST /courses/course-create not_found_instructor", () => {
        it("It shoud throw err", (done) => {
            const body = {
                name : 'JAVA 기초 강의',
                description : '웹 개발 JAVA 기초',
                price : 150000,
                category_id : 1,
                instructor_id : 9999
            }
            chai.request(server)
                .post("/courses/course-create")
                .send(body)
                .end((err, response) => {
                    response.should.have.status(401);
                    response.text.should.be.include('_INSTRUCTOR');    
                done();
                });
        });
    });

    describe("POST /courses/course-create not_found_category", () => {
        it("It shoud throw err", (done) => {
            const body = {
                name : 'JAVA 기초 강의',
                description : '웹 개발 JAVA 기초',
                price : 150000,
                category_id : 9999,
                instructor_id : 3
            }
            chai.request(server)
                .post("/courses/course-create")
                .send(body)
                .end((err, response) => {
                    response.should.have.status(401);
                    response.text.should.be.include('_CATEGORY');    
                done();
                });
        });
    });
});

// 강의 수정 test
describe('test_course_update', async () => {
    describe("POST /courses/course-update success", () => {
        it("It shoud POST courses", (done) => {      
            const body = {
                course_id : parseInt(TestcourseId),
                name : '파이썬 심화',
                description : 'selenium을 활용한 python 웹 크롤링의 기초에 대해 알려드립니다.',
                price : 80000,
            }
            chai.request(server)
                .post("/courses/course-update")
                .send(body)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.text.should.be.include('SUCCESS');    
                done();
                });
        });
    });

    describe("POST /courses/course-update not_found_course", () => {
        it("It shoud throw err", (done) => {      
            const body = {
                course_id : 9999,
                name : '파이썬 심화',
                description : 'selenium을 활용한 python 웹 크롤링의 기초에 대해 알려드립니다.',
                price : 80000,
            }
            chai.request(server)
                .post("/courses/course-update")
                .send(body)
                .end((err, response) => {
                    response.should.have.status(401);
                    response.text.should.be.include('_COURSE');    
                done();
                });
        });
    });
});

// 강의 오픈 test
describe('test_course_open', async () => {
    describe("POST /courses/course-open success", () => {
        it("It shoud POST courses", (done) => {     
            const body = {
                course_id : parseInt(TestcourseId),
            }
            chai.request(server)
                .post("/courses/course-open")
                .send(body)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.text.should.be.include('SUCCESS');    
                done();
                });
        });
    });

    describe("POST /courses/course-open not_found_course", () => {
        it("It shoud throw err", (done) => {      
            const body = {
                course_id : 9999,
            }
            chai.request(server)
                .post("/courses/course-open")
                .send(body)
                .end((err, response) => {
                    response.should.have.status(401);
                    response.text.should.be.include('_COURSE');    
                done();
                });
        });
    });
});

// 강의 삭제 test
describe('test_course_delete', () => {
    describe("POST /courses/course-delete success", () => {
        it("It shoud POST courses", (done) => {      
            const body = {
                course_id : parseInt(TestcourseIdDel),
            }
            chai.request(server)
                .post("/courses/course-delete")
                .send(body)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.text.should.be.include('SUCCESS');    
                done();
                });
        });
    });

    describe("POST /courses/course-delete not_found_course", () => {
        it("It shoud throw err", (done) => {      
            const body = {
                course_id : 9999,
            }
            chai.request(server)
                .post("/courses/course-delete")
                .send(body)
                .end((err, response) => {
                    response.should.have.status(401);
                    response.text.should.be.include('_COURSE');    
                done();
                });
        });
    });

    describe("POST /courses/course-delete students_exist", () => {
        it("It shoud throw err", (done) => {      
            const body = {
                course_id : 1,
            }
            chai.request(server)
                .post("/courses/course-delete")
                .send(body)
                .end((err, response) => {
                    response.should.have.status(400);
                    response.text.should.be.include('STUDENTS_EXIST');    
                done();
                });
        });
    });
});

// 수강 신청 API
describe('test_course_register', () => {
    describe("POST /courses/course-register success", () => {
        it("It shoud POST courses", (done) => {     
            const body = {
                course_id : parseInt(TestcourseId),
                identification : "joyworld"
            }
            chai.request(server)
                .post("/courses/course-register")
                .send(body)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.text.should.be.include('SUCCESS');    
                done();
                });
        });
    });

    describe("POST /courses/course-register not_found_course", () => {
        it("It shoud throw err", (done) => {     
            const body = {
                course_id : 9999,
                identification : "joyworld"
            }
            chai.request(server)
                .post("/courses/course-register")
                .send(body)
                .end((err, response) => {
                    response.should.have.status(401);
                    response.text.should.be.include('_FOUND_COURSE');    
                done();
                });
        });
    });

    describe("POST /courses/course-register no_student_exists", () => {
        it("It shoud throw err", (done) => {     
            const body = {
                course_id : parseInt(TestcourseId),
                identification : "존재하지 않는 학생"
            }
            chai.request(server)
                .post("/courses/course-register")
                .send(body)
                .end((err, response) => {
                    response.should.have.status(401);
                    response.text.should.be.include('_STUDENT_EXISTS');    
                done();
                });
        });
    });

    describe("POST /courses/course-register no_duplicate_register", () => {
        it("It shoud throw err", (done) => {     
            const body = {
                course_id : 1,
                identification : "fcfargo"
            }
            chai.request(server)
                .post("/courses/course-register")
                .send(body)
                .end((err, response) => {
                    response.should.have.status(400);
                    response.text.should.be.include('_DUPLICATE');    
                done();
                });
        });
    });
});