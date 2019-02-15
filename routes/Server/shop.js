var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Shop = model.shop,
    ShopPath = model.shopPath,
    auth = require("./auth"),
    AlipaySdk = require('alipay-sdk').default,
    qr = require('qr-image'),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/shopList', checkLogin);
    app.get('/admin/shopList', function (req, res) {
        auth.serverOption({
            title: '>机器列表',
            user: req.session.admin
        }).then(option => {
            res.render('Server/shopList.html', option);
        });
    });

    app.post('/admin/shop/add', checkLogin);
    app.post('/admin/shop/add', function (req, res) {
        Shop.create({
                name: req.body.name,
                password: "123456", //Math.random().toString(12).substr(2, 10),
                address: req.body.address,
                hpathCount: req.body.hpathCount,
                vpathCount: req.body.vpathCount,
                phone: req.body.phone,
                openTime: req.body.openTime,
                createdBy: req.session.admin._id
            })
            .then(function (result) {
                if (result) {
                    res.jsonp(result);
                }
            });
    });

    app.post('/admin/shop/edit', checkLogin);
    app.post('/admin/shop/edit', function (req, res) {
        Shop.update({
                name: req.body.name,
                address: req.body.address,
                hpathCount: req.body.hpathCount,
                vpathCount: req.body.vpathCount,
                phone: req.body.phone,
                openTime: req.body.openTime,
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

    app.post('/admin/shop/delete', checkLogin);
    app.post('/admin/shop/delete', function (req, res) {
        Shop.update({
                isDeleted: true,
                deletedBy: req.session.admin._id,
                deletedDate: new Date()
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (result) {
                ShopPath.update({
                        isDeleted: true,
                        deletedBy: req.session.admin._id,
                        deletedDate: new Date()
                    }, {
                        where: {
                            shopId: req.body.id
                        }
                    })
                    .then(() => {
                        res.jsonp({
                            sucess: true
                        });
                    })
            });
    });

    app.post('/admin/shopList/search', checkLogin);
    app.post('/admin/shopList/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }

        Shop.getFiltersWithPage(page, filter)
            .then(function (result) {
                res.jsonp({
                    records: result.rows,
                    total: result.count,
                    page: page,
                    pageSize: pageSize
                });
            });
    });

    // 设置轨道
    app.post('/admin/shop/resetPath', checkLogin);
    app.post('/admin/shop/resetPath', function (req, res) {
        ShopPath.update({
                isDeleted: true,
                deletedBy: req.session.admin._id,
                deletedDate: new Date()
            }, {
                where: {
                    shopId: req.body.id
                }
            })
            .then(function () {
                var i = parseInt(req.body.hpathCount),
                    j = parseInt(req.body.vpathCount),
                    total = i * j,
                    shopPaths = [];

                for (var i = 0; i < total; i++) {
                    shopPaths.push({
                        sequence: i + 1,
                        shopId: req.body.id
                    });
                }
                // update path also
                ShopPath.bulkCreate(shopPaths)
                    .then(() => {
                        res.jsonp({
                            sucess: true
                        });
                    });
            });
    });

    //admin/authRedirect
    app.post('/admin/shop/getQRCode', checkLogin);
    app.post('/admin/shop/getQRCode', function (req, res) {
        const alipaySdk = new AlipaySdk({
            appId: '2016092400584469',
            privateKey: 'MIIEpAIBAAKCAQEA1NUBo5ks4qzK/w1gOGytwP8a+LKydLq0N5DM31eTuQ8H0U2UlOp+MKwoVZ3SbplEpbQa3nro+9o6IQEjNN2erEqP27r1D+ymL8nT1/gz23RhTiHWhYG3XhdUE5+04nJ+2nOrOOdGmmYdR8XvEdGkPkmZUbtk+W4ZhGT/po/8/P8jGQ+pkbQy0siyDIYU6H8HsmYJTv9iPzIZfKseveCVVlv9zk3vb6ulouT3hGBS0V1xGNNoXD1lbOThvv4diQYQiy+Hs5UUi18GuXTXD4sQVngTFq4wVFPNQkbEjMeDch/9F4jk986XZ4Xu5LJBUGi/EIjIoQN6uIFgoKeUVqWXwwIDAQABAoIBAQCpzXPsUWYlR1UB3msZOWP7Kc0cBH4qcVcdSfKaciXSrLJBBBN6KAgbzw6zGCJuyOujBKm3PPqrDTX5ZQ3wvKw+q5JQ7b1dQiJo2C6jDUxaV2TW0Fp108M3V4dlzLKlRFH++e/ui16iCrxrqfiOD+NpKpEfS1JJStUi8u2gtxpRwcuqzIjk8MRlh7lxyrM0xm+r/WRDwNPe5lVf1bEBZ5Bh1vqxin6+gTivqkhI+0S4Eb+EhLwwwHmsGQbSrLeletTe9VXfpl8RbdgKC9h50s0gX0vFo8p3seL6GLOGVBFuSIb8J79VNnQrxLuthKphamA9ks4euba5G8iDEnGqdFGpAoGBAPntTk9v0NP+3+LY51rVSm6iLeVd4SxRExqXf14LgqLr1opjUizHxZL5KvwJtNqGMEqbMkxTkPsGaTZqoLMLI4Wv0lE2hz9gmVgpX74+a/wGc4tpheEsciRbx5/5t12e4xt915dynR6M/8X7MUzgAG15ErCDvREe/q5YswFqfagHAoGBANoA8rXw3FkLSH98iAdcn6DcVeM4X+6nnKvRcIJAgudFTLo6HC+AAr+HTrDBGgs6PRbK7VAo5+aOev01LeXwnKFDI86ztl72bczhNemingjG0EENFoa1fQNf6Rwq9JMI6dkGJrt3XiqRyywjLDRi1PlAnCcZPJL6IbZa9QkR1gtlAoGADQnXSwefUl/6mCAOuctkza7CTDQAmkpEf9+lcmeRUiSRlbimwdVONmOvXWS4PapAfLPqBNdbOe1UsdUQOyb6nG/WvgvlNGY6ucG2z/r7sTM49e30YRHrhoAPQwZJDaZLXNTM2YbOMZjTgyWepc8N1qg5VGIbC/ic+sV/2TQQCCMCgYEAhgqfMY9vbLCrWvfPC/e/jsDrblJzaeJVSq/0ZaIU2u6ZRsgEHJCxH+KqV7Pjt5OPjDwpvmfobrKcnKPeHMvdAqqtkaKeN7V9vcObypPaZ7sWwWiyuRFOVIzcYB1pVB7e6joGBq5WkAYkznax72P1X2yClufFfvmdUOqMT49P9KECgYAGM07iqHK8AbIjhrMSXP5z0ytIC31jzEaQYRL0PxpgM8O3KylyK9vxPkHELKdaUiTeGWT/mYzQmpg9ZfinPBBkYgGivZzewwl0FgYLIhVuG+DeiUUOIrp4jManmkKv+rr46Umnt+Dlt/09s0L2oJ9xkp5ONCCrJK37eQghSgwCCg==',
            alipayPublicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlX82Rj5oQUSjeGbrKnmyf3bz6x2e6C8iqw8jqPSRZ7wm9di6EQPLxzbp0XDlDLXU7ONFSJcAfhh/ol+esPbC1ezvRW8qvHHqOXWJrPx6qmE3m2lIAIX1TkIHxOuf8ioEJ5qQpSGFk1yAProFGp8nnW96ZxWYZjX/lbJcTe8FQHRx/qb1QSb/3D/MgQ5OTCWlyN66FBAyPpJcZ9z+3F/oodf+wI/AjJjx8FLB0EZ4GS+3EFWpDHPYWtfXzOTb5twKX5YFPtLP15mLnFGGdCOrvmM/ri0f6qNDgwG/fm3c9pHkqWW0GVfkWJcboJO/DxEYjxw5aB4j1GuqDiIpzLa8RwIDAQAB',
            gateway: "https://openapi.alipaydev.com/gateway.do"
        });

        alipaySdk.exec("alipay.trade.precreate", {
                bizContent: {
                    out_trade_no: '11124',
                    total_amount: '0.01',
                    subject: '商品',
                }
            }, {
                validateSign: true
            })
            .then(result => {
                // console.log(result);
                code = qr.imageSync(result.qrCode, {
                    type: 'png',
                    parse_url: true
                })
                res.jsonp({
                    qrCode: code
                });
            })
            .catch(err => {
                // ...
            });
    });

    // app.post('/admin/showQRCode', function (req, res) {
    //     code = qr.image('点开就是承认伍猪猪是只臭猪', {
    //         type: 'png'
    //     })
    //     res.sendFile(__dirname + '/index.html')
    //     code.pipe(res);
    // });
}