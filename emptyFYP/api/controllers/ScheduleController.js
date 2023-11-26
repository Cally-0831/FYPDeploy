module.exports = {

    viewschedulepage: async function (req, res) {

    },
    viewfinalschedule: async function (req, res) {
        var db = await sails.helpers.database();
        var getsettinginfo;
        var getschedulebox;
        var thisistheline3;
        var releasedate;
        var releasetime;

        if (req.session.role == "sup") {
            getsettinginfo = "select * from allsupersetting where where announcetime is not null and  typeofsetting= \"4\""
            getschedulebox = "select * from allschedulebox where tid = \"" + req.session.userid + "\" or oid =\"" + req.session.userid + "\"";
        } else if (req.session.role == "stu") {
            getsettinginfo = "select * from allsupersetting where announcetime is not null and  typeofsetting= \"4\"";
            getschedulebox = "select * from allschedulebox where sid = \"" + req.session.userid + "\""
        }

        db.query(getsettinginfo, (err, results) => {
            try {
                //get setting check can the system show now
                var string = JSON.stringify(results);
                var json = JSON.parse(string);
                if (json.length == 0) {
                    releasedate = null
                    releasetime = null
                } else {
                    releasedate = json[0].deadlinedate;
                    releasetime = json[0].deadlinetime;
                }
                console.log('>> checkschedeulerelease: ', json);

                db.query(getschedulebox, (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        var personalschedulebox = json;
                        return res.view('user/checkschedule', {
                            releasedate: releasedate, releasetime: releasetime,
                            personalschedulebox: personalschedulebox
                        });

                    } catch (err) {
                        console.log("sth happened here");
                    }
                });
            } catch (err) {
                console.log("sth happened here");
            }
        });
    },

    createdraft: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        var campusfortoday;
        console.log(req.body)

        var supweeklist = [], obsweeklist = [], stdweeklist = [];

        for (var a = 0; a < 6; a++) {
            supweeklist.push([]);
            obsweeklist.push([]);
            stdweeklist.push([]);
        }

        var startday = new Date(req.body.fullstartday);
        var startime = startday.toLocaleTimeString("en-GB");
        var endday = new Date(req.body.fullendday);
        var endtime = endday.toLocaleTimeString("en-GB");
        //#   console.log((endday - startday) / 1000 / 60 / 60 / 24)
        var sessionduration = 0;
        var typeofpresent = req.body.typeofpresent;

        if (typeofpresent == "midterm") {
            sessionduration = 30;
        } else {
            sessionduration = 60;
        }

        var getallclassinfo = "select * from allclass order by Campus asc, rid asc , weekdays asc, starttime asc, endtime asc"
        var classttb = await new Promise((resolve, reject) => {
            pool.query(getallclassinfo, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.classttb")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })


        var getallclassroominschool = "select * from classroom where status != \"Closed\" and rid != \"\" order by Campus asc, rid asc"
        var classroomlist = await new Promise((resolve, reject) => {
            pool.query(getallclassroominschool, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.classroomlist")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })
        //console.log(classroomlist)
        let distinctcampuslist = (classroomlist) => {
            let unique_values = classroomlist
                .map((item) => item.Campus)
                .filter(
                    (value, index, current_value) => current_value.indexOf(value) === index
                );
            return unique_values;
        };
        var campuslist = distinctcampuslist(classroomlist);

        var getclassroomtimeslot = "select * from allclassroomtimeslot"
        var classroomtimeslot = await new Promise((resolve, reject) => {
            pool.query(getclassroomtimeslot, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.classroomtimeslot")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })

        var getsupttb = "select * from allsupertakecourse left join allclass on allsupertakecourse.CID = allclass.CID where allsupertakecourse.pid = \"" + req.body.tid + "\" and confirmation = \"1\" order by weekdays asc, startTime asc"
        var superttb = await new Promise((resolve, reject) => {
            pool.query(getsupttb, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.getsupttb")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })
        for (var a = 0; a < superttb.length; a++) {
            supweeklist[parseInt(superttb[a].weekdays) - 1].push(superttb[a]);
        }

        var getsuprequest = "select * from allrequestfromsupervisor where tid = \"" + req.body.tid + "\" and (RequestDate >= Date(\"" + req.body.startdaydate + "\") and RequestDate <= Date(\"" + req.body.enddaydate + "\")) order by RequestDate asc, requeststarttime asc "
        var superrequest = await new Promise((resolve, reject) => {
            pool.query(getsuprequest, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.superrequest")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })
        console.log(">> superrequest", superrequest[0])

        var getsupschedulebox = "select * from allschedulebox where tid = \"" + req.body.tid + "\" order by boxdate asc , boxtime asc";
        var superschedulebox = await new Promise((resolve, reject) => {
            pool.query(getsupschedulebox, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.superrequest")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })

        var getobsttb = "select * from allsupertakecourse left join allclass on allsupertakecourse.CID = allclass.CID where allsupertakecourse.pid = \"" + req.body.oid + "\" and confirmation = \"1\" order by weekdays asc, startTime asc"
        var obsttb = await new Promise((resolve, reject) => {
            pool.query(getobsttb, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.superrequest")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })
        for (var a = 0; a < obsttb.length; a++) { obsweeklist[parseInt(obsttb[a].weekdays) - 1].push(obsttb[a]); }

        var getobsrequest = "select * from allrequestfromsupervisor where tid = \"" + req.body.oid + "\" and (RequestDate >= Date(\"" + req.body.startdaydate + "\") and RequestDate <= Date(\"" + req.body.enddaydate + "\")) order by RequestDate asc, requeststarttime asc "
        var obsrequest = await new Promise((resolve, reject) => {
            pool.query(getobsrequest, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.superrequest")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })

        var getobsschedulebox = "select * from allschedulebox where tid = \"" + req.body.oid + "\" order by boxdate asc , boxtime asc";
        var obsschedulebox = await new Promise((resolve, reject) => {
            pool.query(getobsschedulebox, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.superrequest")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })


        var getstdttb = "select * from allstudenttakecourse left join allclass on allstudenttakecourse.CID = allclass.CID where allstudenttakecourse.pid = \"" + req.body.sid + "\" and confirmation = \"2\" order by weekdays asc, startTime asc"
        var stdttb = await new Promise((resolve, reject) => {
            pool.query(getstdttb, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.superrequest")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })


        for (var a = 0; a < stdttb.length; a++) { stdweeklist[parseInt(stdttb[a].weekdays) - 1].push(stdttb[a]); }
        for (var a = 0; a < stdweeklist.length; a++) {
            if (stdweeklist[a].length == 0) { stdweeklist[a].push("EMPTY") }
            if (obsweeklist[a].length == 0) { obsweeklist[a].push("EMPTY") }
            if (supweeklist[a].length == 0) { supweeklist[a].push("EMPTY") }
        }


        var getstdrequest = "select * from allrequestfromstudent where sid =\"" + req.body.sid + "\" and (RequestDate >= Date(\"" + req.body.startdaydate + "\") and RequestDate <= Date(\"" + req.body.enddaydate + "\")) and status = \"Approved\" order by RequestDate asc, requeststarttime asc "
        var stdrequest = await new Promise((resolve, reject) => {
            pool.query(getstdrequest, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.superrequest")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })

        var getsuppreference = "select * from allpreffromsup where tid =\"" + req.body.tid + "\"";
        var suppref = await new Promise((resolve, reject) => {
            pool.query(getsuppreference, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)

            })
        })

        //console.log(suppref.length)
        if (suppref.length == 0) {
            suppref = null;
        } else {
            suppref = suppref[0]
            let splitstring = (suppref.Prefno).split("/");
            suppref = splitstring;
        }
        //suppref = suppref[0]


        var getobspreference = "select * from allpreffromsup where tid =\"" + req.body.oid + "\"";
        var obspref = await new Promise((resolve, reject) => {
            pool.query(getobspreference, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.getobspreference")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })
        if (obspref.length == 0) {
            obspref = null;
        } else {
            obspref = obspref[0]
            let splitstring = (obspref.Prefno).split("/");
            obspref = splitstring;
        }
        console.log(obspref)

        var startindex = startday.getDay();

        console.log(startday)
        var currentsessiontimeinpresentday = startday;
        currentsessiontimeinpresentday.setHours(8, 30, 0);
        var currentsessionendtimeinpresentday = (new Date(currentsessiontimeinpresentday.getTime() + (1000 * 60 * sessionduration)));

        console.log("finally working")

        console.log(req.body.suppriority + "      " + req.body.obspriority)
        if (req.body.suppriority <= req.body.obspriority) {
            for (var a = 0; a < suppref.length; a++) {
                console.log(currentsessiontimeinpresentday + "     asdfasdf");
                console.log(currentsessionendtimeinpresentday + "    erqwer ")
            }
        } else {
            for (var a = 0; a < obspref.length; a++) {
                console.log(currentsessiontimeinpresentday + "     hello");
                console.log(currentsessionendtimeinpresentday + "     heool")
                var getcheckobsttb = "select * from allsupertakecourse left join allclass on allclass.CID = allsupertakecourse.CID where pid = \"" + req.body.oid + "\" and weekdays= \"" + currentsessiontimeinpresentday.getDay() + "\" and startTime";
                var obsttb = await new Promise((resolve, reject) => {
                    pool.query(getcheckobsttb, (err, res) => {
                        if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.getobspreference")) }
                        var string = JSON.stringify(res);
                        var json = JSON.parse(string);
                        var ans = json;
                        resolve(ans)
                    })
                })
                console.log(currentsessiontimeinpresentday + "     hello");
                console.log(currentsessionendtimeinpresentday + "     heool")
            }

        }

        return res.status(200).json({
            tid: req.body.tid,
            sid: req.body.sid,
            oid: req.body.oid,
            finalcampus: finalcampus,
            finalrid: finalrid,
            presentday: presentday,
            presentstartTime: currentsessiontimeinpresentday.toLocaleTimeString("en-GB"),
            presentendTime: currentsessionendtimeinpresentday.toLocaleTimeString("en-GB")
        })

    },

    genavailable: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        var errmsg = "";
        //var schedulebox = new Array();


        // get presentperiod
        var getsetting3 = "select * from allsupersetting where typeofsetting = 3;"
        var setting3 = await new Promise((resolve) => {
            pool.query(getsetting3, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                if (ans.length != 0) {
                    var startday = new Date(ans[0].startdate);
                    var endday = new Date(ans[0].enddate);
                    var startTime = ans[0].starttime.split(":");
                    var endTime = ans[0].endtime.split(":");
                    startday.setHours(startTime[0]);
                    startday.setMinutes(startTime[1]);
                    startday.setSeconds(startTime[2]);
                    endday.setHours(endTime[0]);
                    endday.setMinutes(endTime[1]);
                    endday.setSeconds(endTime[2]);
                    console.log(startday + "   " + endday)
                    ans = { startday: startday, endday: endday };
                }
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.genavailble.getsetting3"
        })
        console.log(errmsg)
        console.log(setting3)



        function resetschedulebox() {
            var days = 0;
            var schedulebox = new Array();
            while (true) {
                var scheduleboxsetting = JSON.parse(JSON.stringify({ "date": "", "prefno": "", "schedule": new Array() }))
                // console.log("new schedulebox",schedulebox)
                var presentday = (new Date((new Date(setting3.startday)).getTime() + (24 * 60 * 60 * 1000) * days)).toLocaleDateString("en-GB");
                //console.log(presentday.toLocaleDateString())
                if (setting3.startday.getDay() != 6 || setting.startday.getDay() != 0) {
                    var date = presentday.split("/");
                    scheduleboxsetting.date = date[2] + "-" + date[1] + "-" + date[0];
                    schedulebox.push(scheduleboxsetting);
                    days++;
                }

                if (presentday == (new Date(setting3.endday)).toLocaleDateString("en-GB")) {
                    false;
                    break;
                }

            }

            console.log("resetted schedulebox", schedulebox)
            return schedulebox;
        }


        // gen all supervisors
        var getallsupervisor = "select tid,submission from supervisor order by priority asc"
        var supervisorlist = await new Promise((resolve) => {
            pool.query(getallsupervisor, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.genavailble.getallsupervvisor"
        })


        //need to del all unpending records
        var gethvrecordbutnosubmit = "select distinct(student.sid) from allstudenttakecourse left join student on student.sid = allstudenttakecourse.pid where ttbsubmission = \"N\" or ttbsubmission=\"Rejected\";"
        var hvrecordbutnosubmitstudent = await new Promise((resolve) => {
            pool.query(gethvrecordbutnosubmit, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.genavailble.gethvrecordbutnosubmit"
        })

        //console.log(">>hvrecordbutnosubmitstudent", hvrecordbutnosubmitstudent)

        for (var a = 0; a < hvrecordbutnosubmitstudent.length; a++) {
            var deleteline = "delete from allstudenttakecourse where pid = \"" + hvrecordbutnosubmitstudent[a].sid + "\" and (confirmation = \"0\" or confirmation = \"3\");"
            //console.log(deleteline)
            db.query(deleteline, (err, result) => {
                try {
                    console.log("delete complete")
                } catch (err) {
                    if (err) {
                        errstring = "";
                        errstring += "error happened for:" + deleteline + "\n"
                        statuscode = 401;
                    }
                }

            })

            var insertemptyline = "insert ignore into alltakecourse values(\"EMPTY_\",\"" + hvrecordbutnosubmitstudent[a].sid + "\");"
            //console.log(insertemptyline)
            db.query(insertemptyline, (err, result) => {
                try {
                    console.log("insert complete")
                } catch (err) {
                    if (err) {
                        errstring = "";
                        errstring += "error happened for:" + deleteline + "\n"
                        statuscode = 401;
                    }
                }

            })

            updatetakecourseline = "Update allstudenttakecourse set allstudenttakecourse.ttbcomments = \"enforced to enroll empty since no submission or being rejected\" , allstudenttakecourse.confirmation = \"4\",  allstudenttakecourse.review = now() where allstudenttakecourse.pid=\"" + hvrecordbutnosubmitstudent[a].sid + "\";"
            //console.log(updatetakecourseline)
            db.query(updatetakecourseline, (err, result) => {
                try {
                    console.log("update complete")
                } catch (err) {
                    if (err) {
                        errstring = "";
                        errstring += "error happened for:" + updatetakecourseline + "\n"
                        statuscode = 401;
                    }
                }

            })



        }




        // gen all student update those who didnot even handin ttb
        var getallstudentttbnotok = "select distinct(sid) from student where ttbsubmission = \"N\";"
        var studentlist = await new Promise((resolve) => {
            pool.query(getallstudentttbnotok, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.genavailble.getallstudentttbnotok"
        })
        console.log(studentlist)

        for (var a = 0; a < studentlist.length; a++) {
            //try enroll all of them to EMPTY
            var insertemptyline = "insert ignore into alltakecourse values(\"EMPTY_\",\"" + studentlist[a].sid + "\");"
            //console.log(insertemptyline)
            db.query(insertemptyline, (err, result) => {
                try {
                    console.log("insert complete")
                } catch (err) {
                    if (err) {
                        errstring = "";
                        errstring += "error happened for:" + deleteline + "\n"
                        statuscode = 401;
                    }
                }

            })

            updatetakecourseline = "Update allstudenttakecourse set allstudenttakecourse.ttbcomments = \"enforced to enroll empty since no submission or being rejected\" , allstudenttakecourse.confirmation = \"4\",  allstudenttakecourse.review = now() where allstudenttakecourse.pid=\"" + studentlist[a].sid + "\";"
            //console.log(updatetakecourseline)
            db.query(updatetakecourseline, (err, result) => {
                try {
                    console.log("update complete")
                } catch (err) {
                    if (err) {
                        errstring = "";
                        errstring += "error happened for:" + updatetakecourseline + "\n"
                        statuscode = 401;
                    }
                }

            })
        }

        //turn Required Proof into Rejected
        var updaterequiredproofline = "Update allrequestfromstudent set status = \"Enforce Rejected\", reply=\"Enforced to reject since didn't upload proof ontime\" where status = \"Require Proof\""
        //console.log(updaterequiredproofline)
        db.query(updaterequiredproofline, (err, result) => {
            try {
                console.log("update complete")
            } catch (err) {
                if (err) {
                    errstring = "";
                    errstring += "error happened for:" + updaterequiredproofline + "\n"
                    statuscode = 401;
                }
            }

        })

        //turn Pending into Approved
        updatependingrequestline = "Update allrequestfromstudent set status = \"Enforce Approved\", reply=\"Enforced to approve since supervisor left for pending\" where status = \"Pending\";"
        //console.log(updatependingrequestline)
        db.query(updatependingrequestline, (err, result) => {
            try {
                console.log("update complete")
            } catch (err) {
                if (err) {
                    errstring = "";
                    errstring += "error happened for:" + updatependingrequestline + "\n"
                    statuscode = 401;
                }
            }

        })

        // handle gen student availble 
        // gen all students
        var getallstudent = "select  supervisorpairstudent.tid , student.sid , observerpairstudent.oid from student join supervisorpairstudent on supervisorpairstudent.sid = student.sid  join observerpairstudent on observerpairstudent.sid = student.sid"
        var studentlist = await new Promise((resolve) => {
            pool.query(getallstudent, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.genavailble.getallstudent"
        })
        //console.log(">>studentlist", studentlist)

        for (var a = 0; a < studentlist.length; a++) {

            var currentgeneratedate = new Date(setting3.startday);
            var currentgeneratedateend = new Date(setting3.startday);
            //console.log(currentgeneratedate)
            while (currentgeneratedate < new Date(setting3.endday)) {
                currentgeneratedateend.setHours(currentgeneratedate.getHours() + 1);
                var studentttblist;
                var studentrequest;
                var datestring = currentgeneratedate.getFullYear() + "-" + (currentgeneratedate.getMonth() + 1) + "-" + currentgeneratedate.getDate();

                //console.log("enter")
                if (req.body.typeofpresent == "midterm") {
                    //console.log("midterm")
                } else if (req.body.typeofpresent == "final") {
                    //console.log("final")
                    var boolcheckttb = false;
                    var boolcheckreq = false;

                    var getcheckstudentttb = "select * from allstudenttakecourse left join allclass on allclass.cid = allstudenttakecourse.cid  where pid = \"" + studentlist[a].sid + "\" and weekdays = \"" + currentgeneratedate.getDay() + "\" and (starttime < Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and endtime > time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\")) order by pid asc, weekdays asc,startTime asc"
                    //console.log(getcheckstudentttb);
                    studentttblist = await new Promise((resolve) => {
                        pool.query(getcheckstudentttb, (err, res) => {
                            var string = JSON.stringify(res);
                            var json = JSON.parse(string);
                            var ans = json;
                            resolve(ans)
                        })
                    }).catch((err) => {
                        errmsg = "error happened in ScheduleController.genavailble.getcheckstudentttb"
                    })
                    if (studentttblist == null || studentttblist == undefined || studentttblist.length == 0) {
                        boolcheckttb = true;
                    }

                    var getcheckstudentrequest = "select * from allrequestfromstudent where (status = \"Approved\" or status = \"Enforce Approved\") and sid = \"" + studentlist[a].sid + "\" and requestDate = DATE(\"" + datestring + "\") and (requeststarttime <= Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and requestendtime >= time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\"))";
                    //console.log(getcheckstudentrequest)
                    studentrequest = await new Promise((resolve) => {
                        pool.query(getcheckstudentrequest, (err, res) => {
                            var string = JSON.stringify(res);
                            var json = JSON.parse(string);
                            var ans = json;
                            resolve(ans)
                        })
                    }).catch((err) => {
                        errmsg = "error happened in ScheduleController.genavailble.getcheckstudentrequest"
                    })

                    if (studentrequest.length == 0 || studentrequest == null || studentrequest == undefined) {
                        //console.log(supervisorlist[a].tid+"     "+currentgeneratedate.toLocaleDateString()+"   "+currentgeneratedate.toLocaleTimeString()+"    "+currentgeneratedateend.toLocaleTimeString())
                        //var datestring = currentgeneratedate.getFullYear()+"-"+(currentgeneratedate.getMonth()+1)+"-"+currentgeneratedate.getDate();
                        boolcheckreq = true;
                    }


                    if (boolcheckreq && boolcheckttb) {
                        var insertavability = "insert into studentavailable value(\"" + studentlist[a].sid + "\",Date(\"" + datestring + "\"),timestamp(\"" + datestring + " " + currentgeneratedate.toLocaleTimeString("en-GB") + "\"),timestamp(\"" + datestring + " " + currentgeneratedateend.toLocaleTimeString("en-GB") + "\"))"
                        //console.log(insertavability)
                        var studentavailbilityinsert = await new Promise((resolve) => {
                            pool.query(insertavability, (err, res) => {
                                resolve(res);
                            })
                        }).catch((err) => {
                            errmsg = "error happened in ScheduleController.genavailble.insertavability"
                        })
                    }




                    if (currentgeneratedate.toLocaleTimeString("en-GB") == "17:30:00") {
                        currentgeneratedate.setTime(currentgeneratedate.getTime() + 24 * 60 * 60 * 1000);
                        currentgeneratedate = new Date(currentgeneratedate);
                        currentgeneratedate.setHours(9);
                        currentgeneratedate.setMinutes(30);
                        currentgeneratedate.setSeconds(0);
                        //console.log(currentgeneratedate)

                    } else {
                        currentgeneratedate.setHours(currentgeneratedate.getHours() + 1);
                    }

                    //  console.log(currentgeneratedate.toLocaleDateString("en-GB") + "   " + currentgeneratedate.toLocaleTimeString("en-GB"))

                }

            }
        }


        // console.log(supervisorlist.length)
        //console.log(supervisorlist)
        for (var a = 0; a < supervisorlist.length; a++) {
            //console.log(supervisorlist[a]);
            var currentgeneratedate = new Date(setting3.startday);
            var currentgeneratedateend = new Date(setting3.startday);
            while (currentgeneratedate < new Date(setting3.endday)) {
                currentgeneratedateend.setHours(currentgeneratedate.getHours() + 1);
                var supervisorttblist;
                var supervisorrequest;
                var datestring = currentgeneratedate.getFullYear() + "-" + (currentgeneratedate.getMonth() + 1) + "-" + currentgeneratedate.getDate();

                //console.log("enter")
                if (req.body.typeofpresent == "midterm") {
                    //console.log("midterm")
                } else if (req.body.typeofpresent == "final") {
                    //console.log("final")
                    var boolcheckttb = false;
                    var boolcheckreq = false;

                    var getchecksupervisorttb = "select * from allsupertakecourse left join allclass on allclass.cid = allsupertakecourse.cid  where confirmation = 1 and pid = \"" + supervisorlist[a].tid + "\" and weekdays = \"" + currentgeneratedate.getDay() + "\" and (starttime < Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and endtime > time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\")) order by pid asc, weekdays asc,startTime asc"
                    //console.log(getchecksupervisorttb);
                    supervisorttblist = await new Promise((resolve) => {
                        pool.query(getchecksupervisorttb, (err, res) => {
                            var string = JSON.stringify(res);
                            var json = JSON.parse(string);
                            var ans = json;
                            resolve(ans)
                        })
                    }).catch((err) => {
                        errmsg = "error happened in ScheduleController.genavailble.getsupervisorttblist"
                    })
                    if (supervisorttblist.length == 0 || supervisorttblist == null || supervisorttblist == undefined) {
                        boolcheckttb = true;
                    }


                    var getchecksupervisorrequest = "select * from allrequestfromsupervisor where tid = \"" + supervisorlist[a].tid + "\" and requestDate = DATE(\"" + datestring + "\") and (requeststarttime <= Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and requestendtime >= time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\"))";
                    supervisorrequest = await new Promise((resolve) => {
                        pool.query(getchecksupervisorrequest, (err, res) => {
                            var string = JSON.stringify(res);
                            var json = JSON.parse(string);
                            var ans = json;
                            resolve(ans)
                        })
                    }).catch((err) => {
                        errmsg = "error happened in ScheduleController.genavailble.getchecksupervisorrequest"
                    })

                    if (supervisorrequest.length == 0 || supervisorrequest == null || supervisorrequest == undefined) {
                        //console.log(supervisorlist[a].tid+"     "+currentgeneratedate.toLocaleDateString()+"   "+currentgeneratedate.toLocaleTimeString()+"    "+currentgeneratedateend.toLocaleTimeString())
                        //var datestring = currentgeneratedate.getFullYear()+"-"+(currentgeneratedate.getMonth()+1)+"-"+currentgeneratedate.getDate();
                        boolcheckreq = true;
                    }
                    if (boolcheckreq && boolcheckttb) {
                        var insertavability = "insert into supervisoravailable value(\"" + supervisorlist[a].tid + "\",Date(\"" + datestring + "\"),timestamp(\"" + datestring + " " + currentgeneratedate.toLocaleTimeString("en-GB") + "\"),timestamp(\"" + datestring + " " + currentgeneratedateend.toLocaleTimeString("en-GB") + "\"))"
                        // console.log(insertavability)
                        var supervisoravailbilityinsert = await new Promise((resolve) => {
                            pool.query(insertavability, (err, res) => {
                                resolve(res);
                            })
                        }).catch((err) => {
                            errmsg = "error happened in ScheduleController.genavailble.insertavability"
                        })
                    }




                    if (currentgeneratedate.toLocaleTimeString("en-GB") == "17:30:00") {
                        currentgeneratedate.setTime(currentgeneratedate.getTime() + 24 * 60 * 60 * 1000);
                        currentgeneratedate = new Date(currentgeneratedate);
                        currentgeneratedate.setHours(9);
                        currentgeneratedate.setMinutes(30);
                        currentgeneratedate.setSeconds(0);
                    } else {
                        currentgeneratedate.setHours(currentgeneratedate.getHours() + 1);
                    }

                    //  console.log(currentgeneratedate.toLocaleDateString("en-GB") + "   " + currentgeneratedate.toLocaleTimeString("en-GB"))

                }

            }
        }

        console.log(">>supervisorlist", supervisorlist);

        //  for (var a = 0; a < 3; a++) {
        for (var a = 0; a < supervisorlist.length; a++) {
            var getprefofthissuper = "select * from allpreffromsup where tid = \"" + supervisorlist[a].tid + "\"";
            var prefofthissuper = await new Promise((resolve) => {
                pool.query(getprefofthissuper, (err, res) => {
                    var string = JSON.stringify(res);
                    var json = JSON.parse(string);
                    var ans = json;
                    resolve(ans)
                })
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.genavailble.getprefofthissuper"
            })
            //console.log(">>preflist", prefofthissuper)
            //console.log(prefofthissuper.length)
            var thisschedulebox = resetschedulebox();

            if (prefofthissuper != null && prefofthissuper.length > 0) {
                //console.log(prefofthissuper[0].Prefno)
                var prefary = prefofthissuper[0].Prefno.split("/");

                for (var b = 0; b < prefary.length; b++) {
                    thisschedulebox[b].prefno = prefary[b];
                }
            }
            thisschedulebox.sort((a, b) => {
                return b.prefno - a.prefno;
            });
            console.log(supervisorlist[a].tid, "   ", thisschedulebox)

            var getallstudentlistforthissuper = "(select tid, supervisorpairstudent.sid, oid as colleague from supervisorpairstudent left join observerpairstudent on observerpairstudent.sid = supervisorpairstudent.sid where supervisorpairstudent.tid = \"" + supervisorlist[a].tid + "\"and supervisorpairstudent.sid not in (select sid from allschedulebox) )union (select oid,observerpairstudent.sid , tid as colleague from observerpairstudent left join supervisorpairstudent on observerpairstudent.sid = supervisorpairstudent.sid where observerpairstudent.oid = \"" + supervisorlist[a].tid + "\" and observerpairstudent.sid not in (select sid from allschedulebox))";
            var studentlistforthissupervisor = await new Promise((resolve) => {
                pool.query(getallstudentlistforthissuper, (err, res) => {
                    var string = JSON.stringify(res);
                    var json = JSON.parse(string);
                    var ans = json;
                    resolve(ans)
                })
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.genavailble.getallstudentlistforthissuper"
            })
            //console.log(">>studentlistforthissupervisor", studentlistforthissupervisor)

            var counttimeboxlist = new Array();
            if (studentlistforthissupervisor != 0) {
                for (var b = 0; b < studentlistforthissupervisor.length; b++) {
                    var checkavailabledup = "select count(*) as boxcount from supervisorpairstudent "
                        + "left join observerpairstudent on supervisorpairstudent.sid = observerpairstudent.sid "
                        + "join studentavailable on studentavailable.sid = supervisorpairstudent.sid and studentavailable.sid =\"" + studentlistforthissupervisor[b].sid + "\" "
                        + "join supervisoravailable as sa1 on sa1.tid = supervisorpairstudent.tid and (sa1.tid = \"" + studentlistforthissupervisor[b].tid + "\" or sa1.tid = \"" + studentlistforthissupervisor[b].colleague + "\") "
                        + "and sa1.availabledate = studentavailable.availabledate and sa1.availablestartTime = studentavailable.availablestartTime "
                        + "join supervisoravailable as sa2 on sa2.tid = observerpairstudent.oid and sa1.availabledate = sa2.availabledate and sa1.availablestartTime = sa2.availablestartTime  "
                        + "and (sa2.tid = \"" + studentlistforthissupervisor[b].colleague + "\" or sa2.tid = \"" + studentlistforthissupervisor[b].tid + "\");"
                    //console.log(checkavailabledup)
                    var availblelist = await new Promise((resolve) => {
                        pool.query(checkavailabledup, (err, res) => {
                            var string = JSON.stringify(res);
                            var json = JSON.parse(string);
                            var ans = json;
                            resolve(ans)
                        })
                    }).catch((err) => {
                        errmsg = "error happened in ScheduleController.genavailble.checkavailabledup"
                    })
                    //console.log(studentlistforthissupervisor[b].tid)
                    //console.log(">>studentlistforthissupervisor   ", studentlistforthissupervisor)

                    counttimeboxlist.push(JSON.parse(JSON.stringify({ "sid": studentlistforthissupervisor[b].sid, "tid": studentlistforthissupervisor[b].tid, "oid": studentlistforthissupervisor[b].colleague, "availblelist": parseInt(availblelist[0].boxcount) })));
                }

                counttimeboxlist.sort((a, b) => {
                    return a.availblelist - b.availblelist;
                })


                for (var b = 0; b < counttimeboxlist.length; b++) {
                    console.log(counttimeboxlist[b])
                    var added = false;
                    for (var c = 0; c < thisschedulebox.length; c++) {
                        console.log(thisschedulebox[c])
                        var presentday = thisschedulebox[c].date;
                        var checker = thisschedulebox[c].prefno;
                        if (checker == "") {
                            checker = 0;
                        } else {
                            checker = parseInt(thisschedulebox[c].prefno);
                        }
                        //console.log(thisschedulebox);

                        console.log(">>presentday", presentday, "  ", counttimeboxlist[b].sid, "  ", checker, "  ", thisschedulebox[c].schedule.length)


                        if (thisschedulebox[c].schedule.length != checker || (checker == "0")) {
                            while (!added) {

                                function appendquery(thisschedulebox) {
                                    var checkavailabledup = "select supervisorpairstudent.tid , supervisorpairstudent.sid , observerpairstudent.oid, studentavailable.availabledate, studentavailable.availablestartTime, studentavailable.availableendTime from supervisorpairstudent "
                                        + "left join observerpairstudent on supervisorpairstudent.sid = observerpairstudent.sid "
                                        + "join studentavailable on studentavailable.sid = supervisorpairstudent.sid and studentavailable.sid =\"" + counttimeboxlist[b].sid + "\" "
                                        + "and studentavailable.availabledate =\"" + presentday + "\""
                                    for (var z = 0; z < thisschedulebox[c].schedule.length; z++) {
                                        var timestamp = new Date(thisschedulebox[c].schedule[z].availablestartTime);
                                        console.log(timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + " " + timestamp.toLocaleTimeString("en-GB"))
                                        checkavailabledup += "and studentavailable.availablestarttime != \"" + timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + " " + timestamp.toLocaleTimeString("en-GB") + "\" "
                                    }
                                    checkavailabledup += "join supervisoravailable as sa1 on sa1.tid = supervisorpairstudent.tid and (sa1.tid = \"" + counttimeboxlist[b].tid + "\" or sa1.tid = \"" + counttimeboxlist[b].oid + "\") "
                                        + "and sa1.availabledate = studentavailable.availabledate and sa1.availablestartTime = studentavailable.availablestartTime "
                                        + "join supervisoravailable as sa2 on sa2.tid = observerpairstudent.oid and sa1.availabledate = sa2.availabledate and sa1.availablestartTime = sa2.availablestartTime  "
                                        + "and (sa2.tid = \"" + counttimeboxlist[b].oid + "\" or sa2.tid = \"" + counttimeboxlist[b].tid + "\")"
                                    // console.log(checkavailabledup);
                                    return checkavailabledup;
                                }

                                var checkavailabledup = appendquery(thisschedulebox);
                                //console.log(checkavailabledup)
                                var checkscheduleboxlist = await new Promise((resolve) => {
                                    pool.query(checkavailabledup, (err, res) => {
                                        var string = JSON.stringify(res);
                                        var json = JSON.parse(string);
                                        var ans = json;
                                        resolve(ans)
                                    })
                                }).catch((err) => {
                                    errmsg = "error happened in ScheduleController.genavailble.checkavailabledup"
                                })

                                console.log(">>checkscheduleboxlist", checkscheduleboxlist[0])
                                if (checkscheduleboxlist[0] == undefined) {
                                    console.log(supervisorlist[a].tid, "  ", checkavailabledup)
                                    console.log("this fail", counttimeboxlist[b].sid)
                                    break;
                                } else {
                                    thisschedulebox[c].schedule.push(checkscheduleboxlist[0])
                                    //console.log(">>see see ", thisschedulebox[c].schedule)
                                    added = true;
                                    console.log("this pass", counttimeboxlist[b].sid)
                                }

                            }
                        } else {
                            if (checker == 0) {
                                console.log("need to handle this ppl 1", counttimeboxlist[b].sid)
                            } else if (thisschedulebox[c].schedule.length == checker) {
                                console.log("need to handle this ppl 2", counttimeboxlist[b].sid)
                            }

                        }
                        if (added) { break; } else {
                            console.log("need to handle this ppl 3", counttimeboxlist[b].sid)
                        }
                    }
                }

                for (var c = 0; c < thisschedulebox.length; c++) {
                    for (var e = 0; e < thisschedulebox[c].schedule.length; e++) {
                        var campus = "";
                        var room = "";
                        console.log(thisschedulebox[c].schedule[e].tid, " ", thisschedulebox[c].schedule[e].oid, " ", thisschedulebox[c].date);
                        var timestamp = new Date(thisschedulebox[c].schedule[e].availablestartTime);

                        var delavailabletimequery = "delete from supervisoravailable where (tid = \"" + thisschedulebox[c].schedule[e].tid + "\" or tid = \"" + thisschedulebox[c].schedule[e].oid + "\") and availablestartTime = \"" + timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + " " + timestamp.toLocaleTimeString("en-GB") + "\"; "
                        // + "delete from studentavailable where sid = \"" + thisschedulebox[c].schedule[e].sid + "\" and availablestartTime = \"" + timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + " " + timestamp.toLocaleTimeString("en-GB") + "\";"
                        //console.log(delavailabletimequery)
                        db.query(delavailabletimequery, (err, result) => {
                            try {
                                console.log("delavailabletimequery complete")
                            } catch (err) {
                                if (err) {
                                    errmsg = "error happened in ScheduleController.delavailabletimequery"
                                }
                            }

                        })
                        delavailabletimequery = "delete from studentavailable where sid = \"" + thisschedulebox[c].schedule[e].sid + "\" and availablestartTime = \"" + timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + " " + timestamp.toLocaleTimeString("en-GB") + "\";"
                        //console.log(delavailabletimequery)
                        db.query(delavailabletimequery, (err, result) => {
                            try {
                                console.log("delavailabletimequery complete")
                            } catch (err) {
                                if (err) {
                                    errmsg = "error happened in ScheduleController.delavailabletimequery"
                                }
                            }

                        })

                        var getcampusandroomquery = "select t2.cid,pid,priority, campus,rid,startTime,endTime from (select * from (select * from allsupertakecourse where (pid = \"" + thisschedulebox[c].schedule[e].tid + "\" or pid = \"" + thisschedulebox[c].schedule[e].oid + "\")) as t1 left join supervisor on supervisor.tid = t1.pid )as t2 left join allclass on allclass.cid = t2.CID where weekdays = \"" + timestamp.getDay() + "\" order by t2.priority asc, startTime asc, Campus asc , RID asc"
                        // console.log(getcampusandroomquery)
                        var checkcampusandroom = await new Promise((resolve) => {
                            pool.query(getcampusandroomquery, (err, res) => {
                                var string = JSON.stringify(res);
                                var json = JSON.parse(string);
                                var ans = json;
                                resolve(ans)
                            })
                        }).catch((err) => {
                            errmsg = "error happened in ScheduleController.genavailble.getcampusandroomquery"
                        })

                        if (checkcampusandroom.length > 0) {
                            campus = checkcampusandroom[0].campus
                        } else {

                            getcampusandroomquery = "select * from classroom where Campus != \"\""
                            var checkcampusandroom = await new Promise((resolve) => {
                                pool.query(getcampusandroomquery, (err, res) => {
                                    var string = JSON.stringify(res);
                                    var json = JSON.parse(string);
                                    var ans = json;
                                    resolve(ans)
                                })
                            }).catch((err) => {
                                errmsg = "error happened in ScheduleController.genavailble.getcampusandroomquery"
                            })
                            campus = checkcampusandroom[0].Campus
                        }
                        console.log(campus + "   hello")

                        getcampusandroomquery = "select * from classroom where Campus =\"" + campus + "\" and status=\"Open\" "
                            + " and rid not in (select rid from allclassroomtimeslot where Campus = \"" + campus + "\" and startdate = \"" + timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + "\" and (starttime < Time(\"" + timestamp.toLocaleTimeString("en-GB") + "\")< endtime))"
                            + " and rid not in(select rid from allclass where Campus = \"" + campus + "\" and weekdays = \"" + timestamp.getDay() + "\" and (starttime < Time(\"" + timestamp.toLocaleTimeString("en-GB") + "\")< endtime))"
                        console.log(getcampusandroomquery);

                        var checkcampusandroom = await new Promise((resolve) => {
                            pool.query(getcampusandroomquery, (err, res) => {
                                var string = JSON.stringify(res);
                                var json = JSON.parse(string);
                                var ans = json;
                                resolve(ans)
                            })
                        }).catch((err) => {
                            errmsg = "error happened in ScheduleController.genavailble.getcampusandroomquery"
                        })
                        console.log(checkcampusandroom)
                        if (checkcampusandroom.length > 0) {
                            room = checkcampusandroom[0].RID;
                        } else {
                            room = "ooops"
                        }
                        console.log(campus + "    " + room)
                        let boxid = 'boxID';
                        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                        const charactersLength = characters.length;
                        let counter = 0;
                        while (counter < 15) {
                            boxid += characters.charAt(Math.floor(Math.random() * charactersLength));
                            counter += 1;
                        }
                        var insertscheduleboxquery = "insert into allschedulebox values(\"" + boxid + "\",\"" + timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + "\",\"" + timestamp.toLocaleTimeString("en-GB") + "\","
                            + "\"" + thisschedulebox[c].schedule[e].tid + "\",\"" + thisschedulebox[c].schedule[e].sid + "\",\"" + thisschedulebox[c].schedule[e].oid + "\","
                            + "\"" + campus + "\",\"" + room + "\", now()) ;"
                        console.log(insertscheduleboxquery)

                        var insertbox = await new Promise((resolve) => {
                            pool.query(insertscheduleboxquery, (err, res) => {
                                resolve(res)
                            })
                        }).catch((err) => {
                            errmsg = "error happened in ScheduleController.genavailble.insertscheduleboxquery"
                        })

                        var updatesupervisordraft = "update supervisor set draft = \"Y\" where tid = \"" + thisschedulebox[c].schedule[e].tid + "\""
                        console.log(updatesupervisordraft)
                        insertbox = await new Promise((resolve) => {
                            pool.query(updatesupervisordraft, (err, res) => {
                                resolve(res)
                            })
                        }).catch((err) => {
                            errmsg = "error happened in ScheduleController.genavailble.updatesupervisordraft"
                        })

                    }

                }


            }
        }


        return res.ok();
    },

    checkpref: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        var boxlist = req.body.boxlist;
        console.log(">>checkpref       ", req.body)
        var startday = new Date(req.body.fullstartday);
        var endday = new Date(req.body.fullendday);

        let distinctoidlist = (boxlist) => {
            let unique_values = boxlist
                .map((item) => item.oid)
                .filter(
                    (value, index, current_value) => current_value.indexOf(value) === index
                );
            return unique_values;
        };

        var oidlist = distinctoidlist(boxlist);
        console.log(oidlist)

        for (var a = 0; a < boxlist.length; a++) {

            var getsuppreference = "select allpreffromsup.tid , priority, prefno  from allpreffromsup  left join supervisor on supervisor.tid = allpreffromsup.tid where allpreffromsup.tid = \"" + boxlist[0].tid + "\" or allpreffromsup.tid = \"" + boxlist[a].oid + "\" order by priority asc , tid asc"
            var suppreflistforthisbox = await new Promise((resolve) => {
                pool.query(getsuppreference, (err, res) => {
                    var string = JSON.stringify(res);
                    var json = JSON.parse(string);
                    var ans = json;
                    resolve(ans)
                })
            })
            console.log(">>suppreflistforthisbox", suppreflistforthisbox)
            if (suppreflistforthisbox.length > 0) {
                for (var b = 0; b < suppreflistforthisbox.length; b++) {
                    var prefsplitstr = suppreflistforthisbox[b].prefno.split("/");
                    var totalconsiderednum = 0;
                    prefsplitstr.forEach(num => {
                        if (num != "") {
                            totalconsiderednum += parseInt(num);
                        }
                    })
                    var presentday = new Date(boxlist[a].presentday)
                    var daycount = Math.floor((presentday - startday) / 1000 / 60 / 60 / 24)

                    var chktotalpresentforthissup = "select (select count(*) from supervisorpairstudent where tid = \"" + suppreflistforthisbox[b].tid + "\") super, (select count(*) from observerpairstudent where oid = \"" + suppreflistforthisbox[b].tid + "\") observer from dual;"
                    var totalpresentforthissup = await new Promise((resolve) => {
                        pool.query(chktotalpresentforthissup, (err, res) => {
                            var string = JSON.stringify(res);
                            var json = JSON.parse(string);
                            var ans = json;
                            resolve(ans)
                        })
                    })

                    console.log(">> totalpresentforthissup    ", (parseInt(totalpresentforthissup[0].super) + parseInt(totalpresentforthissup[0].observer)))

                    var checkthissupchedule = "select count(*) as checkcount from allschedulebox where tid = \"" + suppreflistforthisbox[b].tid + "\" and boxdate = \"" + presentday.toLocaleDateString() + "\""
                    var currentschedulenum = await new Promise((resolve) => {
                        pool.query(checkthissupchedule, (err, res) => {
                            var string = JSON.stringify(res);
                            var json = JSON.parse(string);
                            var ans = json;
                            resolve(ans)
                        })
                    })
                    console.log(currentschedulenum[0].checkcount >= prefsplitstr[daycount])
                    console.log(totalconsiderednum + "      " + (parseInt(totalpresentforthissup[0].super) + parseInt(totalpresentforthissup[0].observer)))


                    // 如果佢已經係計好咗total = fulfill >> 可以直接check 佢滿未

                    // 如果佢未滿 >> currentnum vs prefnum
                    // checker for proving the sup is done
                }
            } else {
                // 無人填pref
            }



        }



    },











    savebox: async function (req, res) {
        var db = await sails.helpers.database();
        // console.log(req.body.boxlist);
        var boxlist = req.body.boxlist;
        updatesupdraftexist = "Update supervisor set draft= \"Y\" where tid = \"" + boxlist[0].tid + "\"";
        /**
        db.query( updatesupdraftexist, (err, results) => {
            if (err) { return res.status(401).json("Error happened when excuting ScheduleController.savebox.updatesupdraftexist") };
        });
 */
        for (var a = 0; a < boxlist.length; a++) {
            updateobsdraftexist = "Update supervisor set draft= \"Y\" where tid = \"" + boxlist[a].oid + "\"";
            /**
            db.query(updateobsdraftexist, (err, results) => {
                if (err) { return res.status(401).json("Error happened when excuting ScheduleController.savebox.updateobsdraftexist") };
            });
            */
            boxid = "" + (boxlist[a].presentday.split("T"))[0] + "_" + boxlist[a].presentstartTime;

            insertline = "insert ignore into allschedulebox values(\"" + boxid + "\",\"" + boxlist[a].presentday + "\",\"" + boxlist[a].presentstartTime + "\",\"" + boxlist[a].tid + "\",\"" + boxlist[a].sid + "\",\"" + boxlist[a].oid + "\",\"" + boxlist[a].finalcampus + "\",\"" + boxlist[a].finalrid + "\",now())";
            updateline = "Update allschedulebox set boxdate = \"" + boxlist[a].presentday + "\", boxtime = \"" + boxlist[a].presentstartTime + "\" ,SID =\"" + boxlist[a].sid + "\", OID = \"" + boxlist[a].oid + "\", Campus = \"" + boxlist[a].finalcampus + "\", RID = \"" + boxlist[a].finalrid + "\", LastUpdate = now() where boxid = \"" + boxid + "\"";
            console.log(boxid)
            console.log(insertline)
            console.log(updateline)
            /**
            db.query(insertline, (err, result) => {
                if (err) {
                    errstring = "";
                    errstring += "error happened for:" + insertline + "\n"
                    statuscode = 401;
                }
 
            })
            db.query(updateline, (err, result) => {
                if (err) {
                    errstring = "";
                    errstring += "error happened for:" + thisistheline + "\n"
                    statuscode = 401;
                }
            })
           */

        }

        /** 
        var errstring = "ok";
        var statuscode = 200;
        var arrayint = [];
 
        thisistheline = "Update supervisor set draft= \"Y\" where tid = \"" + req.session.userid + "\"";
        db.query(thisistheline, (err, results) => {
            if (err) { return res.status(401).json("Error happened when updating") }
        });
 
        for (var a = 0; a < req.body.length; a++) {
            console.log("\n\n\n\n");
            console.log(req.body[a].boxid);
            console.log(req.body[a].stu);
            console.log(req.body[a].obs);
            console.log(req.body[a].Campus);
            console.log(req.body[a].RID);
            insertline = "insert ignore into allschedulebox values(\"" + req.body[a].boxid + "\",\"" + req.body[a].boxdate + "\",\"" + req.body[a].boxtime + "\",\"" + req.session.userid + "\",\"" + req.body[a].stu + "\",\"" + req.body[a].obs + "\",\"" + req.body[a].Campus + "\",\"" + req.body[a].RID + "\",now())";
 
            thisistheline = "Update allschedulebox set boxdate = \"" + req.body[a].boxdate + "\", boxtime = \"" + req.body[a].boxtime + "\" ,SID =\"" + req.body[a].stu + "\", OID = \"" + req.body[a].obs + "\", Campus = \"" + req.body[a].Campus + "\", RID = \"" + req.body[a].RID + "\", LastUpdate = now() where boxid = \"" + req.body[a].boxid + "\"";
 
            console.log(thisistheline)
            db.query(insertline, (err, result) => {
                if (err) {
                    errstring = "";
                    errstring += "error happened for:" + insertline + "\n"
                    statuscode = 401;
                }
 
            })
            db.query(thisistheline, (err, result) => {
                if (err) {
                    errstring = "";
                    errstring += "error happened for:" + thisistheline + "\n"
                    statuscode = 401;
                }
            })
          
        }
*/

        console.log(supervisorlist)
        return res.ok();
    },

    getrequestroomlist: async function (req, res) {
        var db = await sails.helpers.database();
        var thisistheline = "select * from classroom where Campus = \"" + req.query.Campus + "\" and RID not in ((select RID from allclass where Campus = \"" + req.query.Campus + "\" and weekdays = \"" + req.query.Weekday + "\"and !(startTime > Time(\"" + req.query.Time + "\") || endTime < Time(\"" + req.query.Time + "\")))) and RID not in (select RID from allclassroomtimeslot where Campus = \"" + req.query.Campus + "\" and !(timestamp(concat(StartDate,\" \",startTime)) > timestamp(\"" + req.query.Date + " " + req.query.Time + "\")  || timestamp(concat(EndDate,\" \",endTime)) < timestamp(\"" + req.query.Date + " " + req.query.Time + "\") ) )";


        db.query(thisistheline, (err, result) => {
            if (err) { return res.status(401).json("Error happened when updating") } else {
                var string = JSON.stringify(result);
                var roomlist = JSON.parse(string);
                return res.json(roomlist);
            }
        });



    },

    getrequestobslist: async function (req, res) {
        var db = await sails.helpers.database();
        var thisistheline = "select * from supervisorpairobserver where tid = \"" + req.session.userid + "\" and OID not in (select OID from allrequestfromobserver where (timestamp(\"" + req.query.Date + " " + req.query.Time + "\")>= timestamp(concat(RequestDate,\" \",RequestStartTime)) and timestamp(\"" + req.query.Date + " " + req.query.Time + "\")< timestamp(concat(RequestDate,\" \",RequestEndTime)))) and OID not in (select pid from allobstakecourse inner join allclass on allclass.CID = allobstakecourse.CID where weekdays =" + req.query.Weekday + " and  (time(\"" + req.query.Time + "\")>= allclass.startTime and time(\"" + req.query.Time + "\")< allclass.endTime))"

        db.query(thisistheline, (err, result) => {
            if (err) { return res.status(401).json("Error happened when updating") } else {
                var string = JSON.stringify(result);
                var okobslist = JSON.parse(string);
                return res.json(okobslist);
            }
        });
    },

    getpairing: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        var errmsg = "";

        var getsetting3 = "select * from allsupersetting where typeofsetting = 3"
        var setting3 = await new Promise((resolve) => {
            pool.query(getsetting3, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                if (ans.length != 0) {
                    var startday = new Date(ans[0].startdate);
                    var endday = new Date(ans[0].enddate);
                    var startTime = ans[0].starttime.split(":");
                    var endTime = ans[0].endtime.split(":");
                    startday.setHours(startTime[0]);
                    startday.setMinutes(startTime[1]);
                    startday.setSeconds(startTime[2]);
                    endday.setHours(endTime[0]);
                    endday.setMinutes(endTime[1]);
                    endday.setSeconds(endTime[2]);
                    console.log(startday + "   " + endday)
                    ans = { startday: startday, endday: endday };
                }
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.getpairing.getsetting3"
        })
        console.log(errmsg)
        console.log(setting3)

        getpairinglist = "select * from (select supervisorpairstudent.tid , supervisor.priority as suppriority, supervisorpairstudent.sid from supervisorpairstudent left join supervisor on supervisor.tid = supervisorpairstudent.tid) as shortsuperpair left join (select observerpairstudent.oid , supervisor.priority as obspriority, observerpairstudent.sid from observerpairstudent left join supervisor on supervisor.tid = observerpairstudent.oid) as shortobspair on shortobspair.sid = shortsuperpair.sid order by shortsuperpair.suppriority asc, shortobspair.obspriority asc";
        // gen all supervisors
        var getallsupervisor = "select tid,submission from supervisor order by priority asc"
        var supervisorlist = await new Promise((resolve) => {
            pool.query(getallsupervisor, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.getpairing.getallsupervvisor"
        })

        for (var a = 0; a < supervisorlist.length; a++) {
            var getallpresentlist = "select * from supervisorpairstudent left join observerpairstudent on supervisorpairstudent.sid = observerpairstudent.sid where( supervisorpairstudent.tid = \"" + supervisorlist[a].tid + "\" or observerpairstudent.oid = \"" + supervisorlist[a].tid + "\" )"
            var presentlistforthissuper = await new Promise((resolve) => {
                pool.query(getallpresentlist, (err, res) => {
                    var string = JSON.stringify(res);
                    var json = JSON.parse(string);
                    var ans = json;
                    resolve(ans)
                })
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.getpairing.getallpresentlist"
            })
            console.log(presentlistforthissuper)

            for (var b = 0; b < presentlistforthissuper.length; b++) {
                var colleage;
                console.log(presentlistforthissuper[b])
                console.log(presentlistforthissuper[b].TID + "    " + supervisorlist[a].tid)

                if (presentlistforthissuper[b].TID == supervisorlist[a].TID) {
                    colleage = presentlistforthissuper[b].OID;
                } else {
                    colleage = presentlistforthissuper[b].TID;
                }




            }
        }




        /** 
                db.query(getpairinglist, (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        var pairinglist = json;
                        console.log(pairinglist)
                        return res.status(200).json({ pairinglist: pairinglist })
                    } catch (err) {
                        return res.status(401).json("error happened when excuting SettingController.nodraft.getallinfo.retrievepairinglist");
                    }
                })
                */
    },

}
