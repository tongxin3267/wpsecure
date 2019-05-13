var crypto = require('crypto'),
    model = require("../../model.js"),
    Shop = model.shop,
    Ws_user = model.ws_user,
    SecureUpload = model.secureUpload,
    Employee = model.employee,
    wechat = require('../../util/wechatHelper'),
    loginHelper = require('../../util/clientHelper'),
    request = require('request'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    function utilLogin(req, res, topage, version) {
        if (model.db.isDevelopment) {
            return loginHelper.autoLogin(req)
                .then(() => {
                    var user = req.session.user;
                    return res.redirect(topage);
                });
        }
        if (req.session.user) {
            res.redirect(topage);
        } else {
            var authUrl = wechat.getAuthorizeURL('wwbaec80ad8e9cf684', "/client/checkuser?q=" + version);
            res.redirect(authUrl);
        }
    };

    app.get('/Client/yhtb', function (req, res) {
        utilLogin(req, res, '/client/yhtbView', "2");
    });

    app.get('/client/yhtbView', checkLogin)
    app.get('/client/yhtbView', function (req, res) {
        res.render('Client/yhtb.html', {
            websiteTitle: req.session.company.name,
            user: req.session.user
        });
    });

    app.get('/Client/reportCenter', function (req, res) {
        utilLogin(req, res, '/client/reportCenterView', "2.0");
    });

    app.get('/client/reportCenterView', checkLogin)
    app.get('/Client/reportCenterView', function (req, res) {
        res.render('Client/personalCenter.html', {
            websiteTitle: req.session.company.name,
            user: req.session.user
        });
    });

    app.get('/Client/myreport', function (req, res) {
        utilLogin(req, res, '/client/myreportView', "2.1");
    });

    app.get('/Client/myreportView', checkLogin)
    app.get('/Client/myreportView', function (req, res) {
        res.render('Client/myreport.html', {
            websiteTitle: req.session.company.name,
            user: req.session.user,
            companyId: req.session.company._id
        });
    });

    app.get('/Client/reporttome', function (req, res) {
        utilLogin(req, res, '/client/reporttomeView', "2.2");
    });

    app.get('/Client/reporttomeView', checkLogin)
    app.get('/Client/reporttomeView', function (req, res) {
        res.render('Client/reporttome.html', {
            websiteTitle: req.session.company.name,
            user: req.session.user,
            companyId: req.session.company._id
        });
    });

    app.get('/Client/reportcopyme', function (req, res) {
        utilLogin(req, res, '/client/reportcopymeView', "2.3");
    });

    app.get('/Client/reportcopymeView', checkLogin)
    app.get('/Client/reportcopymeView', function (req, res) {
        res.render('Client/reportcopyme.html', {
            websiteTitle: req.session.company.name,
            user: req.session.user,
            companyId: req.session.company._id
        });
    });

    app.get('/Client/allreports', function (req, res) {
        utilLogin(req, res, '/client/allreportsView', "2.4");
    });

    app.get('/Client/allreportsView', checkLogin)
    app.get('/Client/allreportsView', function (req, res) {
        res.render('Client/allreports.html', {
            websiteTitle: req.session.company.name,
            user: req.session.user,
            companyId: req.session.company._id
        });
    });

    app.post('/Client/secureUpload/add', checkLogin);
    app.post('/Client/secureUpload/add', function (req, res) {
        var companyId = req.session.company._id;
        Employee.getFilter({
                companyId: companyId,
                weUserId: req.body.responseUser
            })
            .then(user => {
                var p, option = {
                    companyId: companyId,
                    position: req.body.position,
                    imageName: req.body.imageName,
                    description: req.body.description,
                    secureLevel: req.body.secureLevel,
                    responseUser: user._id,
                    createdBy: req.session.user._id
                };
                if (req.body.copyUser) {
                    p = Employee.getFilter({
                            companyId: companyId,
                            weUserId: req.body.copyUser
                        })
                        .then(copyUser => {
                            option.copyUser = copyUser._id;
                        });
                } else {
                    p = Promise.resolve();
                }
                p.then(() => {
                    return SecureUpload.create(option)
                        .then(function (result) {
                            res.jsonp("消息发送成功");
                        });
                });
            })
            .catch(er => {
                res.jsonp({
                    error: er.message || er
                });
            });
    });

    app.post('/Client/secureUpload/addResponse', checkLogin);
    app.post('/Client/secureUpload/addResponse', function (req, res) {
        return SecureUpload.update({
                responseImage: req.body.responseImage,
                responseResult: req.body.responseResult,
                secureStatus: 1,
                updatedBy: req.session.user._id
            }, {
                where: {
                    _id: req.body._id
                }
            })
            .then(secure => {
                res.jsonp(secure);
            })
            .catch(er => {
                res.jsonp({
                    error: er.message || er
                });
            });
    });

    app.post('/Client/secureUpload/myupload', checkLogin);
    app.post('/Client/secureUpload/myupload', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.body.page ? parseInt(req.body.page) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {
            companyId: req.session.company._id,
            createdBy: req.session.user._id,
            secureStatus: 0
        };

        if (req.body.isHandle == "1") {
            filter.secureStatus = 1;
        }
        SecureUpload.getPageOfFilter(page, filter)
            .then(function (records) {
                res.jsonp(records);
            });
    });

    app.post('/Client/secureUpload/allupload', checkLogin);
    app.post('/Client/secureUpload/allupload', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.body.page ? parseInt(req.body.page) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {
            companyId: req.session.company._id,
            secureStatus: 0
        };
        if (req.body.isHandle == "1") {
            filter.secureStatus = 1;
        }
        SecureUpload.getPageOfFilter(page, filter)
            .then(function (records) {
                res.jsonp(records);
            });
    });

    app.post('/Client/secureUpload/reporttome', checkLogin);
    app.post('/Client/secureUpload/reporttome', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.body.page ? parseInt(req.body.page) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {
            companyId: req.session.company._id,
            responseUser: req.session.user._id,
            secureStatus: 0
        };
        if (req.body.isHandle == "1") {
            filter.secureStatus = 1;
        }
        SecureUpload.getPageOfFilter(page, filter)
            .then(function (records) {
                res.jsonp(records);
            });
    });

    app.post('/Client/secureUpload/copytome', checkLogin);
    app.post('/Client/secureUpload/copytome', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.body.page ? parseInt(req.body.page) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {
            companyId: req.session.company._id,
            copyUser: req.session.user._id,
            secureStatus: 0
        };
        if (req.body.isHandle == "1") {
            filter.secureStatus = 1;
        }
        SecureUpload.getPageOfFilter(page, filter)
            .then(function (records) {
                res.jsonp(records);
            });
    });
}