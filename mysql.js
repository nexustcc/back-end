const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "dbNexusTCC",
});

connection.connect((err) => {
    if (err) {
        throw err;
    }
    console.log("mysql conected");
});

module.exports = connection;