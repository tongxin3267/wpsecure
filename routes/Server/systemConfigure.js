var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    SystemConfigure = model.systemConfigure,
    Employee = model.employee,
    wechat = require('../../util/wechatHelper'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/people/databack', function (req, res) {
        var data = wechat.baseDecryptMsg(req.query.msg_signature, req.query.timestamp, req.query.nonce, req.query.echostr);
        if (data) {
            res.send(data);
        }
    });

    app.post('/people/databack', function (req, res) {
        res.end();
        wechat.getRawBody(req)
            .then(data => {
                wechat.decryptMsg(req.query.msg_signature, req.query.timestamp, req.query.nonce, data)
                    .then(data => {
                        switch (data.xml.Event[0]) {
                            case "subscribe":
                                addNewEmployee(data.xml.FromUserName[0]);
                                break;
                            case "unsubscribe":
                                removeEmployee(data.xml.FromUserName[0]);
                                break;
                        }
                    });
            });
    });

    app.get('/people/commandback', function (req, res) {
        var data = wechat.baseDecryptMsg(req.query.msg_signature, req.query.timestamp, req.query.nonce, req.query.echostr);
        if (data) {
            res.send(data);
        }
    });

    app.post('/people/commandback', function (req, res) {
        res.send("success");
        wechat.getRawBody(req)
            .then(data => {
                wechat.decryptMsg(req.query.msg_signature, req.query.timestamp, req.query.nonce, data)
                    .then(data => {
                        if (data.xml.InfoType[0] == "suite_ticket") {
                            var suiteTicket = data.xml.SuiteTicket[0];
                            // save
                            return SystemConfigure.getFilter({
                                    name: "suite_ticket",
                                    suitId: data.xml.SuiteId[0]
                                })
                                .then(configure => {
                                    if (suiteTicket != configure.value) {
                                        configure.value = suiteTicket;
                                        configure.updatedDate = new Date();
                                        return configure.save();
                                    }
                                });
                        } else {
                            // console.log(data.xml.InfoType[0]);
                        }
                    });
            });
    });

    // util functions
    {
        function addNewEmployee(userId) {
            Employee.getFilter({
                    weUserId: userId
                })
                .then(employee => {
                    if (employee) {
                        if (employee.isDeleted) {
                            employee.isDeleted = 0;
                            employee.deletedBy = 0;
                            employee.save();
                        }
                    } else {
                        // getUserInfo and save to db

                    }
                });
        };

        function removeEmployee(userId) {
            Employee.getFilter({
                    weUserId: userId
                })
                .then(employee => {
                    if (employee) {
                        employee.isDeleted = 1;
                        employee.deletedBy = 0;
                        employee.save();
                    }
                });
        }
    }
}