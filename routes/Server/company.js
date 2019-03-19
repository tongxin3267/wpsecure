var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Company = model.company,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/companyList', checkLogin);
    app.get('/admin/companyList', function(req, res) {
        auth.serverOption({
            title: '>校区列表',
            user: req.session.admin
        }).then(option => {
            res.render('ServercompanyList.html', option);
        });
    });

    app.post('/admin/company/add', checkLogin);
    app.post('/admin/company/add', function(req, res) {
        Company.create({
            name: req.body.name,
            sequence: req.body.sequence,
            createdBy: req.session.admin._id
        })
        .then(function(result){
            if(result)
            {
                 res.jsonp(result);
            }
        });
    });

    app.post('/admin/company/edit', checkLogin);
    app.post('/admin/company/edit', function(req, res) {
        Company.update({
            name: req.body.name,
            sequence: req.body.sequence,
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
    app.post('/admin/company/delete', function(req, res) {
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
    app.post('/admin/companyList/search', function(req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }
        if (req.body.grade) {
            filter.gradeId = req.body.grade;
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