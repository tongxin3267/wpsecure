var https = require('https'),
    zlib = require('zlib'),
    crypto = require('crypto'),
    parseString = require('xml2js').parseString,
    util = require("util"),
    settings = require('../settings'),
    moment = require("moment"),
    model = require("../model.js"),
    SystemConfigure = model.systemConfigure,
    request = require('request');

var Wechat = {
    option: {
        appid: "wxa155aceaa74876cb",
        appSecret: "10266a3d9426016582b3ba34d937acc1"
    },
    getSessionKey: function (code, callback) {
        var that = this;
        request.get(util.format('https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=%s',
            that.option.appid,
            that.option.appSecret,
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
    getWXToken: function () {
        var that = this;
        return new Promise(function (resolve, reject) {
            request.get(util.format('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s',
                that.option.appid,
                that.option.appSecret
            ), function (error, response, body) {
                const data = JSON.parse(body);
                if (data.errcode) {
                    reject(data.errmsg);
                } else {
                    resolve(data);
                }
            })
        });
    },
    checkToken: function () {
        var that = this;
        return SystemConfigure.getFilter({
                name: "access_token"
            })
            .then(token => {
                if (token && token.value) {
                    // 2 小时有效，可以简单处理为1.5小时过期
                    var tokenJSON = JSON.parse(token.value);
                    if (moment().isAfter(moment(token.updatedDate).add(1.5, "hours"))) {
                        // 过期
                        return that.getWXToken()
                            .then(result => {
                                // 更新token信息
                                return SystemConfigure.update({
                                        value: JSON.stringify(result),
                                        updatedDate: new Date()
                                    })
                                    .then(u => {
                                        return {
                                            token: result.access_token
                                        };
                                    });
                            })
                            .catch(er => {
                                return {
                                    error: er
                                };
                            });
                    } else {
                        return {
                            token: tokenJSON.access_token
                        };
                    }
                } else {
                    return false;
                }
            });
    },
    sendPayMessage: function (order, formId, openid) {
        this.checkToken()
            .then(result => {
                if (result.error) {
                    return;
                }
                var data = {
                    "touser": openid,
                    "template_id": "vVxVs6QulMcvFpDbeBb52iBvip0o0X22hwARunvfP0k",
                    "page": "order/order",
                    "form_id": formId,
                    "data": {
                        "keyword1": {
                            "value": order._id
                        },
                        "keyword2": {
                            "value": order.createdDate
                        },
                        "keyword3": {
                            "value": order.updatedDate
                        },
                        "keyword4": {
                            "value": order.totalPrice
                        }
                    }
                };
                request.post(util.format('https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=%s',
                    result.token
                ), data, function (error, response, body) {
                    // do nothing
                })
            });
    }
};
module.exports = Wechat;