// Use the MariaDB Node.js Connector
var mariadb = require('mariadb');
 
// Create a connection pool
var pool = 
  mariadb.createPool({
    host: "127.0.0.1", // IF USING LOCAL DB
    // host: "172.16.122.21",
    port: 3306,
    // user: "test2",
    user: "root", // IF USING LOCAL DB
    password: "password",
    // database: "test"
    database: "Test" // IF USING LOCAL DB
  });
 
// Expose a method to establish connection with MariaDB SkySQL
module.exports = Object.freeze({
  pool: pool
});