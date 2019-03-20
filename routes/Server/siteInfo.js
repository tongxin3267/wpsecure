var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    SiteInfo = model.siteInfo,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/siteInfo', checkLogin);
    app.get('/admin/siteInfo', function (req, res) {
        res.render('Server/siteInfoList.html', {
            title: '>站点信息',
            user: req.session.admin,
            websiteTitle: req.session.company.name
        });
    });

    app.post('/admin/siteInfo/edit', checkLogin);
    app.post('/admin/siteInfo/edit', function (req, res) {
        SiteInfo.update({
                name: req.body.name,
                description: req.body.description,
                bgImg: req.body.bgImg,
                advImg: req.body.advImg,
                advideo: req.body.advideo,
                deletedBy: req.session.admin._id
            }, {
                where: {
                    companyId: req.session.company._id
                }
            })
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/siteInfoList/search', checkLogin);
    app.post('/admin/siteInfoList/search', function (req, res) {
        SiteInfo.getFilter({
                companyId: req.session.company._id
            })
            .then(function (result) {
                if (result) {
                    res.jsonp(result);
                } else {
                    return SiteInfo.create({
                            companyId: req.session.company._id,
                            name: req.session.company.name,
                            createdBy: req.session.admin._id
                        })
                        .then(site => {
                            res.jsonp(site);
                        });
                }
            });
    });
}