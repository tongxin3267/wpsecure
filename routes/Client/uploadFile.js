var path = require('path'),
    multer = require('multer'),
    auth = require("./auth"),
    model = require("../../model.js"),
    Images = require("../../models/mongodb/images.js"),

    checkLogin = auth.checkLogin,
    serverPath = path.join(__dirname, "../"),
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/uploads/client/images');
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
    app.post('/client/imageUp', checkLogin);
    app.post('/Client/imageUp', upload.single('upfile'), function (req, res, next) {
        var name = req.file.filename,
            img = "/uploads/client/images/" + name;
        // save image to mongodb
        var images = new Images({
            userId: (req.session.user ? req.session.user._id : 1),
            imageId: name,
            deletedBy: (req.session.user ? req.session.user._id : 1)
        });
        images.save()
            .then(function () {
                res.json({
                    originalName: name,
                    name: name,
                    url: img,
                    state: "SUCCESS"
                });
            });
    });
}