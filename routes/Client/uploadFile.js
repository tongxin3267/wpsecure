var path = require('path'),
    multer = require('multer'),
    fs = require('fs'),
    model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    auth = require("./auth"),
    OrderDetailSnap = model.orderDetailSnap,
    crypto = require('crypto'),
    util = require('util'),
    request = require('request'),
    checkLogin = auth.checkLogin,
    serverPath = path.join(__dirname, "../"),
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/client/images/');
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    }),
    upload = multer({
        storage: storage
    });

module.exports = function (app) {
    // app.post('/client/imageUp', checkLogin);
    app.post('/client/imageUp', upload.single('upfile'), function (req, res, next) {
        OrderDetailSnap.create({
                orderDetailId: req.body.detailId,
                img: req.file.filename
            })
            .then(() => {
                res.json({
                    sucess: true
                });
            });
    });
}