var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    SystemConfigure = model.systemConfigure,
    WechatHelper = require('../../util/wechatHelper'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.post('/admin/getTicket', function (req, res) {
        debugger;
        var arr = [];
        req.on("data", function (data) {
            arr.push(data);
            debugger;
        });
        req.on("end", function () {
            var data = Buffer.concat(arr).toString();

            WechatHelper.decryptMsg(req.query.msg_signature, req.query.timestamp, req.query.nonce, data)
                .then(data => {
                    // data.xml.Encrypt[0];

                    return SystemConfigure.update({
                        value: data.xml.ComponentVerifyTicket[0],
                        updatedDate: new Date()
                    }, {
                        where: {
                            name: "component_verify_ticket"
                        }
                    });
                })
                .then(() => {
                    res.end("success");
                });
        });
    });

    app.get('/admin/getAuth', function (req, res) {
        debugger;
        res.end();

        // WechatHelper.checkComponetToken(gh_d247bac65c42)
        //     .then(() => {
        //         // done token
        //     });
    });
}