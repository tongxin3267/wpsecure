var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    SystemConfigure = model.systemConfigure,
    wechat = require('../../util/wechatHelper'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/people/databack', function (req, res) {
        var data = wechat.baseDecryptMsg(req.query.msg_signature, req.query.timestamp, req.query.nonce, req.query.echostr);
        if (data) {
            res.end(data);
        }
    });

    app.post('/people/databack', function (req, res) {
        res.end("");
    });

    app.get('/people/commandback', function (req, res) {
        var data = wechat.baseDecryptMsg(req.query.msg_signature, req.query.timestamp, req.query.nonce, req.query.echostr);
        if (data) {
            res.end(data);
        }
    });

    app.post('/people/commandback', function (req, res) {
        wechat.getRawBody(req)
            .then(data => {
                wechat.decryptMsg(req.query.msg_signature, req.query.timestamp, req.query.nonce, data)
                    .then(data => {
                        if (data.xml.InfoType[0] == "suite_ticket") {
                            var suiteTicket = data.xml.SuiteTicket[0];
                            // save
                            return SystemConfigure.getFilter({
                                    name: "suite_ticket",
                                    appId: data.xml.SuiteId[0]
                                })
                                .then(configure => {
                                    if (suiteTicket != configure.value) {
                                        configure.value = suiteTicket;
                                        configure.updatedDate = new Date();
                                        return configure.save();
                                    }
                                });
                        }
                        res.end("");
                    });
            });
    });
}