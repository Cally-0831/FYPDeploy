const { createPool } = require("mysql2")

const pool = createPool({
    host:"localhost",
    user: "root",
    password: "Psycho.K0831",
    connectionLimit:10,
     //host: "fypdeploy-mysql",
    //  host: "localhost",
    //  user: "root",
     port: 3306,
    //  password: "Psycho.K0831",
     //database: "fypdeploy"
     database: "fyptesting",
    connectionLimit:10,
    idleTimeout: 100000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
})


module.exports = {

   fn: async function () {
        return pool;
    },

   
}

