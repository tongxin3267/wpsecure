var crypto = require('crypto'),
    model = require("../../model.js"),
    Shop = model.shop,
    SecureUpload = model.secureUpload,
    wechat_pay = require('../../util/wechatH5Helper'),
    client = wechat_pay.client,
    request = require('request'),
    auth = require("./auth");

module.exports = function (app) {
    app.get('/Client/yhtb', function (req, res) {
        // var authUrl = client.getAuthorizeURL('http://dushidao.com/Client/yhtbCode', 'stt', 'snsapi_userinfo');
        // res.redirect(authUrl);

        res.render('Client/yhtb.html', {
            websiteTitle: model.db.config.websiteTitle + "-选择门店"
        });
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
}