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
        var authUrl = client.getAuthorizeURL('http://secure.dushidao.com/Client/yhtbCode', 'stt', 'snsapi_userinfo');
        res.redirect(authUrl);

        // res.render('Client/yhtb.html', {
        //     websiteTitle: model.db.config.websiteTitle
        // });
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

    app.post('/Client/secureUpload/add', checkLogin);
    app.post('/Client/secureUpload/add', function (req, res) {
        Ws_user.getFilter({
                uname: req.body.responseUser
            })
            .then(user => {
                SecureUpload.create({
                        position: req.body.position,
                        imageName: req.body.imageName,
                        description: req.body.description,
                        responseUser: ((user && user._id) || 1),
                        createdBy: (req.session.user ? req.session.user._id : 1)
                    })
                    .then(function (result) {
                        api.sendTemplate("oUbLd58pV6Z6k2QXS2i1r3sC2mfo", "V5AzGTTSZM5GOry9zDbqANzR4uLP27J_-ihYVSD-cl0", "http://dushidao.com/Client", {
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
                                "value": (new Date()),
                                "color": "#173177"
                            }
                        }, function (err, data, res) {
                            if (data.errmsg == "ok") {
                                res.jsonp("消息发送成功");
                            } else {
                                res.jsonp("消息发送失败");
                            }
                        });
                    });
            })
            .catch(er => {
                res.jsonp(er.message || er);
            });
    });
}