var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Company = model.company,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin', checkLogin);
    app.get('/admin', function (req, res) {
        var option = {
            title: '>公司列表',
            user: req.session.admin,
            websiteTitle: model.db.config.websiteTitle
        };
        res.render('Server/companyList.html', option);
    });

    app.get('/admin/siteInfo/:comId', checkLogin);
    app.get('/admin/siteInfo/:comId', function (req, res) {
        Company.getFilter({
                _id: req.params.comId
            })
            .then(company => {
                if (company) {
                    req.session.company = company;
                    res.render('Server/siteInfoList.html', {
                        title: '>站点信息',
                        user: req.session.admin,
                        websiteTitle: company.name
                    });
                } else {
                    res.redirect("/admin");
                }
            });
    });

    app.post('/admin/company/add', checkLogin);
    app.post('/admin/company/add', function (req, res) {
        Company.create({
                name: req.body.name,
                password: "e10adc3949ba59abbe56e057f20f883e",
                description: req.body.description,
                we_appId: req.body.we_appId,
                we_appSecret: req.body.we_appSecret,
                we_mch_id: req.body.we_mch_id,
                we_Mch_key: req.body.we_Mch_key,
                sequence: req.body.sequence,
                createdBy: req.session.admin._id
            })
            .then(function (result) {

                if (result) {
                    res.jsonp(result);
                }
            });
    });

    app.post('/admin/company/edit', checkLogin);
    app.post('/admin/company/edit', function (req, res) {
        Company.update({
                name: req.body.name,
                sequence: req.body.sequence,
                description: req.body.description,
                we_appId: req.body.we_appId,
                we_appSecret: req.body.we_appSecret,
                we_mch_id: req.body.we_mch_id,
                we_Mch_key: req.body.we_Mch_key,
                deletedBy: req.session.admin._id,
                updatedDate: new Date()
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/company/delete', checkLogin);
    app.post('/admin/company/delete', function (req, res) {
        Company.update({
                isDeleted: true,
                deletedBy: req.session.admin._id,
                deletedDate: new Date()
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (result) {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/companyList/search', checkLogin);
    app.post('/admin/companyList/search', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }

        Company.getFiltersWithPage(page, filter)
            .then(function (result) {
                res.jsonp({
                    records: result.rows,
                    total: result.count,
                    page: page,
                    pageSize: pageSize
                });
            });
    });
}