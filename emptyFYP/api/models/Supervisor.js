// create table supervisor(
//     supname		varchar(100) Not null,
//     tid			varchar(20) not null,
//     password	varchar(20) not null,
//     states		varchar(20),
//     errortime	int,
//     topics		varchar(100) Not null,
//     submission  varchar(10) default "N", 
//     draft 		varchar(10) default "N", 
//     priority	int default 0,
//     PRIMARY key (tid));
    module.exports = {
        // Name table in database
        datastore: 'default',
        tableName: 'supervisor',
        // attributes: types, validations ans defaultsTos values
        attributes: {
           
            id: {
                type: 'string',
                required: true,
                columnName: 'tid',
                unique: true,
      
            },
            
            supname	: {
                type: 'string',
                required: true,
                columnName: 'supname',
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
            topics : {
                type: 'string',
                columnName: "topics",
            },
            submission:{
                type: 'string',
                defaultsTo:"N",
                columnName: "submission",
            },
            draft:{
                type : 'string',
                defaultsTo:"N",
                columnName: "draft",
            },
           
            priority:{
                type:"number",
                defaultsTo: 0,
                columnName: "priority",
            }
    
        },
    };