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
}