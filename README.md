## 🖥 Project Summary
- 수업(course)과 사용자(user) App을 구현했습니다.

## 👩🏻‍💻 Work Details
- 다음과 같은 기능을 구현했습니다.
   - 유저 회원가입
   - 강의 생성
   - 강의 수정
   - 강의 오픈
   - 강의 삭제
   - 수강 신청
   - 강의 목록 조회
   - 강의 글 상세 조회
   - Unit test

## 🔧 Skills
- Node.js
- Mysql
- Express
- Mocha

## 🔧 Tools
- Visaul Studio Code
- Github


## 설계 방향, 구현 방법
- watch 도구
   - nodemon을 사용했습니다.
- 모델링
   - 강의 카테고리가 추가될 가능성이 있어서 카테고리 테이블(course_categories)을 추가하여 강의(courses) 테이블의 부모 테이블로 연결했습니다.
   - 강의(courses) 테이블과 수강생(students) 테이블을 '다:다' 관계로 연결하기 위해 중계 테이블(course_students)을 추가했습니다.

- 프로젝트 구조
   - 라우팅을 깔끔하게 관리하기 위해 관련 있는 라우터끼리 분류하여 파일(users, courses)로 분리했습니다. 라우터는 routes 폴더에 저장했습니다.
   - CORS 미들웨어를 사용하여, 모든 CORS Request를 허용했습니다.
   - mysql 연결 시용하는 아이디, 패스워드 등은 보안을 위해 settings.js 내부에 모듈로 분류하여 사용했습니다.
   - mysql.createPool()
      - 트랜잭션을 처리하는 경우엔 여러 개의 쿼리문이 연결(connection)을 공유해야하므로 pool.getConnection()를 사용했습니다.
      - 여러 개의 쿼리문이 테이블의 데이터 객체를 공유하는 경우(가령, 한 개의 쿼리문으로 가져온 데이터 객체를 이어지는 쿼리문에서 사용하는 경우) pool.getConnection()를 사용했습니다.
      - 반면, 복잡하지 않은 단일 쿼리문의 경우 pool.query()를 사용했습니다.

- DB 구축
   - directquery.js 파일을 활용하여 SQL문으로 DB를 구축했습니다.
   - 'mysql2/promise' 모듈을 활용하여 mysql과 연동했습니다.

- validation
   - 'express-validator'로 유효성 검사를 실시했습니다.
   - 유효성 검사 체크 코드들은 settings.js 안에 api별로 분리했습니다.

## 구현하면서 했던 고민들...
- createConnection vs createPool
   - 테스트 과제를 진행하면서 처음으로 'mysql.createPool'과 'mysql.createConnection'의 차이점에 대해 알게 됐습니다.
   - 단일 연결 방식인 createConnection()이 비용, 시간 측면에서 비효율을 초래한다는 사실을 알게 되어 createPool을 사용했습니다.
   - mysql과 연결할 때, 'pool.query()'와 'pool.getConnection()'중에서 상황 별로 적합한 방법을 적용하려 노력했습니다.(완벽하진 않습니다..)

- 강의 목록 조회 api
   - 수강생ID로 강의 검색이 가능하도록 하기 위해, 쿼리문을 두 개로 분리했습니다. 하나는 수강생ID로 신청된 강의를 조회하는 쿼리문이고,
   다른 하나는 조건에 맞는 강의 목록을 조회하는 쿼리문입니다.
   - 두 개의 쿼리문이 서로 연결되므로 'pool.getConnection()'을 사용했습니다.
   - 요구 사항에서 '전체 카테고리 검색도 가능해야 합니다.'가 있었는데, 요구 기능이 무엇인지 정확히 이해되지 않아, 구현하지 않았습니다.
   - 날짜 모듈로 moment.js를 사용했습니다.

- unit test
   - unit test는 mocha, chai, chai-http를 사용하여 진행했습니다.
   - test 파일은 test 폴더 내부에 저장했습니다. (courses.test.js, users.test.js)


## 실행방법(Mac)
- 우선 mysql에서 database를 생성해야 합니다. database를 생성하신 후,  디렉터리에 있는 course_dump.sql 파일을 사용자의 DB에 import 합니다.
- mysql 연결을 위해, settings.js 안의 db_config를 사용자에 맞게 수정합니다. host, user, password 등을 사용자에 맞게 설정해주세요.
- watch 도구를 npm으로 설치합니다. 저는 global로 설치한 nodemon을 사용했기 때문에, package.json 에는 nodemon이 존재하지 않습니다.
- watch 도구를 설치하셨다면 app.js 파일을 실행시져 줍니다. ex) nodemon app.js
- 'localhost:8000'으로 서버가 열렸습니다. 이제 postman 등을 사용하여 request를 요청하여 테스트를 해주시면 됩니다.

## 엔드포인트
- POST 데이터를 보낼 때에는 JSON 형식으로 보내주시길 바랍니다.
- 회원 가입 
   - http://localhost:8000/users/sign-up
   - body에 담을 데이터
      - identification
      - email
      - nickname

- 강의 목록 조회(GET)
   - http://localhost:8000/courses/course-list
   - body에 담을 데이터1
      - order_by_type : studentNum (선택)
      - 입력하시면 수강생 기준 내림차순 정렬됩니다.  
      - 입력을 생략하시면 최신순으로 정렬됩니다.
   - body에 담을 데이터2
      - identification, instructor_name, category_name 중 하나를 골라 입력하시면 됩니다. (필수)
      - ex) 
      order_by_type : studentNum
      identification : fcfargo


- 강의 상세 조회(GET)
   - http://localhost:8000/courses/1
   ex) http://localhost:8000/courses/5

- 강의 등록
   - http://localhost:8000/courses/course-create
   - body에 담을 데이터
      - name
      - description 
      - price
      - category_id 
      - instructor_id

   ex)
   {
      "name" : "php기초 강의",
      "description" : "웹 개발에 필요한 php 기초 강의",
      "price" : 150000,
      "category_id" : 1,
      "instructor_id" : 1
   }

- 강의 수정
   - http://localhost:8000/courses/course-update
   - body에 담을 데이터
      - course_id
      - name
      - description
      - price
   ex)
   {
      "course_id" : 20,
      "name" : "php기초 강의",
      "description" : "웹 개발에 필요한 php 기초 및 리눅스 기초 강의",
      "price" : 160000
   }

- 강의 오픈
   - http://localhost:8000/courses/course-open
   - body에 담을 데이터
      - course_id

- 강의 삭제
   - http://localhost:8000/courses/course-delete
   - body에 담을 데이터
      - course_id

- 강의 수강 등록
   - http://localhost:8000/courses/course-register
   - body에 담을 데이터
      - course_id
      - identification

## 유닛 테스트 실행(Mac)
- npm test
- 위 명령어를 실행하시면 유닛 테스트가 이뤄집니다. 총 25개의 테스트 케이스가 존재합니다.