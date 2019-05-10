var model = require("../../model.js"),
    Salary = model.salary,
    Company = model.company,
    SystemConfigure = model.systemConfigure,
    Employee = model.employee,
    querystring = require('querystring'),
    moment = require("moment"),
    wechat = require('../../util/wechatHelper'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/client/salaryList', function (req, res) {
        if (process.env.NODE_ENV == "development") {
            return Company.getFilter({
                    we_appId: "wwb50dd79078e140ef"
                })
                .then(company => {
                    req.session.company = company;
                    return Employee.getFilter({
                            companyId: req.session.company._id,
                            weUserId: "ZhaoWeiPu"
                        })
                        .then(user => {
                            req.session.user = user;
                            return res.redirect('/client/salaryView');
                        });
                });
        }

        if (req.session.user) {
            // direct to url
            return res.redirect('/client/salaryView');
        }

        var newUrl = wechat.getAuthorizeURL("ww683e156d777a4cf6", "/client/checkuser?q=1");
        res.redirect(newUrl);
    });

    app.get('/client/checkuser', function (req, res) {
        var code = req.query.code,
            suiteId = wechat.checkSuiteId(req.query.q);
        wechat.getUserIdByCode(suiteId, code)
            .then(results => {
                var userId = results.UserId,
                    CorpId = results.CorpId,
                    user_ticket = results.user_ticket;
                Company.getFilter({
                        we_appId: CorpId
                    })
                    .then(company => {
                        if (company) {
                            req.session.company = company;
                            return Employee.getFilter({
                                companyId: req.session.company._id,
                                weUserId: userId
                            });
                        } else {
                            return Promise.reject("您的公司没有获得授权！");
                        }
                    })
                    .then(employee => {
                        if (employee) {
                            req.session.user = employee;
                            return employee;
                        } else {
                            return wechat.getUser(suiteId, user_ticket);
                        }
                    })
                    .then(user => {
                        if (user) {
                            // 更新teacher
                            return Employee.getFilter({
                                    companyId: req.session.company._id,
                                    mobile: user.mobile
                                })
                                .then(employee => {
                                    if (employee) {
                                        employee.weUserId = userId;
                                        return employee.save()
                                            .then(employee => {
                                                req.session.user = employee;
                                                res.redirect(wechat.checkLoginPage(req.query.q));
                                            });
                                    } else {
                                        return Promise.reject("您的手机号码不在通讯录里，请联系前台查看！");
                                    }
                                });
                        }
                    })
                    .catch(ex => {
                        res.render('Client/error.html', {
                            title: '>工资列表',
                            websiteTitle: req.session.company.name,
                            error: (ex.message || ex)
                        });
                    });
            });
    });

    app.get('/client/salaryView', checkLogin)
    app.get('/client/salaryView', function (req, res) {
        SystemConfigure.getFilter({
                name: "salaryMonth",
                companyId: req.session.company._id
            })
            .then(configure => {
                res.render('Client/salaryList.html', {
                    title: '>工资列表',
                    user: req.session.user,
                    websiteTitle: req.session.company.name,
                    salaryMonth: configure.value
                });
            });
    });

    app.post('/client/salaryList/search', checkLogin);
    app.post('/client/salaryList/search', function (req, res) {
        var filter = {
            companyId: req.session.company._id,
            year: req.body.year,
            month: req.body.month,
            employeeId: req.session.user._id
        };

        Salary.getFilter(filter)
            .then(function (result) {
                res.jsonp(result);
            });
    });
}