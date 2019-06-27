var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    SystemConfigure = model.systemConfigure,
    Company = model.company,
    Employee = model.employee,
    Sequelize = require('sequelize'),
    Op = Sequelize.Op,
    moment = require("moment"),
    fs = require('fs'),
    qr = require('qr-image'),
    wechat = require('../../util/wechatHelper'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/people/databack/:suiteId', function (req, res) {
        var data = wechat.baseDecryptMsg(req.query.msg_signature, req.query.timestamp, req.query.nonce, req.params.suiteId, req.query.echostr);
        if (data) {
            res.send(data);
        }
    });

    app.post('/people/databack/:suiteId', function (req, res) {
        res.end();
        wechat.getRawBody(req)
            .then(data => {
                wechat.decryptMsg(req.query.msg_signature, req.query.timestamp, req.query.nonce, req.params.suiteId, data)
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

    app.get('/people/commandback/:suiteId', function (req, res) {
        var data = wechat.baseDecryptMsg(req.query.msg_signature, req.query.timestamp, req.query.nonce, req.params.suiteId, req.query.echostr);
        if (data) {
            res.send(data);
        }
    });

    app.post('/people/commandback/:suiteId', function (req, res) {
        res.send("success");
        wechat.getRawBody(req)
            .then(data => {
                wechat.decryptMsg(req.query.msg_signature, req.query.timestamp, req.query.nonce, req.params.suiteId, data)
                    .then(data => {
                        switch (data.xml.InfoType[0]) {
                            case "suite_ticket":
                                var suiteTicket = data.xml.SuiteTicket[0];
                                // save
                                return SystemConfigure.getFilter({
                                        name: "suite_ticket",
                                        suiteId: data.xml.SuiteId[0]
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
                            case "cancel_auth":
                                var corpId = data.xml.AuthCorpId[0],
                                    SuiteId = data.xml.SuiteId[0];
                                deleteCompany(corpId, SuiteId);
                                break;
                            default:
                                break;
                        }
                    });
            });
    });

    // jssdk调用凭证
    app.post('/Client/jssdk/getconfigure', function (req, res) {
        var appId = req.session.company.we_appId,
            suiteId = req.session.company.suiteId,
            curUrl = req.body.url;
        wechat.getJSSign(appId, suiteId, curUrl)
            .then(obj => {
                res.jsonp(obj);
            });
    });

    // 获取授权链接
    app.post('/admin/sysSuit/QRAuthUrl', checkLogin);
    app.post('/admin/sysSuit/QRAuthUrl', function (req, res) {
        var suiteId = req.body.suiteId;
        wechat.getpre_auth_code(suiteId)
            .then(code => {
                var authUrl = "https://open.work.weixin.qq.com/3rdapp/install?suite_id=" + suiteId + "&pre_auth_code=" + code + "&redirect_uri=" + model.db.config.localUrl + "/admin/sysSuit/AuthFeedBack/" + suiteId + "&state=STAT";
                res.jsonp(authUrl);
            });
    });

    // 反馈授权结果，添加公司信息
    app.get('/admin/sysSuit/AuthFeedBack/:suiteId', function (req, res) {
        var AuthCode = req.query.auth_code,
            SuiteId = req.params.suiteId;
        wechat.refresh_permanent_code(AuthCode, SuiteId)
            .then(result => {
                createCompany(result, SuiteId)
                    .then(() => {
                        res.send("授权成功，请登录企业微信后台进行管理");
                    });
            });
    });

    // util functions
    {
        // usefult
        // 获取二维码
        app.get('/admin/getQRCode', function (req, res) {
            var code = qr.image(req.query.q, {
                type: 'png'
            })
            res.setHeader('Content-type', 'image/png'); //sent qr image to client side
            code.pipe(res);
        });

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
            var corpid = result.auth_corp_info.corpid,
                agentId = result.auth_info.agent[0].agentid;
            return Company.findOne({
                    where: {
                        we_appId: corpid
                    }
                })
                .then(company => {
                    if (!company) {
                        // 此公司第一次安装套件
                        var expireDate = moment().add(7, 'd');
                        // 创建工资项
                        return Company.create({
                                name: result.auth_corp_info.corp_name,
                                we_appId: corpid,
                                endDate: expireDate
                            })
                            .then(company => {
                                // 创建folder
                                fs.mkdirSync('public/uploads/' + company._id);
                                fs.mkdirSync('public/uploads/' + company._id + "/client");
                                fs.mkdir('public/uploads/' + company._id + "/client/images");

                                var curDate = new Date();
                                return SystemConfigure.bulkCreate([{
                                    name: "salaryMonth",
                                    appId: corpid,
                                    value: curDate.getFullYear() + "-" + (curDate.getMonth() + 1) + "-1",
                                    companyId: company._id
                                }, {
                                    name: "jsapi_ticket",
                                    appId: corpid,
                                    companyId: company._id,
                                    updatedDate: '2019-05-16'
                                }, {
                                    name: "permanent_code",
                                    suiteId: SuiteId,
                                    appId: corpid,
                                    value: result.permanent_code,
                                    agentId: agentId,
                                    companyId: company._id
                                }, {
                                    name: "access_token",
                                    suiteId: SuiteId,
                                    appId: corpid,
                                    value: result.access_token,
                                    companyId: company._id,
                                    updatedDate: '2019-05-16'
                                }]);
                            });
                    } else {
                        // 此公司多次安装套件
                        return SystemConfigure.getFilter({
                                name: "permanent_code",
                                suiteId: SuiteId,
                                appId: corpid,
                                companyId: company._id
                            })
                            .then(configure => {
                                if (configure) {
                                    // 有历史配置
                                } else {
                                    // 重新配置
                                    return SystemConfigure.bulkCreate([{
                                        name: "permanent_code",
                                        suiteId: SuiteId,
                                        appId: corpid,
                                        value: result.permanent_code,
                                        agentId: agentId,
                                        companyId: company._id
                                    }, {
                                        name: "access_token",
                                        suiteId: SuiteId,
                                        appId: corpid,
                                        value: result.access_token,
                                        companyId: company._id,
                                        updatedDate: '2019-05-16'
                                    }]);
                                }
                            });
                    }
                });
        };

        function deleteCompany(corpId, SuiteId) {
            Company.getFilter({
                    we_appId: corpId
                })
                .then(company => {
                    SystemConfigure.destroy({
                        where: {
                            companyId: company._id,
                            suiteId: SuiteId,
                            appId: corpId
                        }
                    });
                });
        };

        function autoLogin(req, res, suiteId) {
            var auth_code = req.query.auth_code;
            return wechat.get_login_info(auth_code)
                .then(info => {
                    var corpid = info.corp_info.corpid,
                        userid = info.user_info.userid,
                        name = info.user_info.name;
                    return SystemConfigure.getFilter({
                            name: "permanent_code",
                            appId: corpid,
                            suiteId: suiteId
                        })
                        .then(configure => {
                            var agentId = configure.agentId;
                            return wechat.get_admin_list(corpid, suiteId, agentId)
                                .then(result => {
                                    if (result && result.admin.some(admin => {
                                            return admin.auth_type == 1 && admin.userid == userid;
                                        })) {
                                        return Company.getFilter({
                                                we_appId: corpid,
                                                endDate: {
                                                    [Op.gt]: new Date()
                                                }
                                            })
                                            .then(company => {
                                                if (!company) {
                                                    // 试用过期
                                                    return;
                                                }
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
                                                            // req.session.people = employee;
                                                            return {
                                                                employee: employee
                                                            };
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

    // login functions
    {
        // 人事工资等
        app.get('/people/autologin', function (req, res) {
            autoLogin(req, res, "ww683e156d777a4cf6")
                .then(result => {
                    if (result) {
                        if (result.name) {
                            res.render('people/mobile.html', {
                                title: '登录',
                                name: result.name,
                                weUserId: result.userid,
                                model: "people"
                            });
                        } else {
                            req.session.people = result.employee;
                            res.redirect("/people");
                        }
                    } else {
                        res.redirect("/people/login");
                    }
                });
        });

        // 隐患提报
        app.get('/danger/autologin', function (req, res) {
            autoLogin(req, res, "wwbaec80ad8e9cf684")
                .then(result => {
                    if (result) {
                        if (result.name) {
                            res.render('people/mobile.html', {
                                title: '登录',
                                name: result.name,
                                weUserId: result.userid,
                                model: "danger"
                            });
                        } else {
                            req.session.danger = result.employee;
                            res.redirect("/danger");
                        }
                    } else {
                        res.redirect("/danger/login");
                    }
                });
        });
    }
}