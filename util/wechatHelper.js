var https = require('https'),
    zlib = require('zlib'),
    crypto = require('crypto'),
    parseString = require('xml2js').parseString,
    util = require("util"),
    settings = require('../settings'),
    moment = require("moment"),
    model = require("../model.js"),
    SystemConfigure = model.systemConfigure,

    OpLogs = require("../models/mongodb/opLogs.js"),
    request = require('request');

var Wechat = {
    option: {
        appid: "wxa155aceaa74876cb",
        appSecret: "10266a3d9426016582b3ba34d937acc1",
        mch_id: "",
        Mch_key: "",
        notify_url: "http://localhost/wechat/wxpay"
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
        debugger;
        return new Promise(function (resolve, reject) {
            request.get(util.format('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s',
                that.option.appid,
                that.option.appSecret
            ), function (error, response, body) {
                debugger;
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
        debugger;
        return SystemConfigure.getFilter({
                name: "access_token"
            })
            .then(token => {
                debugger;
                if (token) {
                    if (token.value) {
                        // 2 小时有效，可以简单处理为1.5小时过期
                        var tokenJSON = JSON.parse(token.value);
                        if (moment().isAfter(moment(token.updatedDate).add(1.5, "hours"))) {
                            // need update
                        } else {
                            return {
                                token: tokenJSON.access_token
                            };
                        }
                    }
                    // no value need update and expire need update
                    // send log

                    var opLogs = new OpLogs({
                        userId: "",
                        description: "token server 出错了",
                        deletedBy: ""
                    });
                    opLogs.save();
                    // 过期
                    return that.getWXToken()
                        .then(result => {
                            // 更新token信息
                            debugger;
                            return SystemConfigure.update({
                                    value: JSON.stringify(result),
                                    updatedDate: new Date()
                                }, {
                                    where: {
                                        name: "access_token"
                                    }
                                })
                                .then(u => {
                                    debugger;
                                    return {
                                        token: result.access_token
                                    };
                                });
                        })
                        .catch(er => {
                            debugger;
                            return {
                                error: er
                            };
                        });
                } else {
                    return false;
                }
            });
    },
    selfRequest: function (option) {
        return new Promise(function (resolve, reject) {
            request(option,
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        resolve(body);
                    } else {
                        reject(error);
                    }
                });
        });
    },
    sendPayMessage: function (order, formId, openid) {
        // debugger;
        var that = this;
        this.checkToken()
            .then(result => {
                debugger;
                if (!result || result.error) {
                    return;
                }
                // remove page
                var data = {
                    "touser": openid,
                    "template_id": "vVxVs6QulMcvFpDbeBb52iBvip0o0X22hwARunvfP0k",
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
                selfRequest({
                    url: util.format('https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=%s', result.token),
                    method: "POST",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                    },
                    body: data
                })
            });
    },
    toxml: function (sendObject) {
        var keys = Object.getOwnPropertyNames(sendObject).sort();
        var xmlContent = "<xml>";
        keys.forEach(function (key) {
            xmlContent = xmlContent + "<" + key + "><![CDATA[" + sendObject[key] + "]]></" + key + ">"
        });
        xmlContent = xmlContent + "</xml>";
        return xmlContent;
    },
    createNonceStr: function () {
        return Math.random().toString(36).substr(2, 15)
    },
    getObjSign: function (sendObject) {
        var keys = Object.getOwnPropertyNames(sendObject).sort(),
            strPay = "";
        keys.forEach(function (key) {
            var v = sendObject[key];
            if ("sign" != key && "key" != key) {
                strPay = strPay + key + "=" + v + "&";
            }
        });
        strPay = strPay + "key=" + this.option.Mch_key;
        var md5 = crypto.createHash('md5'),
            sign = md5.update(strPay).digest('hex').toUpperCase();
        return sign;
    },
    getPaySign: function (sendObject) {
        var keys = Object.getOwnPropertyNames(sendObject).sort(),
            strPay = "";
        keys.forEach(function (key) {
            var v = sendObject[key];
            if ("sign" != key && "key" != key) {
                strPay = strPay + key + "=" + v + "&";
            }
        });
        strPay = strPay + "key=" + this.option.Mch_key;
        var md5 = crypto.createHash('md5'),
            sign = md5.update(strPay).digest('hex').toUpperCase();
        return sign;
    },
    selfParse: function () {
        return new Promise(function (resolve, reject) {
            parseString(data, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },
    getPrepayid: function (orderId, openId, IP, total) {
        //req.ip.replace(/::ffff:/, '')
        var that = this;
        var postData = {
            appid: this.option.option,
            mch_id: this.option.mch_id,
            nonce_str: this.createNonceStr(),
            //sign: "",
            body: "商品购买",
            out_trade_no: orderId,
            total_fee: 1,
            spbill_create_ip: IP,
            notify_url: this.option.notify_url,
            trade_type: "JSAPI",
            openid: openId
        };
        postData.sign = this.getObjSign(postData);
        return this.selfRequest({
                url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
                method: "POST",
                body: this.toxml(postData)
            })
            .then(data => {
                return that.selfParse(data)
                    .then(result => {
                        if (result.xml.return_code[0] == 'SUCCESS' && result.xml.result_code[0] == 'SUCCESS') {
                            var returnValue = {
                                appid: this.option.option, // no need return
                                nonce_str: result.xml.nonce_str[0],
                                package: 'prepay_id=' + result.xml.prepay_id[0],
                                signType: 'MD5',
                                timeStamp: Math.round(new Date().getTime() / 1000)
                            };
                            returnValue.paySign = that.getPaySign(returnValue);
                            returnValue.appid = "";
                            returnValue.orderId = orderId;
                            return returnValue;
                        } else {
                            return {
                                error: result.xml.err_code[0]
                            };
                        }
                    });
            });
    }
};
module.exports = Wechat;