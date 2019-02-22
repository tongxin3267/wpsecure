var https = require('https'),
    zlib = require('zlib'),
    crypto = require('crypto'),
    xml2js = require('xml2js'),
    parseString = xml2js.parseString,
    builder = new xml2js.Builder({
        rootName: 'xml',
        cdata: true,
        headless: true,
        renderOpts: {
            indent: ' ',
            pretty: 'true'
        }
    }),
    util = require("util"),
    settings = require('../settings'),
    moment = require("moment"),
    model = require("../model.js"),
    SystemConfigure = model.systemConfigure,
    wecrypto = require("wechat-crypto"),

    OpLogs = require("../models/mongodb/opLogs.js"),
    request = require('request');

var Wechat = {
    option: {
        appid: "wxd4cd3a00e87c0492",
        appSecret: "25b22d9fc83482e79bd67849cb7e273f",
        mch_id: "",
        Mch_key: "",
        notify_url: "http://localhost/wechat/wxpay",
        token: "efinertwxotoken",
        aesKey: new Buffer.from('xs2uDjITp5WhVawEOt8un0YD1RvGqJ6pHcNG1mIkIFf=', 'base64'),
        iv: "xs2uDjITp5WhVawE"
    },
    setkeyIv: function () {
        this.option.aesKey = new Buffer(this.option.aesKey + '=', 'base64');
        this.option.iv = this.option.aesKey.slice(0, 16);
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
        // return builder.buildObject(sendObject);
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
    selfParse: function (data) {
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
                                error: result.xml.err_code ? result.xml.err_code[0] : result.xml.return_msg[0]
                            };
                        }
                    });
            });
    },
    decryptMsg: function (msgSignature, timestamp, nonce, data) {
        // this.setkeyIv();
        var that = this;
        return this.selfParse(data)
            .then(xml => {
                var msg_encrypt = xml.xml.Encrypt[0];
                if (that.getSignature(timestamp, nonce, msg_encrypt) != msgSignature) {
                    throw new Error('msgSignature is not invalid');
                };
                var decryptedMessage = that.decrypt(msg_encrypt);
                return that.selfParse(decryptedMessage);
            });
    },
    encryptMsg: function (replyMsg, opts) {
        var wecrypto1 = new wecrypto(this.option.token, "xs2uDjITp5WhVawEOt8un0YD1RvGqJ6pHcNG1mIkIFf", this.option.appid);
        var result = {};
        var options = opts || {};
        result.Encrypt = wecrypto1.encrypt(builder.buildObject(replyMsg));
        result.Nonce = options.nonce || parseInt((Math.random() * 100000000000), 10);
        result.TimeStamp = options.timestamp || new Date().getTime();
        result.MsgSignature = this.getSignature(result.TimeStamp, result.Nonce, result.Encrypt);
        return builder.buildObject(result);
        // var result = {};
        // var options = opts || {};
        // result.Encrypt = this.encrypt(this.toxml(replyMsg));
        // result.Nonce = options.nonce || parseInt((Math.random() * 100000000000), 10);
        // result.TimeStamp = options.timestamp || new Date().getTime();
        // result.MsgSignature = this.getSignature(result.TimeStamp, result.Nonce, result.Encrypt);
        // return builder.buildObject(result);
    },
    getSignature: function (timestamp, nonce, encrypt) {
        // token?
        var raw_signature = [this.option.token, timestamp, nonce, encrypt].sort().join('');
        var sha1 = crypto.createHash("sha1");
        sha1.update(raw_signature);
        return sha1.digest("hex");
    },
    decrypt: function (str) {
        var aesCipher = crypto.createDecipheriv("aes-256-cbc", this.option.aesKey, this.option.iv);
        aesCipher.setAutoPadding(false);
        var decipheredBuff = Buffer.concat([aesCipher.update(str, 'base64'), aesCipher.final()]);
        decipheredBuff = this.PKCS7Decoder(decipheredBuff);
        var len_netOrder_corpid = decipheredBuff.slice(16);
        var msg_len = len_netOrder_corpid.slice(0, 4).readUInt32BE(0);
        var result = len_netOrder_corpid.slice(4, msg_len + 4).toString();
        var appId = len_netOrder_corpid.slice(msg_len + 4).toString();
        if (appId != this.option.appid) {
            throw new Error('appId is invalid');
        }
        return result;
    },
    encrypt: function (xmlMsg) {
        var randomString = crypto.pseudoRandomBytes(16);

        var msg = new Buffer(xmlMsg);

        // 获取4B的内容长度的网络字节序
        var msgLength = new Buffer(4);
        msgLength.writeUInt32BE(msg.length, 0);

        var id = new Buffer(this.option.appid);

        var bufMsg = Buffer.concat([randomString, msgLength, msg, id]);

        // 对明文进行补位操作
        var encoded = this.PKCS7Encoder(bufMsg);

        // 创建加密对象，AES采用CBC模式，数据采用PKCS#7填充；IV初始向量大小为16字节，取AESKey前16字节
        var cipher = crypto.createCipheriv('aes-256-cbc', this.option.aesKey, this.option.iv);
        cipher.setAutoPadding(false);

        var cipheredMsg = Buffer.concat([cipher.update(encoded), cipher.final()]);

        // 返回加密数据的base64编码
        return cipheredMsg.toString('base64');
    },
    PKCS7Decoder: function (buff) {
        var pad = buff[buff.length - 1];
        if (pad < 1 || pad > 32) {
            pad = 0;
        }
        return buff.slice(0, buff.length - pad);
    },
    PKCS7Encoder: function (buff) {
        var blockSize = 32;
        var strSize = buff.length;
        var amountToPad = blockSize - (strSize % blockSize);
        var pad = new Buffer(amountToPad - 1);
        pad.fill(String.fromCharCode(amountToPad));
        return Buffer.concat([buff, pad]);
    },
    getWXComponentToken: function () {
        var that = this;
        // debugger;
        return SystemConfigure.getFilter({
                name: "component_verify_ticket"
            })
            .then(ticket => {
                return new Promise(function (resolve, reject) {
                    request({
                        url: 'https://api.weixin.qq.com/cgi-bin/component/api_component_token',
                        method: 'POST',
                        json: {
                            "component_appid": that.option.appid,
                            "component_appsecret": that.option.appSecret,
                            "component_verify_ticket": ticket.value
                        },
                    }, (err, res, data) => {
                        // debugger;
                        // const data = JSON.parse(body);
                        if (data.errcode) {
                            reject(data.errmsg);
                        } else {
                            resolve(data.component_access_token);
                        }
                    });
                });
            });
    },
    checkComponetToken: function () {
        var that = this;
        // debugger;
        return SystemConfigure.getFilter({
                name: "component_access_token"
            })
            .then(token => {
                // debugger;
                if (token) {
                    if (token.value) {
                        // 2 小时有效，可以简单处理为1.5小时过期
                        // var tokenJSON = JSON.parse(token.value);
                        if (moment().isAfter(moment(token.updatedDate).add(1.5, "hours"))) {
                            // need update
                        } else {
                            return {
                                token: token.value
                            };
                        }
                    }
                    // no value need update and expire need update
                    // send log
                    // 过期
                    return that.getWXComponentToken()
                        .then(result => {
                            // 更新token信息
                            // debugger;
                            return SystemConfigure.update({
                                    value: result,
                                    updatedDate: new Date()
                                }, {
                                    where: {
                                        name: "component_access_token"
                                    }
                                })
                                .then(u => {
                                    // debugger;
                                    return {
                                        token: result
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
    getpreauthcode: function (toAppId) {
        var that = this;
        // debugger;
        return this.checkComponetToken()
            .then(token => {
                return new Promise(function (resolve, reject) {
                    request({
                        url: 'https://api.weixin.qq.com/cgi-bin/component/api_create_preauthcode?component_access_token=' + token.token,
                        method: 'POST',
                        json: {
                            "component_appid": that.option.appid
                        }
                    }, (err, res, data) => {
                        // debugger;
                        // const data = JSON.parse(body);
                        if (data.errcode) {
                            reject(data.errmsg);
                        } else {
                            var url = "https://mp.weixin.qq.com/safe/bindcomponent?action=bindcomponent&auth_type=1&no_scan=1&component_appid=" + that.option.appid + "&pre_auth_code=" + data.pre_auth_code + "&redirect_uri=http://e-finer.com/admin/saveAuth&biz_appid=" + toAppId + "#wechat_redirect";
                            resolve(url);
                        }
                    });
                });
            });
    },
    firstrefreshtoken: function (auth_code) {
        var that = this;
        // debugger;
        return this.checkComponetToken()
            .then(token => {
                return new Promise(function (resolve, reject) {
                    request({
                        url: 'https://api.weixin.qq.com/cgi-bin/component/api_query_auth?component_access_token=' + token.token,
                        method: 'POST',
                        json: {
                            "component_appid": that.option.appid,
                            "authorization_code": auth_code
                        },
                    }, (err, res, data) => {
                        // debugger;
                        // const data = JSON.parse(body);
                        if (data.errcode) {
                            reject(data.errmsg);
                        } else {
                            resolve(data.authorization_info);
                        }
                    });
                });
            });
    },
    refreshtoken: function (toAppId) {
        var that = this;
        // debugger;
        return this.checkComponetToken()
            .then(token => {
                return SystemConfigure.getFilter({
                        name: "authorizer_refresh_token",
                        appId: toAppId
                    })
                    .then(refreshtoken => {
                        return new Promise(function (resolve, reject) {
                                request({
                                    url: 'https://api.weixin.qq.com/cgi-bin/component/api_authorizer_token?component_access_token=' + token.token,
                                    method: 'POST',
                                    json: {
                                        "component_appid": that.option.appid,
                                        "authorizer_appid": toAppId,
                                        "authorizer_refresh_token": refreshtoken.value
                                    },
                                }, (err, res, data) => {
                                    // debugger;
                                    // const data = JSON.parse(body);
                                    if (data.errcode) {
                                        reject(data.errmsg);
                                    } else {
                                        resolve(data.authorizer_access_token);
                                    }
                                });
                            })
                            .then(authorizer_access_token => {
                                return SystemConfigure.update({
                                    value: authorizer_access_token,
                                    updatedDate: new Date()
                                }, {
                                    where: {
                                        appId: toAppId,
                                        name: "authorizer_access_token"
                                    }
                                });
                            });
                    });
            });
    },
    saverefreshtoken: function (authorization_info) {
        return SystemConfigure.getFilter({
                appId: authorization_info.authorizer_appid,
                name: "authorizer_refresh_token"
            })
            .then(sysconfig => {
                if (sysconfig) {
                    return SystemConfigure.update({
                            value: authorization_info.authorizer_access_token,
                            updatedDate: new Date()
                        }, {
                            where: {
                                name: "authorizer_access_token",
                                appId: authorization_info.authorizer_appid
                            }
                        })
                        .then(() => {
                            return SystemConfigure.update({
                                value: authorization_info.authorizer_refresh_token,
                                updatedDate: new Date()
                            }, {
                                where: {
                                    appId: authorization_info.authorizer_appid,
                                    name: "authorizer_refresh_token"
                                }
                            });
                        });
                } else {
                    return SystemConfigure.bulkCreate([{
                        value: authorization_info.authorizer_access_token,
                        name: "authorizer_access_token",
                        appId: authorization_info.authorizer_appid
                    }, {
                        value: authorization_info.authorizer_refresh_token,
                        name: "authorizer_refresh_token",
                        appId: authorization_info.authorizer_appid
                    }]);
                }
            })
    },
    getcusQRCode: function (toAppId) {
        return SystemConfigure.getFilter({
                appId: toAppId,
                name: "authorizer_access_token"
            })
            .then(token => {
                return new Promise(function (resolve, reject) {
                    request({
                        url: 'https://api.weixin.qq.com/cgi-bin/qrcode/create?component_access_token=' + token.value,
                        method: 'POST',
                        json: {
                            "expire_seconds": 600,
                            "action_name": "QR_SCENE",
                            "action_info": {
                                "scene": {
                                    "scene_id": 123
                                }
                            }
                        },
                    }, (err, res, data) => {
                        // debugger;
                        // const data = JSON.parse(body);
                        if (data.errcode) {
                            reject(data.errmsg);
                        } else {
                            resolve(data.ticket);
                        }
                    });
                });
            });
    }
};
module.exports = Wechat;