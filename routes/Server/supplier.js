var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Supplier = model.supplier,
    Company = model.company,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/supplierList', checkLogin);
    app.get('/admin/supplierList', function (req, res) {
        res.render('Server/supplierList.html', {
            title: '>供应商列表',
            user: req.session.admin,
            websiteTitle: req.session.company.name
        });
    });

    app.post('/admin/supplier/add', checkLogin);
    app.post('/admin/supplier/add', function (req, res) {
        Supplier.create({
                companyId: req.session.company._id,
                name: req.body.name,
                sequence: req.body.sequence,
                description: req.body.description,
                we_appId: req.body.we_appId,
                we_appSecret: req.body.we_appSecret,
                we_mch_id: req.body.we_mch_id,
                we_Mch_key: req.body.we_Mch_key,
                ali_appId: req.body.ali_appId,
                ali_privateKey: req.body.ali_privateKey,
                ali_alipayPublicKey: req.body.ali_alipayPublicKey,
                ali_gateway: req.body.ali_gateway,
                ali_app_auth_token: req.body.ali_app_auth_token,
                createdBy: req.session.admin._id
            })
            .then(function (result) {
                if (result) {
                    res.jsonp(result);
                }
            });
    });

    app.post('/admin/supplier/edit', checkLogin);
    app.post('/admin/supplier/edit', function (req, res) {
        Supplier.update({
                name: req.body.name,
                sequence: req.body.sequence,
                description: req.body.description,
                we_appId: req.body.we_appId,
                we_appSecret: req.body.we_appSecret,
                we_mch_id: req.body.we_mch_id,
                we_Mch_key: req.body.we_Mch_key,
                ali_appId: req.body.ali_appId,
                ali_privateKey: req.body.ali_privateKey,
                ali_alipayPublicKey: req.body.ali_alipayPublicKey,
                ali_gateway: req.body.ali_gateway,
                ali_app_auth_token: req.body.ali_app_auth_token,
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

    app.post('/admin/supplier/delete', checkLogin);
    app.post('/admin/supplier/delete', function (req, res) {
        Supplier.update({
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

    app.post('/admin/supplierList/search', checkLogin);
    app.post('/admin/supplierList/search', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {
            companyId: req.session.company._id
        };
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }

        Supplier.getFiltersWithPage(page, filter)
            .then(function (result) {
                res.jsonp({
                    records: result.rows,
                    total: result.count,
                    page: page,
                    pageSize: pageSize
                });
            });
    });

    app.post('/admin/supplierList/all', checkLogin);
    app.post('/admin/supplierList/all', function (req, res) {
        var filter = {
            companyId: req.session.company._id
        };

        Supplier.getFilters(filter)
            .then(function (results) {
                res.jsonp(results);
            });
    });
}