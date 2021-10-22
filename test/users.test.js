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
});

// Tear down
after(async function(){
    console.log('TearDown')
    let [rows] = await pool.execute(
        "DELETE FROM students WHERE students.identification = 'magicman';"
    );
    console.log('TestEnd!!')
});

// 회원가입 test
describe('test_users_signup', () => {
    describe("POST /users/sign-up success", () => {
        it("It shoud POST users", (done) => {
            const body = {
                identification : 'magicman',
                email : 'magic@gmail.com',
                nickname : '매직박'
            }
            chai.request(server)
                .post("/users/sign-up")
                .send(body)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.text.should.be.include('SUCCESS');
                done();
                });
        });
    });

    describe("POST /users/sign-up not_found_course", () => {
        it("It shoud POST users", (done) => {
            const body = {
                identification : 'magicman',
                email : 'magic@gmail.com',
                nickname : '매직박'
            }
            chai.request(server)
                .post("/users/sign-up")
                .send(body)
                .end((err, response) => {
                    response.should.have.status(400);
                    response.text.should.be.include('DUPLICATE_ID');
                done();
                });
        });
    });

    describe("POST /users/sign-up not_found_course", () => {
        it("It shoud POST users", (done) => {
            const body = {
                identification : 'magicwoman',
                email : 'magic@gmail.com',
                nickname : '매직박'
            }
            chai.request(server)
                .post("/users/sign-up")
                .send(body)
                .end((err, response) => {
                    response.should.have.status(400);
                    response.text.should.be.include('DUPLICATE_EMAIL');
                done();
                });
        });
    });

    describe("POST /users/sign-up not_found_course", () => {
        it("It shoud POST users", (done) => {
            const body = {
                identification : 'magicwoman',
                email : 'wow@gmail.com',
                nickname : '매직박'
            }
            chai.request(server)
                .post("/users/sign-up")
                .send(body)
                .end((err, response) => {
                    response.should.have.status(400);
                    response.text.should.be.include('DUPLICATE_NICKNAME');
                done();
                });
        });
    });
});