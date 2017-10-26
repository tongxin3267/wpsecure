var login = require('./login.js'),
    logout = require('./logout.js'),

    user = require('./user.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    login(app);
    logout(app);

    //basic
    user(app);
};