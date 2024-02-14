const { createPool } = require("mysql")

const pool = createPool({
    //host: "fypdeploy2-mysql",
    //host: "fypdeploy-mysql",
    //user: "fypdeploy",
//database: "fypdeploy",

    host: "localhost",
    user: "root",
    database: "fyptesting",
    port: 3306,
    password: "Psycho.K0831",
    
 
    connectionLimit: 10,
    idleTimeout: 10000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,

})



module.exports = {

    fn: async function () {
        return pool;
    },


}

