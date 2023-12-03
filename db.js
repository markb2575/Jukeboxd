// Use the MariaDB Node.js Connector
var mariadb = require('mariadb');

// Create a connection pool
var pool =
  mariadb.createPool({
    // IF USING LOCAL DB
    host: "127.0.0.1",
    port: 3306,
    user: "root", // IF USING THE OFFICIAL RELEASE, COMMENT THIS OUT
    // user: "jukeboxdAdmin", // UNCOMMENT THIS IF USING THE OFFICIAL RELEASE
    password: "password",
    database: "Test" // IF USING THE OFFICIAL RELEASE, COMMENT THIS OUT
    //database: "Jukeboxd" // UNCOMMENT THIS IF USING THE OFFICIAL RELEASE

    /**
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
    */

    // IF USING VM DB
    /**
    host: process.env.DB_HOST_VM,
    port: process.env.DB_PORT,
    user: process.env.DB_USER_VM,
    password: process.env.DB_PASSWORD_VM,
    database: process.env.DB_DATABASE_VM
    */
  });

// Expose a method to establish connection with MariaDB SkySQL
module.exports = Object.freeze({
  pool: pool
});
