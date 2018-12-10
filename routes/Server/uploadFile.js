var path = require('path'),
    multer = require('multer'),
    fs = require('fs'),
    model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    auth = require("./auth"),
    archiver = require('archiver'),
    crypto = require('crypto'),
    util = require('util'),
    request = require('request'),
    checkLogin = auth.checkLogin,
    serverPath = path.join(__dirname, "../"),
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/uploads/icons/');
        },
        filename: function (req, file, cb) {
            var extname = path.extname(file.originalname);
            cb(null, model.db.generateId() + extname);
        }
    }),
    upload = multer({
        storage: storage
    });

module.exports = function (app) {
    app.post('/admin/iconUp', upload.single('upfile'), function (req, res, next) {
        res.json({
            sucess: true
        });
    });
}