var mysql = require('mysql');
const date = require('date-and-time')
var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Psycho.K0831",
    database: "fyptesting"
});
db.connect(async (err) => {
    if (err) {
        console.log("Database Connection Failed !!!", err);
        return;
    }
    console.log('MySQL Connected');
});


module.exports = {

    liststudent: async function (req, res) {
        var allstulist;
        var allsuplist;


        if (req.session.role == "sup") {
            thisistheline = "select student.sid, student.stdname,supervisorpairstudent.Topic,observerpairstudent.OID,observerpairstudent.obsname,student.ttbsubmission from supervisor join  supervisorpairstudent on supervisor.tid = supervisorpairstudent.tid join student on student.sid = supervisorpairstudent.sid left join observerpairstudent on observerpairstudent.sid = student.sid where supervisor.tid = \"" + req.session.userid + "\"";

            db.query(thisistheline, (err, results) => {
                try {
                    var string = JSON.stringify(results);
                    //console.log('>> string: ', string );
                    var json = JSON.parse(string);
                    //console.log('>> json: ', json);  
                    var stdlist = json;
                    //console.log('>> stdlist: ', stdlist); 
                    return res.view('user/liststudent', { allstdlist: stdlist ,allsuplist : null});
                } catch (err) {
                    console.log("sth happened here");

                }


            });
        } else {
            thisistheline = "select supervisor.tid,supervisor.supname,student.sid,student.stdname,supervisor.submission from supervisor left join supervisorpairstudent on  supervisorpairstudent.tid = supervisor.tid left join student on supervisorpairstudent.sid = student.sid";
            db.query(thisistheline, (err, results) => {
                try {
                    var string = JSON.stringify(results);
                    //console.log('>> string: ', string );
                    var json = JSON.parse(string);
                    //console.log('>> json: ', json);  
                    suplist = json;
                    //console.log('>> stdlist: ', stdlist); 
                    return res.view('user/liststudent', { allsuplist: suplist });
                } catch (err) {
                    console.log("sth happened here");

                }


            });
        
        }








    },

    gettopic: async function (req, res) {
        var topiclist = new Array();
        console.log(topiclist)
        console.log(topiclist.length)

        let thisistheline = "SELECT  topics FROM supervisor where tid =\"" + req.session.userid + "\"\;";

        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);

                var json = JSON.parse(string);
                //   console.log('>> json: ', json);  
                var stringstring = json[0].topics.split("/").sort()
                topiclist = stringstring;


                console.log(">>topiclist final   " + topiclist)
                return res.view('user/createnewstudent', { alltopiclist: topiclist });
            } catch (err) {

                console.log("sth happened here" + err);

            }


        });
    },

    readsinglestudent: async function (req, res) {
        var studentresult;
        var type;
        var obslist;

            type = "stu";
            thisistheline = "select student.sid, student.stdname,supervisorpairstudent.Topic,observerpairstudent.OID,observerpairstudent.obsname from supervisor join  supervisorpairstudent on supervisor.tid = supervisorpairstudent.tid join student on student.sid = supervisorpairstudent.sid left join observerpairstudent on observerpairstudent.sid = student.sid where student.sid = \"" + req.params.id + "\"\;";
        

        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                //console.log('>> string: ', string );
                var json = JSON.parse(string);
                //console.log('>> json: ', json);  
                studentresult = json;
                //console.log('>> stdlist: ',studentresult); 
                
                    return res.view('user/read', { type: type, thatstudent: studentresult ,obslist:obslist});

                

            } catch (err) {
                console.log("sth happened here");

            }


        });

    },


    deletestudent: async function (req, res) {
        var studentresult;
       
            //remove single ppl
            console.log(String(req.params.id).charAt(0))
            if (String(req.params.id).charAt(0) == "s") {
                let thisistheline = "DELETE FROM allusers WHERE pid= \"" + req.params.id + "\"\n";
                console.log('delete excution');
                console.log(thisistheline);
                db.query(thisistheline, (err, results) => {
                    if (err) { console.log("sth happened here"); }
                });

                thisistheline = "DELETE FROM student WHERE sid= \"" + req.params.id + "\"\n";
                db.query(thisistheline, (err, results) => {
                    if (err) { console.log("sth happened here"); }
                });

                thisistheline = "DELETE FROM supervisorpairstudent WHERE sid= \"" + req.params.id + "\"\n";
                db.query(thisistheline, (err, results) => {
                    if (err) { console.log("sth happened here"); }
                });
                thisistheline = "DELETE FROM observerpairstudent WHERE sid= \"" + req.params.id + "\"\n";
                db.query(thisistheline, (err, results) => {
                    if (err) { console.log("sth happened here"); }
                });
                thisistheline = "DELETE FROM allstudenttakecourse WHERE sid= \"" + req.params.id + "\"\n";
                db.query(thisistheline, (err, results) => {
                    if (err) { console.log("sth happened here"); }
                });

                thisistheline = "DELETE FROM allrequestfromstudent WHERE sid= \"" + req.params.id + "\"\n";
                db.query(thisistheline, (err, results) => {
                    if (err) { console.log("sth happened here"); }
                });

            } else {
                let thisistheline = "DELETE FROM allusers WHERE pid= \"" + req.params.id + "\"\n";
                console.log('delete excution');
                console.log(thisistheline);
                db.query(thisistheline, (err, results) => {
                    if (err) { console.log("sth happened here"); }
                });

                thisistheline = "DELETE FROM observer WHERE oid= \"" + req.params.id + "\"\n";
                db.query(thisistheline, (err, results) => {
                    if (err) { console.log("sth happened here"); }
                });


                thisistheline = "DELETE FROM supervisor WHERE tid= \"" + req.params.id + "\"\n";
                db.query(thisistheline, (err, results) => {
                    if (err) { console.log("sth happened here"); }
                });

                thisistheline = "DELETE FROM supervisorpairstudent WHERE tid= \"" + req.params.id + "\"\n";
                db.query(thisistheline, (err, results) => {
                    if (err) { console.log("sth happened here"); }
                });

                thisistheline = "DELETE FROM observerpairstudent WHERE oid= \"" + req.params.id + "\"\n";
                db.query(thisistheline, (err, results) => {
                    if (err) { console.log("sth happened here"); }
                });

                thisistheline = "DELETE FROM allrequestfromsupervisor WHERE tid= \"" + req.params.id + "\"\n";
                db.query(thisistheline, (err, results) => {
                    if (err) { console.log("sth happened here"); }
                });
            }

        


        return res.ok("Deleted");
    },

    createnewstudent: async function (req, res) {
        var stdlist;

        let pw = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < 8) {
            pw += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }


        //console.log(pw);
        thisistheline = "insert IGNORE into allusers values(\"" +
            req.body.studentname + "\"\,\""
            + req.body.sid + "\"\,\"" +
            pw + "\"\,\"ACTIVE\"\,\"0\"\,\"stu\"\)\;\n";
        //  console.log(thisistheline);
        db.query(thisistheline, function (err, result) {
            if (err) {
                res.status(401).json("Error happened when excuting : " + thisistheline);
            };
            console.log("1 record inserted");
        });



        if (req.body.topic != "") {

            thisistheline = "insert IGNORE into supervisorpairstudent values(\"" +
                req.session.userid + "\"\,\""
                + req.body.sid + "\"\,\"" +
                req.body.topic + "\"\);";

        } else {
            thisistheline = "insert IGNORE into supervisorpairstudent values(\"" +
                req.session.userid + "\"\,\""
                + req.body.sid + "\"\,\"" +
                req.body.othertext + "\"\);";
        }


        db.query(thisistheline, function (err, result) {
            if (err) {
                res.status(401).json("Error happened when excuting : " + thisistheline);
            };
            console.log("1 record inserted");
        });

        return res.ok("created");
    },
    createnewsup: async function (req, res) {
        var stdlist;
        console.log(req.body);
        let pw = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < 8) {
            pw += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }


        //console.log(pw);
        thisistheline = "insert IGNORE into allusers values(\"" +
            req.body.supervisorname + "\"\,\""
            + req.body.tid + "\"\,\"" +
            pw + "\"\,\"ACTIVE\"\,\"0\"\,\"sup\"\)\;\n";
        //  console.log(thisistheline);
        db.query(thisistheline, function (err, result) {
            if (err) {
                res.status(401).json("Error happened when excuting : " + thisistheline);
            };
            console.log("1 record inserted");
            return res.ok("created");
        });



        
    },

    addpairing: async function (req, res) {
        var checktype = req.params.id.split('&');
        thisistheline = "insert IGNORE into observerpairstudent values(\"" +
            checktype[1] + "\"\,\""
            + checktype[0] + "\"\);";

        db.query(thisistheline, function (err, result) {
            if (err) {
                res.status(401).json("Error happened when excuting : " + thisistheline);
            };
            console.log("1 record inserted");
            return res.ok();
        });


    },

    uploadstudentlist: async function (req, res) {


        if (req.method == "GET") return res.view('user/uploadstudentlist');

        console.log(req.body);


        for (var i = 0; i < req.body.length; i++) {
            console.log(req.body[i].sid);

            thisistheline = "insert IGNORE into allusers values(\"" +
                req.body[i].studentname + "\"\,\""
                + req.body[i].sid + "\"\,\"" +
                req.body[i].password + "\"\,\"ACTIVE\"\,\"0\"\,\"stu\"\)\;\n";
            console.log(thisistheline);
            var db = await sails.helpers.database();
            db.query(thisistheline, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(401).json("Error happened when excuting : " + thisistheline);
                };
                console.log("1 record inserted");
            });

        }


        for (var i = 0; i < req.body.length; i++) {
            console.log(req.body[i].sid);
            thisistheline = "insert IGNORE into supervisorpairstudent values(\"" +
                req.session.userid + "\"\,\""
                + req.body[i].sid + "\"\,\"" +
                req.body[i].topic + "\"\);";
            var db = await sails.helpers.database();
            db.query(thisistheline, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(401).json("Error happened when excuting : " + thisistheline);

                };
                console.log("1 record inserted");
            });

        }






        return res.json();

    },

    uploadsupervisorlist: async function (req, res) {

        var db = await sails.helpers.database();
        if (req.method == "GET") return res.view('user/uploadstudentlist');



        for (var i = 0; i < req.body.length; i++) {


            thisistheline = "insert IGNORE into allusers values(\"" +
                req.body[i].supervisorname + "\"\,\""
                + req.body[i].tid + "\"\,\"" +
                req.body[i].password + "\"\,\"ACTIVE\"\,\"0\"\,\"sup\"\)\;\n";
            console.log(thisistheline);

            db.query(thisistheline, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(401).json("Error happened when excuting : " + thisistheline);
                };
                console.log("1 record inserted");
            });

        }

        return res.json();

    },

    uploadpairlist: async function (req, res) {
        var db = await sails.helpers.database();
        for (var i = 0; i < req.body.length; i++) {
            console.log("\n\n\n\n\n")
            console.log(req.body[i]);


            thisistheline = "insert IGNORE into allusers values(\"" +
                req.body[i].studentname + "\"\,\""
                + req.body[i].sid + "\"\,\"" +
                req.body[i].stupassword + "\"\,\"ACTIVE\"\,\"0\"\,\"stu\"\)\;\n";
            console.log(thisistheline);
            db.query(thisistheline, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(401).json("Error happened when excuting : " + thisistheline);
                };
                console.log("1 stu record inserted");


            });
            thisistheline = "insert IGNORE into supervisorpairstudent values(\"" +
                req.session.userid + "\"\,\""
                + req.body[i].sid + "\"\,\"" +
                req.body[i].topic + "\"\);";
            db.query(thisistheline, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(401).json("Error happened when excuting : " + thisistheline);

                };
                console.log("1 suppairstu record inserted");
            });

        }





        for (var i = 0; i < req.body.length; i++) {


            thisistheline = "insert IGNORE into allusers values(\"" +
                req.body[i].observername + "\"\,\""
                + req.body[i].oid + "\"\,\"" +
                req.body[i].obspassword + "\"\,\"ACTIVE\"\,\"0\"\,\"obs\"\)\;\n";
            console.log(thisistheline);
            db.query(thisistheline, function (err, result) {
                console.log(thisistheline);
                if (err) {
                    console.log(err);
                    res.status(401).json("Error happened when excuting : " + thisistheline);
                };
                console.log("1 obs record inserted");
            });
            thisistheline = "insert IGNORE into supervisorpairobserver values(\"" +
                req.session.userid + "\"\,\""
                + req.body[i].oid + "\"\);";
            db.query(thisistheline, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(401).json("Error happened when excuting : " + thisistheline);

                };
                console.log("1 suppairobs record inserted");
            });

        }
        console.log("\n\n\n\n\n")

        for (var i = 0; i < req.body.length; i++) {

            thisistheline = "insert IGNORE into observerpairstudent values(\"" +
                req.body[i].oid + "\"\,\""
                + req.body[i].sid + "\"\);";
            db.query(thisistheline, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(401).json("Error happened when excuting : " + thisistheline);

                };
                console.log("1 obspairstud record inserted");
            });

        }

        return res.ok();


    }



}