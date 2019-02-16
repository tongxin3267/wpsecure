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
            appId: '2019021563247513',
            privateKey: 'MIIEpgIBAAKCAQEAsrY5wNvZaSeK1lNxWwt15xJpaB/XHcYOuacxlJGi/OQkddy2uwWn86SmtK2MuvlwmBF11RfxDSu9T4bFISdrcfwA+0FJLyeXrw84AeZr3sFQE+GQEV+VL6osba5TvfS28MrLLsv0291kkcZJo7Rf4tRxKUNlfTmDniHJrzZyeC2mD5I4zF+IFX0xi3hFRIBdWI9pdCYZcOHDDE+AyoYGiArlj89T/6DgsslW95pkzNcThocGHN4Oqj0bJdcJgT/ZaqjNjw4eLpGAdYuE9huHWFKyPi0NVaDoi0tnFnnxA2OomgTfCC9yVdFBnEg8hSvozeotv6EOc9arLVbosNT6rQIDAQABAoIBAQCisP3Wss4zyom8H+6cIczN9Zb78bCWLE4PeUPLquGkM9V1bt7zV2zUg1o4NZ5eQOLdrVeGDOunP+Bx25DuY8KO3AnQslh7kyGlfsdQA4LEIVxTHQ9YoZlg8RzNJNybm4JHp3ZdPdPFrMD3bHpxi62XBCuYkwB7hbZqaPwAhCKlf/Nw8cAU2fHcuQyO1bvKUzm/wmx4wrkJ2vJJY4grcQR01ne/Q7lSBcfvuBoTEWs7KKLC/Gm3ayl+4ArAT2LkGunjHnUFL3O8qVXOqS7KxoIj2m7pfxeKKkiywf2pqQY0UYYzIKO95T+6VB/8XEWa3NE4y2a65DITMCSi8swONQsJAoGBAN2+++TNUIQMYrWurOxbhPtllQDKZmLUvccE2ulsNwyOwUY2ARkQ1/nNTEZs212plnP/g9Qdck3SHpop7K3TF6td1MtF9o59oLgbKiGLMcCd56SfgJlf+Nk46D0sG3Aju/6/UH27tjfvpT3dRpvCAx3WUqDPlxGI57mTfPzSKo5/AoGBAM5RcLXQ92MpG/RS7+B3S89NHFth1E03Q1UuxwddGhrtlAXpXLWTF+nij+BkzNoHqbTEx0IDCeJJbwBnPMEVZTZ6KEEw1GFFu9CDpTzIeT/ZMrypG+PikCFj7xYPGrei2twLtgHBseuYaxR8pKVJ4ZuDHDd65SjrKgVRJlQMCnjTAoGBAL2i6isXRydWrEgyFSKhdg3FJvOhJISa6Z29UjXT3RQ5NaME5lV4aSvx3axQxh3IvamAOE57zFgvPQqclhNl9tUQDr60m5HqcDtix9od/zN6FzNbURBZ2ihzGXHPObviY5EOLhkJImGd6dQJW6wy9JVcyBdM0SYmzf2P25Efb1OjAoGBAK2YutRQ0ob95QaL7kgZOJFhmXWOeBrMX/xBkrewb7GuqzjaJOamsJ1bw6GUTwU5I2L1m48AjYV4MkzNkMIJ5ZKT8GEB3AFIsoH88sCVEehWMamqRMxXKtzdgCM4bEuNXMd/lxIdTz4jjh27zrFA2/KEu+42mrD2RfIZWL2pL/p/AoGBAKGdUZPwBAayW0DP8ImO67Pv+Fd1D9Jj5fgaZNOqLAbBfksD4EMB1jD7yBA6tJwyHqkjC/G30vilF0Rer/t3RVQVDk2HFOejSIURNZKC1pFxlT00FTLm9hSIc+UefWgI3WxUDkvTMTQYotFbzswesKxN5ZnqE5Dr14gTZ8lPTG1d',
            alipayPublicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs96m0LfhrkT2Pn68NTSLM3K3xqBzNoenF61/cl0wfq4P3sa9pEzEJdJN40K7geQBeKtlQcRlbX/Gsh1LvukFmtLh7CsQHCeLyMdpUQimN2SMsHGpXKZ+vMXp2qvXhlULih3m6v12WNdlo+x1KJd4rdEzFr7hmXrHuTuCYrGXJrRIyTVfA5vgX2GsrLtPen9VQ4QveBRalBjFfqTtuCYJ428WF4FQAvQS1/DPeOG3RoZgaovdMBUWGKC/nBBfSpgD4K/aQKLba7QCm8VsiUouVDMxY7JHdTtEyOkB4F5waOPO1nDmHgoNFdlXLIVt0DTHYI+1vXolIME/K5IhGLAAWQIDAQAB',
            gateway: "https://openapi.alipay.com/gateway.do",
            app_auth_token:"201902BBffc0fbde4b54400eaabe92869bb4fX88"
        });

        alipaySdk.exec("alipay.trade.precreate", {
                bizContent: {
                    out_trade_no: '100',
                    total_amount: '0.01',
                    subject: '商品',
                    
                }
            }, {
                validateSign: false
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

    app.get('/admin/authRedirect', function (req, res) {
        // req.url
"/admin/authRedirect?app_id=2019021563247513&app_auth_code=P66448f0fa78143e39de5026f17ca388"
    });
}