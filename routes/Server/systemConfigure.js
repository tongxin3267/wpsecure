var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    SystemConfigure = model.systemConfigure,
    WechatHelper = require('../../util/wechatHelper'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.post('/admin/getTicket', function (req, res) {
        // debugger;
        var arr = [];
        req.on("data", function (data) {
            arr.push(data);
            // debugger;
        });
        req.on("end", function () {
            var data = Buffer.concat(arr).toString();

            WechatHelper.decryptMsg(req.query.msg_signature, req.query.timestamp, req.query.nonce, data)
                .then(data => {
                    // data.xml.Encrypt[0];
                    if (data.xml && data.xml.ComponentVerifyTicket) {
                        return SystemConfigure.update({
                            value: data.xml.ComponentVerifyTicket[0],
                            updatedDate: new Date()
                        }, {
                            where: {
                                name: "component_verify_ticket"
                            }
                        });
                    }
                })
                .then(() => {
                    res.end("success");
                });
        });
    });

    app.get('/admin/getAuth', function (req, res) {
        // debugger;
        WechatHelper.getpreauthcode("wx3011a1e121c1683e")
            .then(url => {
                // done token
                // res.end(url);
                res.end("<a href='" + url + "'>link</a>")
            });
    });

    app.get('/admin/saveAuth', function (req, res) {
        // debugger;
        var auth_code = req.query.auth_code;
        WechatHelper.firstrefreshtoken(auth_code)
            .then(authorization_info => {
                return WechatHelper.saverefreshtoken(authorization_info);
            });
    });

    app.get('/admin/refreshAuth', function (req, res) {
        // debugger;
        WechatHelper.refreshtoken("wx3011a1e121c1683e")
            .then(url => {
                // done token
                res.end("sucess");
            });
    });

    app.post('/admin/getcusQRCode', function (req, res) {
        return WechatHelper.getcusQRCode("wx3011a1e121c1683e")
            .then(ticket => {
                res.jsonp(ticket);
            });
    });

    ///admin/$APPID$/callback
    app.post('/admin/:appId/callback', function (req, res) {
        var arr = [];
        req.on("data", function (data) {
            arr.push(data);
            // debugger;
        });

        req.on("end", function () {
            var data = Buffer.concat(arr).toString(),
                toappId = req.params.appId;
            WechatHelper.decryptMsg(req.query.msg_signature, req.query.timestamp, req.query.nonce, data)
                .then(data => {
                    // data.xml.Encrypt[0];
                    if (data.xml && data.xml.MsgType[0] == "event" && data.xml.Event) {
                        switch (data.xml.Event[0]) {
                            case "SCAN":
                            case "subscribe":
                                // send message back
                                var returnObj = {
                                    ToUserName: data.xml.FromUserName[0],
                                    FromUserName: data.xml.ToUserName[0],
                                    CreateTime: (new Date).getTime(),
                                    MsgType: "news",
                                    // Content: "hello world"
                                    ArticleCount: 1,
                                    Articles: [{
                                        item: {
                                            Title: "点击此处，开始支付",
                                            Description: "",
                                            PicUrl: "",
                                            Url: "http://baidu.com"
                                        }
                                    }]
                                };
                                // res.set('Content-Type', 'text/xml');
                                // var result = WechatHelper.toxml(returnObj);
                                var result = WechatHelper.encryptMsg(returnObj)
                                console.log(result);
                                res.send(result);
                                break;
                            default:
                                res.end("");
                                break;
                        }
                    }
                });
        });
    });
}