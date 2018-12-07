var client = require('./Client/index.js'),
    server = require('./Server/index.js'),
    wechat = require('./Wechat/index.js'),
    // test = require('./Test/index.js'),
    generator = require('./Test/generator.js'),
    dbPressure = require('./Test/dbPressure.js'),
    settings = require('../settings');

module.exports = function (app) {
    client(app);
    server(app);
    wechat(app);
    // test(app);
    dbPressure(app);
    generator(app);

    app.use(function (req, res) {
        res.render("404.html", {
            websiteTitle: settings.websiteTitle
        });
    });
};