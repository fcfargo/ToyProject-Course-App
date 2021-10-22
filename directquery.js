const settings   = require('./settings');
const mysql      = require("mysql2/promise");




const directquery = async (sql) => {

    const connection = await mysql.createConnection(settings.db_config);
    
    try {
        const [rows, fields] = await connection.execute(sql)

        connection.end()

    } catch (e) {
        console.log(e);
    } 
};
const sql = '';
directquery(sql)