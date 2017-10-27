var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    User = model.user,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/userList', checkLogin);
    app.post('/admin/userList', auth.checkSecure([100]));
    app.get('/admin/userList', function (req, res) {
        res.render('Server/userList.html', {
            title: '>管理员设置',
            user: req.session.admin,
            websiteTitle: model.db.config.websiteTitle
        });
    });
}