var moment = require("moment"),
    model = require("../model.js"),
    SystemConfigure = model.systemConfigure,
    request = require('request'),
    wechatAPI = require('wechat-enterprise-api'),
    wecrypto = require("wechat-crypto"),
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
    });

var weapi = {
    _weapi: null,
    _crypto: null,
    thirdAppId: "ww683e156d777a4cf6",
    thirdSecret: "_yBtCzdlDSkFQrLNiX2KaM4aupMFGSMEcz5G4425n0g",
    thirdToken: "2OxqDavW",
    thirdAESKey: "sWrM5nSmxVWa4lPBB4vN2C6hqJhG7JQUD8cKyls2mag",
    suite_access_tokenURL: "https://qyapi.weixin.qq.com/cgi-bin/service/get_suite_token",
    pre_auth_codeURL: "https://qyapi.weixin.qq.com/cgi-bin/service/get_pre_auth_code?suite_access_token=",
    set_sessionURL: "https://qyapi.weixin.qq.com/cgi-bin/service/set_session_info?suite_access_token=",
    get_permanent_codeURL: "https://qyapi.weixin.qq.com/cgi-bin/service/get_permanent_code?suite_access_token=",
    get_corp_tokenURL: "https://qyapi.weixin.qq.com/cgi-bin/service/get_corp_token?suite_access_token=",
    get_auth_infoURL: "https://qyapi.weixin.qq.com/cgi-bin/service/get_auth_info?suite_access_token=",
    getuserURL: "https://qyapi.weixin.qq.com/cgi-bin/user/get?access_token=",
    weApi: function () {
        if (!this._weapi) {
            this._weapi = new wechatAPI('ww1c286ef33caa2252', 'gdWILiRzCtujjUYkEZFwTYlRT7J_4kGubglbXHnKaHg', '1000013', function (callback) {
                SystemConfigure.getFilter({
                        key: "salaryToken"
                    })
                    .then(configure => {
                        if (moment().isBefore(moment(configure.updatedDate).add(1.8, "hours"))) {
                            callback(null, configure.value && JSON.parse(configure.value));
                        } else {
                            callback(null, null);
                        }
                    });
            }, function (token, callback) {
                SystemConfigure.update({
                        value: JSON.stringify(token),
                        updatedDate: new Date()
                    }, {
                        where: {
                            key: "salaryToken"
                        }
                    })
                    .then(() => {
                        callback();
                    });
            });
        }
        return this._weapi;
    },
    getwecrypto: function () {
        if (!this._crypto) {
            this._crypto = new wecrypto(this.thirdToken, this.thirdAESKey, this.thirdAppId);
        }
        return this._crypto;
    },
    getURL: function (url) {
        return new Promise(function (resolve, reject) {
            request.get(url,
                function (error, response, body) {
                    const data = JSON.parse(body);
                    if (data.errcode) {
                        reject(data.errmsg);
                    } else {
                        resolve(data);
                    }
                });
        });
    },
    postURL: function (url, params) {
        return new Promise(function (resolve, reject) {
            request({
                url: url,
                method: 'POST',
                json: params
            }, (err, res, data) => {
                if (data.errcode) {
                    reject(data.errmsg);
                } else {
                    resolve(data);
                }
            });
        });
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
    getAuthorizeURL: function (redirecturi) {
        return this.weApi().getAuthorizeURL(redirecturi);
    },
    getUserIdByCode: function (code) {
        var that = this;
        return new Promise(function (resolve, reject) {
            that.weApi().getUserIdByCode(code, function (err, results) {
                resolve(results);
            });
        });
    },
    getUser: function (userId) {
        var that = this;
        return new Promise(function (resolve, reject) {
            that.weApi().getUser(userId, function (err, results) {
                resolve(results);
            });
        });
    },
    getRawBody: function (req) {
        return new Promise(function (resolve, reject) {
            if (req.rawBody) {
                resolve(req.rawBody);
                return;
            }

            var data = '';
            req.setEncoding('utf8');
            req.on('data', function (chunk) {
                data += chunk;
            });

            req.on('end', function () {
                req.rawBody = data;
                resolve(data);
            });
        });
    },
    baseDecryptMsg: function (msgSignature, timestamp, nonce, data) {
        var that = this;
        var msg_encrypt = data;
        var _crypto = that.getwecrypto();
        if (_crypto.getSignature(timestamp, nonce, msg_encrypt) != msgSignature) {
            return Promise.reject('msgSignature is not invalid');
        };
        var decryptedMessage = _crypto.decrypt(msg_encrypt);
        return decryptedMessage.message;
    },
    decryptMsg: function (msgSignature, timestamp, nonce, data) {
        var that = this;
        return this.selfParse(data)
            .then(xml => {
                var msg_encrypt = xml.xml.Encrypt[0];
                var _crypto = that.getwecrypto();
                if (_crypto.getSignature(timestamp, nonce, msg_encrypt) != msgSignature) {
                    return Promise.reject('msgSignature is not invalid');
                };
                var decryptedMessage = _crypto.decrypt(msg_encrypt);
                return that.selfParse(decryptedMessage.message);
            });
    },
    getcorp_token: function (toAppId) {
        return SystemConfigure.getFilter({
            name: "access_token",
            appId: toAppId,
            suitId: this.thirdAppId
        });
    },
    saveaccess_token: function (token, suitId, toAppId) {
        return SystemConfigure.update({
            value: token,
            updatedDate: new Date()
        }, {
            where: {
                name: "access_token",
                appId: toAppId,
                suitId: this.thirdAppId
            }
        });
    },
    getpermanent_code: function (toAppId) {
        return SystemConfigure.getFilter({
            name: "permanent_code",
            appId: toAppId,
            suitId: this.thirdAppId
        });
    },
    savepermanent_code: function (code, suitId, toAppId) {
        return SystemConfigure.update({
            value: code,
            updatedDate: new Date()
        }, {
            where: {
                name: "permanent_code",
                appId: toAppId,
                suitId: this.thirdAppId
            }
        });
    },
    getsuite_ticket: function () {
        return SystemConfigure.getFilter({
            name: 'suite_ticket',
            suitId: this.thirdAppId
        });
    },
    getsuite_access_token: function () {
        return SystemConfigure.getFilter({
            name: "suite_access_token",
            suitId: this.thirdAppId
        });
    },
    refreshsuite_access_token: function () {
        var that = this;
        // debugger;
        return that.getsuite_ticket()
            .then(ticket => {
                return that.postURL(that.suite_access_tokenURL, {
                        "suite_id": that.thirdAppId,
                        "suite_secret": that.thirdSecret,
                        "suite_ticket": ticket.value
                    })
                    .then(result => {
                        return result.suite_access_token;
                    });
            });
    },
    checksuite_access_token: function () {
        var that = this;
        return that.getsuite_access_token()
            .then(token => {
                if (token) {
                    // 2 小时有效，可以简单处理为1.5小时过期
                    if (moment().isBefore(moment(token.updatedDate).add(1.8, "hours"))) {
                        return token.value;
                    }

                    // 过期
                    return that.refreshsuite_access_token()
                        .then(newToken => {
                            token.value = newToken;
                            token.updatedDate = new Date();
                            token.save();

                            return newToken;
                        });
                }
                // 出错了
            });
    },
    getpre_auth_code: function () {
        // 回调方式不需要这个
        var that = this;
        return this.checksuite_access_token()
            .then(token => {
                return that.getURl(that.pre_auth_codeURL + token);
            })
            .then(result => {
                return result.pre_auth_code;
            });
    },
    set_session_info: function () {
        // 或许只有设置了这个，才可以引导授权，TBC
        var that = this; // set_sessionURL

        return this.checksuite_access_token()
            .then(token => {
                return that.getpre_auth_code()
                    .then(code => {
                        return that.postURL(that.set_sessionURL + token, {
                                "pre_auth_code": code,
                                "session_info": {
                                    "auth_type": 1
                                }
                            })
                            .then(() => {
                                return code;
                            });
                    });
            })
            .then(code => {
                return "https://open.work.weixin.qq.com/3rdapp/install?suite_id=" + that.thirdAppId + "&pre_auth_code=" + code + "&redirect_uri=http://people.dushidao.com/people/setsessionback&state=STATE";
            });
    },
    refresh_permanent_code: function (code, suitId) {
        var that = this;
        return this.checksuite_access_token()
            .then(token => {
                return that.postURL(that.get_permanent_codeURL + token, {
                        "auth_code": code
                    })
                    .then(result => {
                        var corpid = result.auth_corp_info.corpid;
                        that.saveaccess_token(result.access_token, suitId, corpid);
                        that.savepermanent_code(result.permanent_code, suitId, corpid);
                    });
            });
    },
    refresh_corp_token: function (toAppId) {
        var that = this;
        return this.getpermanent_code(toAppId)
            .then(code => {
                return this.checksuite_access_token()
                    .then(token => {
                        return that.postURL(that.get_corp_tokenURL + token, {
                                "auth_corpid": toAppId,
                                "permanent_code": code
                            })
                            .then(result => {
                                return result.access_token;
                            });
                    });
            });
    },
    get_auth_info: function (toAppId) {
        // 获取企业信息，应该没啥用途
        var that = this;
        return this.getpermanent_code(toAppId)
            .then(code => {
                return that.postURL(that.get_auth_infoURL + token, {
                    "auth_corpid": toAppId,
                    "permanent_code": code
                });
            });
    },
    checkcorp_token: function (toAppId) {
        var that = this;
        return that.getcorp_token(toAppId)
            .then(token => {
                if (token) {
                    // 2 小时有效，可以简单处理为1.5小时过期
                    if (moment().isBefore(moment(token.updatedDate).add(1.8, "hours"))) {
                        return token.value;
                    }

                    // 过期
                    return that.refresh_corp_token()
                        .then(newToken => {
                            token.value = newToken;
                            token.updatedDate = new Date();
                            token.save();

                            return newToken;
                        });
                }
                // 出错了
            });
    },
    getuser: function (toAppId, userid) {
        var that = this;
        return this.checkcorp_token(toAppId)
            .then(token => {
                return this.getpermanent_code(toAppId)
                    .then(code => {
                        return that.getURL(that.getuserURL + token + "&userid=" + userid, {
                            "auth_corpid": toAppId,
                            "permanent_code": code
                        });
                    });
            });
    }

}
module.exports = weapi;