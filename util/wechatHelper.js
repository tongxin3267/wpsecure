var https = require('https'),
    zlib = require('zlib'),
    crypto = require('crypto'),
    parseString = require('xml2js').parseString,
    util = require("util"),
    settings = require('../settings'),
    request = require('request');

var Wechat = {
    getSessionKey: function (code, appid, appSecret, callback) {
        // const opt = {
        //     method: 'GET',
        //     url: 'https://api.weixin.qq.com/sns/jscode2session',
        //     params: {
        //         appid: appid,
        //         secret: appSecret,
        //         js_code: code,
        //         grant_type: 'authorization_code'
        //     }
        // };
        request.get(util.format('https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=%s',
            appid,
            appSecret,
            code,
            'authorization_code'
        ), function (error, response, body) {
            const data = JSON.parse(body);
            if (!data.openid || !data.session_key || data.errcode) {
                callback({
                    error: data.errmsg || '返回数据字段不完整'
                });
            } else {
                callback(data);
            }
        });
    },

};
module.exports = Wechat;