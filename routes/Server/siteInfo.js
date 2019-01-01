var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    SiteInfo = model.siteInfo,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/siteInfo', checkLogin);
    app.get('/admin/siteInfo', function (req, res) {
        auth.serverOption({
            title: '>站点信息',
            user: req.session.admin
        }).then(option => {
            res.render('Server/siteInfoList.html', option);
        });
    });

    app.post('/admin/siteInfo/edit', checkLogin);
    app.post('/admin/siteInfo/edit', function (req, res) {
        SiteInfo.update({
                name: req.body.name,
                description: req.body.description,
                deletedBy: req.session.admin._id
            }, {
                where: {}
            })
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/siteInfoList/search', checkLogin);
    app.post('/admin/siteInfoList/search', function (req, res) {
        SiteInfo.getFilter({})
            .then(function (result) {
                res.jsonp(result);
            });
    });
}