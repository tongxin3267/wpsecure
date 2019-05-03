var moment = require("moment"),
    model = require("../model.js"),
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
    thirdToken: "2OxqDavW",
    thirdAESKey: "sWrM5nSmxVWa4lPBB4vN2C6hqJhG7JQUD8cKyls2mag",
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
}
module.exports = weapi;