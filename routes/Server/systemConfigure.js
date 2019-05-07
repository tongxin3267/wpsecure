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
                                wechat.refresh_permanent_code(AuthCode, SuiteId)
                                    .then(result => {
                                        createCompany(result, SuiteId);
                                    });
                                break;
                            default:
                                break;
                        }
                    });
            });
    });

    // util functions
    {
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
        };

        function createCompany(result, SuiteId) {
            var corpid = result.auth_corp_info.corpid;
            Company.findOne({
                    where: {
                        we_appId: corpid
                    }
                })
                .then(company => {
                    if (!company) {
                        Company.create({
                                name: result.auth_corp_info.corp_name,
                                we_appId: corpid
                            })
                            .then(company => {
                                var curDate = new Date();
                                SystemConfigure.bulkCreate([{
                                    name: "salaryMonth",
                                    appId: corpid,
                                    value: curDate.getFullYear() + "-" + (curDate.getMonth() + 1) + "-1",
                                    companyId: company._id
                                }, {
                                    name: "permanent_code",
                                    suitId: SuiteId,
                                    appId: corpid,
                                    companyId: company._id
                                }, {
                                    name: "access_token",
                                    suitId: SuiteId,
                                    appId: corpid,
                                    companyId: company._id
                                }]);
                            });
                    }
                });
        };

        function autoLogin(req, res, suitId) {
            var auth_code = req.query.auth_code;
            return wechat.get_login_info(auth_code)
                .then(info => {
                    var corpid = info.corp_info.corpid,
                        userid = info.user_info.userid,
                        name = info.user_info.name;
                    return SystemConfigure.getFilter({
                            name: "permanent_code",
                            appId: corpid,
                            suitId: suitId
                        })
                        .then(configure => {
                            var agentId = configure.agentId;
                            return wechat.get_admin_list(corpid, agentId)
                                .then(result => {
                                    if (result && result.admin.some(admin => {
                                            return admin.auth_type == 1 && admin.userid == userid;
                                        })) {
                                        return Company.getFilter({
                                                we_appId: corpid
                                            })
                                            .then(company => {
                                                req.session.company = company;
                                                return Employee.findOne({
                                                        where: {
                                                            companyId: company._id,
                                                            weUserId: userid
                                                        }
                                                    })
                                                    .then(employee => {
                                                        if (employee) {
                                                            if (employee.isDeleted) {
                                                                // 被删除了的，要恢复
                                                                employee.isDeleted = 0;
                                                                employee.save();
                                                            }
                                                            req.session.people = employee;
                                                            return true;
                                                        } else {
                                                            return {
                                                                name: name,
                                                                weUserId: userid
                                                            };
                                                        }
                                                    });
                                            });
                                    }
                                });
                        });

                });
        };
    }

    // people functions
    {
        app.get('/people/autologin', function (req, res) {
            autoLogin(req, res, "ww683e156d777a4cf6")
                .then(result => {
                    if (result) {
                        if (result.name) {
                            res.render('people/mobile.html', {
                                title: '登录',
                                name: result.name,
                                weUserId: result.userid
                            });
                        } else {
                            res.redirect("/people");
                        }
                    } else {
                        res.redirect("/people/login");
                    }
                });
        });
    }
}