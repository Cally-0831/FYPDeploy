
//const host = 'fypdeploy2-mysql';
//const host = 'fypdeploy-mysql';
//const database = 'fypdeploy';

const host = "localhost"
const user = 'root';
const password = 'Psycho.K0831';
const database = 'fyptesting';
const port = 3306;


const Importer = require('mysql2-import');
//const importer = new Importer({host, user, password});
const importer = new Importer({host, user, password,database});
module.exports = {

    fn: async function () {
         return importer;
     },
 
    
 }