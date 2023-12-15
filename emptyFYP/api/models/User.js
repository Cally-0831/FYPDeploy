// create table  allusers(
//     allusersname	varchar(100) Not null,
//     pid			varchar(20) not null,
//     password	varchar(20) not null,
//     states		varchar(20),
//     errortime	int,
//     role	varchar(20),

//     PRIMARY key (pid));

   
        
module.exports = {
    //datastore: 'default',
    // Name table in database
    tableName: 'allusers',

    // attributes: types, validations ans defaultsTos values
    attributes: {
        
       
        id: {
            type: 'string',
            required: true,
            columnName: 'pid',
            unique: true,
      
        },
        allusersname: {
            type: 'string',
            required: true,
            columnName: 'allusersname',
        },

        password: {
            type: 'string',
            required: true,
            columnName: 'password',
        },
        states: {
            type: 'string',
            isIn: ['LOCKED', 'ACTIVE'],
            defaultsTo: "ACTIVE",
            columnName: 'states',
        },
        errortime: {
            type: 'number',
            defaultsTo: 0,
            columnName: "errortime",
        },
        role: {
            type: 'string',
            isIn: ['sup', 'adm', 'stu'],
            columnName: "role",
        },

    },



    
};