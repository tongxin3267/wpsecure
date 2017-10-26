var //client = require('./Client/index.js'),
    server = require('./Server/index.js'),
    // test = require('./Test/index.js'),
    generator = require('./Test/generator.js'),
    settings = require('../settings');

module.exports = function (app) {
    //client(app);
    server(app);
    // test(app);
    generator(app);

    app.use(function (req, res) {
        res.render("404.html");
    });
};