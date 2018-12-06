var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    OrderSeq = model.orderSeq,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.post('/admin/orderSeqList/search', checkLogin);
    app.post('/admin/orderSeqList/search', function (req, res) {


    });
}