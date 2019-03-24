var crypto = require('crypto'),
    model = require("../../model.js"),
    Shop = model.shop,
    Ws_user = model.ws_user,
    SecureUpload = model.secureUpload,
    wechat_pay = require('../../util/wechatH5Helper'),
    client = wechat_pay.client,
    WechatAPI = require('wechat-api'),
    api = new WechatAPI(model.db.config.appid, model.db.config.appSecret),
    request = require('request'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/Client/yhtb', function (req, res) {
        if (model.db.isDevelopment) {
            req.session.user = {
                _id: 1,
                uname: "weple",
                uavatar: "111.png"
            }
        }
        if (req.session.user) {
            res.render('Client/yhtb.html', {
                websiteTitle: model.db.config.websiteTitle
            });
        } else {
            var authUrl = client.getAuthorizeURL('http://secure.dushidao.com/Client/yhtbCode', 'stt', 'snsapi_userinfo');
            res.redirect(authUrl);
        }
    });

    app.get('/Client/yhtbCode', function (req, res) {
        var code = req.query.code;
        client.getAccessToken(code, function (err, result) {
            var accessToken = result.data.access_token;
            var openid = result.data.openid;
            client.getUser(openid, function (err, result) {
                var userInfo = result;
                // 1. save to db
                return Ws_user.getFilter({
                        wxId: userInfo.openid
                    })
                    .then(user => {
                        if (user) {
                            if (userInfo.nickname != user.uname || userInfo.headimgurl != user.uavatar) {
                                // 更新
                                return Ws_user.update({
                                        uname: userInfo.nickname,
                                        uavatar: userInfo.headimgurl,
                                    }, {
                                        where: {
                                            wxId: userInfo.openid
                                        }
                                    })
                                    .then(u => {
                                        user.uname = userInfo.nickname;
                                        user.uavatar = userInfo.headimgurl;
                                        req.session.user = user;
                                    });
                            } else {
                                req.session.user = user;
                            }
                        } else {
                            // 新建
                            return Ws_user.create({
                                    wxId: userInfo.openid,
                                    uname: userInfo.nickname,
                                    uavatar: userInfo.headimgurl,
                                    ugender: userInfo.sex
                                })
                                .then(user => {
                                    req.session.user = user;
                                });
                        }
                    })
                    .then(() => {
                        // 2. show page
                        res.render('Client/yhtb.html', {
                            websiteTitle: model.db.config.websiteTitle
                        });
                    });
            });
        });
    });

    app.get('/Client/personalCenter', function (req, res) {
        if (model.db.isDevelopment) {
            req.session.user = {
                _id: 1,
                uname: "weple",
                uavatar: "111.png"
            }
        }

        if (req.session.user) {
            res.render('Client/personalCenter.html', {
                websiteTitle: model.db.config.websiteTitle,
                user: req.session.user
            });
        } else {
            var authUrl = client.getAuthorizeURL('http://secure.dushidao.com/Client/pCenterCode', 'stt', 'snsapi_userinfo');
            res.redirect(authUrl);
        }
    });

    app.get('/Client/pCenterCode', function (req, res) {
        var code = req.query.code;
        client.getAccessToken(code, function (err, result) {
            var accessToken = result.data.access_token;
            var openid = result.data.openid;
            client.getUser(openid, function (err, result) {
                var userInfo = result;
                // 1. save to db
                return Ws_user.getFilter({
                        wxId: userInfo.openid
                    })
                    .then(user => {
                        if (user) {
                            if (userInfo.nickname != user.uname || userInfo.headimgurl != user.uavatar) {
                                // 更新
                                return Ws_user.update({
                                        uname: userInfo.nickname,
                                        uavatar: userInfo.headimgurl,
                                    }, {
                                        where: {
                                            wxId: userInfo.openid
                                        }
                                    })
                                    .then(u => {
                                        user.uname = userInfo.nickname;
                                        user.uavatar = userInfo.headimgurl;
                                        req.session.user = user;
                                    });
                            } else {
                                req.session.user = user;
                            }
                        } else {
                            // 新建
                            return Ws_user.create({
                                    wxId: userInfo.openid,
                                    uname: userInfo.nickname,
                                    uavatar: userInfo.headimgurl,
                                    ugender: userInfo.sex
                                })
                                .then(user => {
                                    req.session.user = user;
                                });
                        }
                    })
                    .then(() => {
                        // 2. show page
                        res.render('Client/personalCenter.html', {
                            websiteTitle: model.db.config.websiteTitle,
                            user: req.session.user
                        });
                    });
            });
        });
    });

    app.get('/Client/myreport', checkLogin)
    app.get('/Client/myreport', function (req, res) {
        res.render('Client/myreport.html', {
            websiteTitle: model.db.config.websiteTitle,
            user: req.session.user
        });
    });

    app.get('/Client/reporttome', checkLogin)
    app.get('/Client/reporttome', function (req, res) {
        res.render('Client/reporttome.html', {
            websiteTitle: model.db.config.websiteTitle,
            user: req.session.user
        });
    });

    app.post('/Client/secureUpload/add', checkLogin);
    app.post('/Client/secureUpload/add', function (req, res) {
        return Ws_user.getFilter({
                uname: req.body.responseUser
            })
            .then(user => {
                return SecureUpload.create({
                        position: req.body.position,
                        imageName: req.body.imageName,
                        description: req.body.description,
                        responseUser: ((user && user._id) || 1),
                        createdBy: req.session.user._id
                    })
                    .then(function (result) {
                        return new Promise(function (resolve, reject) {
                                api.sendTemplate(user.wxId, "V5AzGTTSZM5GOry9zDbqANzR4uLP27J_-ihYVSD-cl0", "http://secure.dushidao.com/Client/personalCenter", {
                                    "first": {
                                        "value": "新的隐患消息！",
                                        "color": "#173177"
                                    },
                                    "keyword1": {
                                        "value": "巧克力",
                                        "color": "#173177"
                                    },
                                    "keyword2": {
                                        "value": req.body.position,
                                        "color": "#173177"
                                    },
                                    "keyword3": {
                                        "value": req.body.description,
                                        "color": "#173177"
                                    },
                                    "keyword4": {
                                        "value": req.body.responseUser,
                                        "color": "#173177"
                                    },
                                    "keyword5": {
                                        "value": (new Date()).toLocaleString(),
                                        "color": "#173177"
                                    }
                                }, function (err, data, res) {
                                    if (data.errmsg == "ok") {
                                        resolve();
                                    } else {
                                        reject();
                                    }
                                });
                            })
                            .then(() => {
                                res.jsonp("消息发送成功");
                            })
                            .catch(() => {
                                res.jsonp("消息发送失败");
                            });
                    });
            })
            .catch(er => {
                res.jsonp(er.message || er);
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
                res.jsonp(er.message || er);
            });
    });

    app.post('/Client/secureUpload/myupload', checkLogin);
    app.post('/Client/secureUpload/myupload', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.body.page ? parseInt(req.body.page) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {
            createdBy: req.session.user._id
        };

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
            responseUser: req.session.user._id
        };

        SecureUpload.getPageOfFilter(page, filter)
            .then(function (records) {
                res.jsonp(records);
            });
    });
}