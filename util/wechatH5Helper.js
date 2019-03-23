// not used yet
var settings = require('../settings'),
    OAuth = require('wechat-oauth'),
    client = new OAuth(settings.appid, settings.appSecret);

var Wechat = {
    client: client
};
module.exports = Wechat;