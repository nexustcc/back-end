const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "bcd127",
    database: "dbNexusTCC",
});

connection.connect((err) => {
    if (err) {
        throw err;
    }
    console.log("mysql conected");
});

module.exports = connection;