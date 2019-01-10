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
            switch (file.fieldname) {
                case "upfile":
                    cb(null, './public/uploads/icons/');
                    break;
                case "bgImage":
                    cb(null, './public/uploads/images/');
                    break;
                case "bgVideo":
                    cb(null, './public/uploads/videos/');
                    break;
                default:
                    cb(null, './public/uploads/icons/');
                    break;
            }
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
    app.post('/admin/iconUp', checkLogin);
    app.post('/admin/iconUp', upload.single('upfile'), function (req, res, next) {
        res.json({
            sucess: true
        });
    });

    app.post('/admin/bgImageUp', checkLogin);
    app.post('/admin/bgImageUp', upload.single('bgImage'), function (req, res, next) {
        if (req.body.name == "bgImage") {
            var oldpath = path.join(serverPath, "../public/uploads/images", req.file.filename),
                newpath = path.join(serverPath, "../public/uploads/images", "bg.jpg");
            fs.rename(oldpath, newpath, function (err) {
                if (err) {
                    throw err;
                }
                res.json({
                    sucess: true
                });
            });
        } else if (req.body.name == "advImage") {
            var oldpath = path.join(serverPath, "../public/uploads/images", req.file.filename),
                newpath = path.join(serverPath, "../public/uploads/images", "front.jpg");
            fs.rename(oldpath, newpath, function (err) {
                if (err) {
                    throw err;
                }
                res.json({
                    sucess: true
                });
            });
        }
    });

    app.post('/admin/advVideoUp', checkLogin);
    app.post('/admin/advVideoUp', upload.single('bgVideo'), function (req, res, next) {
        var oldpath = path.join(serverPath, "../public/uploads/videos", req.file.filename),
            newpath = path.join(serverPath, "../public/uploads/videos", "adv.mp4");
        fs.rename(oldpath, newpath, function (err) {
            if (err) {
                throw err;
            }
            res.json({
                sucess: true
            });
        });
    });
}