var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Good = model.good,
    GoodAttribute = model.goodAttribute,
    GoodAttrVal = model.goodAttrVal,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/goodList', checkLogin);
    app.get('/admin/goodList', function (req, res) {
        res.render('Server/goodList.html', {
            title: '>商品列表',
            websiteTitle: model.db.config.websiteTitle,
            user: req.session.admin
        });
    });

    app.post('/admin/good/add', checkLogin);
    app.post('/admin/good/add', function (req, res) {
        Good.create({
                name: req.body.name,
                detail: req.body.detail,
                sequence: req.body.sequence,
                goodPrice: req.body.goodPrice,
                img: req.body.img,
                goodTypeId: req.body.goodTypeId,
                goodTypeName: req.body.goodTypeName,
                createdBy: req.session.admin._id
            })
            .then(function (result) {
                if (result) {
                    res.jsonp(result);
                }
            });
    });

    // 深拷贝产品
    function deepCopyGood(req, res) {
        var goodId = req.body.id;
        GoodAttribute.getFilters({
                goodId: goodId
            })
            .then(attrs => {
                // attrs[0].toJSON()
                GoodAttrVal.getFilters({
                        goodId: goodId
                    })
                    .then(vals => {
                        model.db.sequelize.transaction(function (t1) {
                                return Good.create({
                                        name: req.body.name,
                                        detail: req.body.detail,
                                        sequence: req.body.sequence,
                                        goodPrice: req.body.goodPrice,
                                        img: req.body.img,
                                        goodTypeId: req.body.goodTypeId,
                                        goodTypeName: req.body.goodTypeName,
                                        createdBy: req.session.admin._id
                                    }, {
                                        transaction: t1
                                    })
                                    .then(g => {
                                        if (attrs.length > 0) {
                                            var pArry = [],
                                                valArry = [];
                                            attrs.forEach(attr => {
                                                var option = attr.toJSON(),
                                                    oldAttrId = option._id;
                                                option._id = null;
                                                option.createdBy = g.createdBy;
                                                option.createdDate = g.createdDate;
                                                option.updatedDate = g.updatedDate;
                                                option.goodId = g._id;
                                                var p = GoodAttribute.create(option, {
                                                        transaction: t1
                                                    })
                                                    .then(newAttr => {
                                                        var i = 0;
                                                        while (i < vals.length) {
                                                            if (vals[i].goodAttrId == oldAttrId) {
                                                                var val = vals.splice(i, 1),
                                                                    option = val[0].toJSON();
                                                                option._id = null;
                                                                option.createdBy = newAttr.createdBy;
                                                                option.createdDate = newAttr.createdDate;
                                                                option.updatedDate = newAttr.updatedDate;
                                                                option.goodId = newAttr.goodId;
                                                                option.goodAttrId = newAttr._id
                                                                valArry.push(option);
                                                            } else {
                                                                i++;
                                                            }
                                                        }
                                                    });
                                                pArry.push(p);
                                            });
                                            return Promise.all(pArry)
                                                .then(o => {
                                                    return GoodAttrVal.bulkCreate(valArry, {
                                                        transaction: t1
                                                    });
                                                });
                                        }
                                    });
                            })
                            .then(o => {
                                res.jsonp({
                                    sucess: true
                                });
                            })
                            .catch(e => {
                                res.jsonp({
                                    error: e.toString()
                                });
                            });
                    })
                    .catch(e => {
                        res.jsonp({
                            error: e.toString()
                        });
                    });
            })
            .catch(e => {
                res.jsonp({
                    error: e.toString()
                });
            });
    };

    app.post('/admin/good/edit', checkLogin);
    app.post('/admin/good/edit', function (req, res) {
        if (req.body.isCopy == "true") {
            deepCopyGood(req, res);
        } else {
            Good.update({
                    name: req.body.name,
                    detail: req.body.detail,
                    sequence: req.body.sequence,
                    goodPrice: req.body.goodPrice,
                    img: req.body.img,
                    goodTypeId: req.body.goodTypeId,
                    goodTypeName: req.body.goodTypeName,
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
        }
    });

    app.post('/admin/good/delete', checkLogin);
    app.post('/admin/good/delete', function (req, res) {
        Good.update({
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

    app.post('/admin/goodList/search', checkLogin);
    app.post('/admin/goodList/search', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }
        Good.getFiltersWithPage(page, filter)
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