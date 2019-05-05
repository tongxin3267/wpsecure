var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    SystemConfigure = model.systemConfigure,
    Company = model.company,
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
                                addNewEmployee(data.xml.ToUserName[0], data.xml.FromUserName[0]);
                                break;
                            case "unsubscribe":
                                removeEmployee(data.xml.ToUserName[0], data.xml.FromUserName[0]);
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
                        switch (data.xml.InfoType[0]) {
                            case "suite_ticket":
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
                            case "create_auth":
                                var AuthCode = data.xml.AuthCode[0],
                                    SuiteId = data.xml.SuiteId[0];
                                wechat.refresh_permanent_code(AuthCode, SuiteId);
                                break;
                            default:
                                break;
                        }
                    });
            });
    });

    // util functions
    {
        function addNewEmployee(toAppId, userId) {
            Company.getFilter({
                    we_appId: toAppId
                })
                .then(company => {
                    Employee.findOne({
                            where: {
                                weUserId: userId,
                                companyId: company._id
                            }
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
                                wechat.getuser(toAppId, userId)
                                    .then(detail => {
                                        Employee.create({
                                            weUserId: userId,
                                            companyId: company._id,
                                            name: detail.name,
                                            mobile: detail.mobile,
                                            other: {}
                                        });
                                    });
                            }
                        });
                });
        };

        function removeEmployee(toAppId, userId) {
            Company.getFilter({
                    we_appId: toAppId
                })
                .then(company => {
                    Employee.getFilter({
                            weUserId: userId,
                            companyId: company._id
                        })
                        .then(employee => {
                            if (employee) {
                                employee.isDeleted = 1;
                                employee.deletedBy = 0;
                                employee.save();
                            }
                        });
                });
        }

        function editEmployee(toAppId, userId) {
            Company.getFilter({
                    we_appId: toAppId
                })
                .then(company => {
                    Employee.getFilter({
                            weUserId: userId,
                            companyId: company._id
                        })
                        .then(employee => {
                            if (employee) {
                                if (employee.isDeleted) {
                                    employee.isDeleted = 0;
                                    employee.deletedBy = 0;
                                }
                                wechat.getuser(toAppId, userId)
                                    .then(detail => {
                                        employee.name = detail.name;
                                        employee.mobile = detail.mobile;
                                        employee.save();
                                    });
                            }
                        });
                });
        };
    }
}