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
    app.get('/danger', checkLogin)
    app.get('/danger', function (req, res) {
        res.render('danger/secureUploadList.html', {
            websiteTitle: req.session.company.name,
            user: req.session.user
        });
    });
}