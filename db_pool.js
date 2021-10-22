const mysql = require("mysql2/promise");

const settings = require('./settings');

// mysql 연결
const pool =  mysql.createPool(settings.db_config);

module.exports = pool