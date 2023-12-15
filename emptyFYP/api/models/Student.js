
// create table   student(
// stdname		varchar(100) Not null,
// sid			varchar(20) not null,
// password	varchar(20) not null,
// states		varchar(20) default "ACTIVE",
// errortime	int default 0,
// ttbsubmission  varchar(20) default "N",
// ttbcomments varchar(200) default "",
// ttbdeadline timestamp default null,
// requestdeadline timestamp default null,
// PRIMARY key (sid));

module.exports = {
    // Name table in database
    datastore: 'default',
    tableName: 'student',
    // attributes: types, validations ans defaultsTos values
    attributes: {
        
        id: {
            type: 'string',
            required: true,
            columnName: 'sid',
            unique: true,
            
        },
       
        stdname: {
            type: 'string',
            required: true,
            columnName: 'stdname',
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
        ttbsubmission: {
            type: 'string',
            defaultsTo: "N",
            columnName: "ttbsubmission",
        },
        ttbcomments: {
            type: 'string',
            defaultsTo: "",
            columnName: "ttbcomments",
        },
        ttbdeadline: {
            type: 'ref',
            columnType: 'timestamp',

            defaultsTo: null,
            columnName: "ttbdeadline",
        },
        requestdeadline: {
            type: 'ref',
            columnType: 'timestamp',

            defaultsTo: null,
            columnName: "requestdeadline",
        },



    },
};