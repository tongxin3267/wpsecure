var moment = require("moment"),
    model = require("../model.js"),
    SystemConfigure = model.systemConfigure,
    SysSuit = model.sysSuit,
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
    // thirdAppId: "ww683e156d777a4cf6",
    // thirdSecret: "_yBtCzdlDSkFQrLNiX2KaM4aupMFGSMEcz5G4425n0g",
    thirdToken: "2OxqDavW",
    thirdAESKey: "sWrM5nSmxVWa4lPBB4vN2C6hqJhG7JQUD8cKyls2mag",
    CorpID: "wwb50dd79078e140ef",
    ProviderSecret: "HENHC8vaLTs7zlTyDnLyADPkCOfEvWYXYmsPtFUgWLIaSoZt2fFdlD3DozOqeft8",
    get_provider_tokenURL: "https://qyapi.weixin.qq.com/cgi-bin/service/get_provider_token",
    suite_access_tokenURL: "https://qyapi.weixin.qq.com/cgi-bin/service/get_suite_token",
    pre_auth_codeURL: "https://qyapi.weixin.qq.com/cgi-bin/service/get_pre_auth_code?suite_access_token=",
    set_sessionURL: "https://qyapi.weixin.qq.com/cgi-bin/service/set_session_info?suite_access_token=",
    get_permanent_codeURL: "https://qyapi.weixin.qq.com/cgi-bin/service/get_permanent_code?suite_access_token=",
    get_corp_tokenURL: "https://qyapi.weixin.qq.com/cgi-bin/service/get_corp_token?suite_access_token=",
    get_auth_infoURL: "https://qyapi.weixin.qq.com/cgi-bin/service/get_auth_info?suite_access_token=",
    getuserURL: "https://qyapi.weixin.qq.com/cgi-bin/user/get?access_token=",
    get_login_infoURL: "https://qyapi.weixin.qq.com/cgi-bin/service/get_login_info?access_token=",
    getwecrypto: function (suiteId) {
        if (!this._crypto) {
            this._crypto = new wecrypto(this.thirdToken, this.thirdAESKey, suiteId);
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
    baseDecryptMsg: function (msgSignature, timestamp, nonce, suiteId, data) {
        var that = this;
        var msg_encrypt = data;
        var _crypto = that.getwecrypto(suiteId);
        if (_crypto.getSignature(timestamp, nonce, msg_encrypt) != msgSignature) {
            return Promise.reject('msgSignature is not invalid');
        };
        var decryptedMessage = _crypto.decrypt(msg_encrypt);
        return decryptedMessage.message;
    },
    decryptMsg: function (msgSignature, timestamp, nonce, suiteId, data) {
        var that = this;
        return this.selfParse(data)
            .then(xml => {
                var msg_encrypt = xml.xml.Encrypt[0];
                var _crypto = that.getwecrypto(suiteId);
                if (_crypto.getSignature(timestamp, nonce, msg_encrypt) != msgSignature) {
                    return Promise.reject('msgSignature is not invalid');
                };
                var decryptedMessage = _crypto.decrypt(msg_encrypt);
                return that.selfParse(decryptedMessage.message);
            });
    },
    getcorp_token: function (toAppId, suiteId) {
        return SystemConfigure.getFilter({
            name: "access_token",
            appId: toAppId,
            suiteId: suiteId
        });
    },
    saveaccess_token: function (token, suiteId, toAppId) {
        return SystemConfigure.update({
            value: token,
            updatedDate: new Date()
        }, {
            where: {
                name: "access_token",
                appId: toAppId,
                suiteId: suiteId
            }
        });
    },
    getpermanent_code: function (toAppId, suiteId) {
        return SystemConfigure.getFilter({
            name: "permanent_code",
            appId: toAppId,
            suiteId: suiteId
        });
    },
    savepermanent_code: function (code, suiteId, toAppId, agentId) {
        return SystemConfigure.update({
            value: code,
            agentId: agentId,
            updatedDate: new Date()
        }, {
            where: {
                name: "permanent_code",
                appId: toAppId,
                suiteId: suiteId
            }
        });
    },
    getsuite_ticket: function (suiteId) {
        return SystemConfigure.getFilter({
            name: 'suite_ticket',
            suiteId: suiteId
        });
    },
    getsuite_access_token: function (suiteId) {
        return SystemConfigure.getFilter({
            name: "suite_access_token",
            suiteId: suiteId
        });
    },
    refreshsuite_access_token: function (suiteId) {
        var that = this;
        // debugger;
        return that.getsuite_ticket(suiteId)
            .then(ticket => {
                return SysSuit.getFilter({
                        suiteId: suiteId
                    })
                    .then(suit => {
                        return that.postURL(that.suite_access_tokenURL, {
                                "suite_id": suiteId,
                                "suite_secret": suit.secret,
                                "suite_ticket": ticket.value
                            })
                            .then(result => {
                                return result.suite_access_token;
                            });
                    });
            });
    },
    checksuite_access_token: function (suiteId) {
        var that = this;
        return that.getsuite_access_token(suiteId)
            .then(token => {
                if (token) {
                    // 2 小时有效，可以简单处理为1.5小时过期
                    if (moment().isBefore(moment(token.updatedDate).add(1.8, "hours"))) {
                        return token.value;
                    }

                    // 过期
                    return that.refreshsuite_access_token(suiteId)
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
    getpre_auth_code: function (suiteId) {
        // 回调方式不需要这个
        var that = this;
        return this.checksuite_access_token(suiteId)
            .then(token => {
                return that.getURl(that.pre_auth_codeURL + token);
            })
            .then(result => {
                return result.pre_auth_code;
            });
    },
    set_session_info: function (suiteId) {
        // 或许只有设置了这个，才可以引导授权，TBC
        var that = this; // set_sessionURL

        return this.checksuite_access_token(suiteId)
            .then(token => {
                return that.getpre_auth_code(suiteId)
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
                return "https://open.work.weixin.qq.com/3rdapp/install?suite_id=" + suiteId + "&pre_auth_code=" + code + "&redirect_uri=http://people.dushidao.com/people/setsessionback&state=STATE";
            });
    },
    refresh_permanent_code: function (code, suiteId) {
        var that = this;
        return this.checksuite_access_token(suiteId)
            .then(token => {
                return that.postURL(that.get_permanent_codeURL + token, {
                        "auth_code": code
                    })
                    .then(result => {
                        // var corpid = result.auth_corp_info.corpid,
                        //     agentId = result.auth_info.agent[0].agentid;
                        // that.saveaccess_token(result.access_token, suiteId, corpid);
                        // that.savepermanent_code(result.permanent_code, suiteId, corpid, agentId);
                        return result;
                    });
            });
    },
    refresh_corp_token: function (toAppId, suiteId) {
        var that = this;
        return this.getpermanent_code(toAppId, suiteId)
            .then(code => {
                return this.checksuite_access_token(suiteId)
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
    get_auth_info: function (toAppId, suiteId) {
        // 获取企业信息，应该没啥用途
        var that = this;
        return this.getpermanent_code(toAppId, suiteId)
            .then(code => {
                return that.postURL(that.get_auth_infoURL + token, {
                    "auth_corpid": toAppId,
                    "permanent_code": code
                });
            });
    },
    checkcorp_token: function (toAppId, suiteId) {
        var that = this;
        return that.getcorp_token(toAppId, suiteId)
            .then(token => {
                if (token) {
                    // 2 小时有效，可以简单处理为1.5小时过期
                    if (moment().isBefore(moment(token.updatedDate).add(1.8, "hours"))) {
                        return token.value;
                    }

                    // 过期
                    return that.refresh_corp_token(suiteId)
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
    getuser: function (toAppId, userid, suiteId) {
        // no need to get user info
        var that = this;
        return this.checkcorp_token(toAppId, suiteId)
            .then(token => {
                return this.getpermanent_code(toAppId, suiteId)
                    .then(code => {
                        return that.getURL(that.getuserURL + token + "&userid=" + userid, {
                            "auth_corpid": toAppId,
                            "permanent_code": code
                        });
                    });
            });
    },
    get_login_info: function (code) {
        var that = this;
        return this.checkprovider_token()
            .then(token => {
                return that.postURL(that.get_login_infoURL + token, {
                    "auth_code": code
                });
            });
    },
    get_provider_token: function () {
        return SystemConfigure.getFilter({
            name: "provider_access_token"
        });
    },
    refreshprovider_token: function () {
        var that = this;
        // debugger;
        return that.postURL(that.get_provider_tokenURL, {
                "corpid": that.CorpID,
                "provider_secret": that.ProviderSecret
            })
            .then(result => {
                return result.provider_access_token;
            });
    },
    checkprovider_token: function () {
        var that = this;
        return that.get_provider_token()
            .then(token => {
                if (token) {
                    // 2 小时有效，可以简单处理为1.5小时过期
                    if (moment().isBefore(moment(token.updatedDate).add(1.8, "hours"))) {
                        return token.value;
                    }

                    // 过期
                    return that.refreshprovider_token()
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
    get_admin_list: function (toAppId, suiteId, agentId) {
        var that = this;
        return this.checksuite_access_token(suiteId)
            .then(token => {
                return that.postURL("https://qyapi.weixin.qq.com/cgi-bin/service/get_admin_list?suite_access_token=" + token, {
                    "auth_corpid": toAppId,
                    "agentid": agentId
                });
            })
            .catch(err => {

            });
    }
}
module.exports = weapi;