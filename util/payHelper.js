var https = require('https'),
    zlib = require('zlib'),
    crypto = require('crypto'),
    parseString = require('xml2js').parseString,
    settings = require('../settings'),
    request = require('request');

function toxml(sendObject) {
    var keys = Object.getOwnPropertyNames(sendObject).sort();
    var xmlContent = "<xml>";
    keys.forEach(function(key) {
        xmlContent = xmlContent + "<" + key + "><![CDATA[" + sendObject[key] + "]]></" + key + ">"
    });
    xmlContent = xmlContent + "</xml>";
    return xmlContent;
};

function mysubstr(body, sstart, sstop) {
    var i = body.indexOf(sstart),
        subBody = body.substr(i),
        j = subBody.indexOf(sstop),
        resultBody = subBody.substr(23, j - 23);

    return resultBody;
};

function myJSSubstr(body, sstart, sstop) {
    var i = body.indexOf(sstart),
        subBody = body.substr(i),
        j = subBody.indexOf(sstop),
        resultBody = subBody.substr(19, j - 19);

    return resultBody;
};

var Pay = {
    pay: function(payParas, res) {
        var sendObject = {
            'body': payParas.body,
            'mch_create_ip': settings.create_ip,
            'mch_id': settings.mch_id,
            'nonce_str': 'bfbeducation',
            'notify_url': settings.notify_Url,
            'out_trade_no': payParas.out_trade_no,
            'service': 'pay.weixin.native',
            'total_fee': payParas.total_fee
        };
        var keys = Object.getOwnPropertyNames(sendObject).sort(),
            strPay = "";
        keys.forEach(function(key) {
            var v = sendObject[key];
            if ("sign" != key && "key" != key) {
                strPay = strPay + key + "=" + v + "&";
            }
        });
        strPay = strPay + "key=" + settings.key;
        var md5 = crypto.createHash('md5'),
            sign = md5.update(strPay).digest('hex').toUpperCase();
        sendObject.sign = sign;
        var data = toxml(sendObject);
        var options = {
            hostname: 'pay.swiftpass.cn',
            port: 443,
            path: '/pay/gateway',
            method: 'POST'
        };

        var reqPay = https.request(options, function(resPay) {
            resPay.on('data', function(d) {
                var body = d.toString(),
                    imgCode = mysubstr(body, "<code_img_url><![CDATA[", "]]></code_img_url>");

                res.jsonp({
                    imgCode: imgCode
                });
            });
        });

        reqPay.on('error', function(e) {
            console.error(e);
        });
        reqPay.write(data);
        reqPay.end();
    },
    aliPay: function(payParas, res) {
        var sendObject = {
            'body': payParas.body,
            'mch_create_ip': settings.create_ip,
            'mch_id': settings.mch_id,
            'nonce_str': 'bfbeducation',
            'notify_url': settings.notify_Url,
            'out_trade_no': payParas.out_trade_no,
            'service': 'pay.alipay.native',
            'total_fee': payParas.total_fee
        };
        var keys = Object.getOwnPropertyNames(sendObject).sort(),
            strPay = "";
        keys.forEach(function(key) {
            var v = sendObject[key];
            if ("sign" != key && "key" != key) {
                strPay = strPay + key + "=" + v + "&";
            }
        });
        strPay = strPay + "key=" + settings.key;
        var md5 = crypto.createHash('md5'),
            sign = md5.update(strPay).digest('hex').toUpperCase();
        sendObject.sign = sign;
        var data = toxml(sendObject);
        var options = {
            hostname: 'pay.swiftpass.cn',
            port: 443,
            path: '/pay/gateway',
            method: 'POST'
        };

        var reqPay = https.request(options, function(resPay) {
            resPay.on('data', function(d) {
                var body = d.toString(),
                    imgCode = mysubstr(body, "<code_img_url><![CDATA[", "]]></code_img_url>");

                res.jsonp({
                    imgCode: imgCode
                });
            });
        });

        reqPay.on('error', function(e) {
            console.error(e);
        });
        reqPay.write(data);
        reqPay.end();
    },
    jsPay: function(payParas, res) {
        debugger;
        var sendObject = {
            'body': payParas.body,
            'mch_create_ip': settings.create_ip,
            'mch_id': settings.mch_id,
            'nonce_str': 'bfbeducation',
            'notify_url': settings.notify_Url,
            'out_trade_no': payParas.out_trade_no,
            'service': 'pay.weixin.jspay',
            'sub_appid': settings.AppID,
            'sub_openid': payParas.openId,
            'time_expire': payParas.time_expire,
            'total_fee': payParas.total_fee
        };
        var keys = Object.getOwnPropertyNames(sendObject).sort(),
            strPay = "";
        keys.forEach(function(key) {
            var v = sendObject[key];
            if ("sign" != key && "key" != key) {
                strPay = strPay + key + "=" + v + "&";
            }
        });
        strPay = strPay + "key=" + settings.key;
        var md5 = crypto.createHash('md5'),
            sign = md5.update(strPay).digest('hex').toUpperCase();
        sendObject.sign = sign;
        var data = toxml(sendObject);
        debugger;
        request.post({
                url: 'https://pay.swiftpass.cn:443/pay/gateway',
                body: data
            },
            function(error, response, body) {
                debugger;
                if (response.statusCode == 200) {
                    // 第三步：拉取用户信息(需scope为 snsapi_userinfo)
                    console.log(body);
                    var token = myJSSubstr(body, "<token_id><![CDATA[", "]]></token_id>");
                    debugger;
                    if (token != "") {
                        res.render('Client/order_pay.html', {
                            title: '支付',
                            url: "https://pay.swiftpass.cn/pay/jspay?token_id=" + token + "&showwxtitle=1"
                        });
                        //res.redirect();
                    } else {
                        //res.redirect("/personalCenter/order");
                    }
                } else {
                    //res.redirect("/personalCenter/order");
                }
            }
        );
    },
    jsRebate: function(payParas, res) {
        debugger;
        var sendObject = {
            'mch_id': settings.mch_id, //--
            'nonce_str': 'bfbeducation', //--
            'op_user_id': settings.mch_id, //--
            'out_refund_no': payParas.out_refund_no, //--
            'out_trade_no': payParas.out_trade_no, //--
            'refund_fee': payParas.refund_fee, //--
            'service': 'unified.trade.refund', //--
            'total_fee': payParas.total_fee //--
        };
        var keys = Object.getOwnPropertyNames(sendObject).sort(),
            strPay = "";
        keys.forEach(function(key) {
            var v = sendObject[key];
            if ("sign" != key && "key" != key) {
                strPay = strPay + key + "=" + v + "&";
            }
        });
        strPay = strPay + "key=" + settings.key;
        var md5 = crypto.createHash('md5'),
            sign = md5.update(strPay).digest('hex').toUpperCase();
        sendObject.sign = sign;
        var data = toxml(sendObject);
        debugger;
        request.post({
                url: 'https://pay.swiftpass.cn:443/pay/gateway',
                body: data
            },
            function(error, response, body) {
                debugger;
                if (response.statusCode == 200) {
                    // 第三步 //3天后查询
                    console.log(body);
                } else {
                    //res.redirect("/personalCenter/order");
                }
            }
        );
    },
    getOpenId: function(res, id) {
        // 这是编码后的地址
        //"http%3A%2F%2Fwww.bfbeducation.com%2Fget_wx_access_token%2F"
        var return_uri = 'http%3A%2F%2Fwww.bfbeducation.com%2Fget_wx_access_token%2F' + id; // + router;
        var scope = 'snsapi_base';
        debugger;
        res.jsonp({ url: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + settings.AppID + '&redirect_uri=' + return_uri + '&response_type=code&scope=' + scope + '&state=123#wechat_redirect' });
        return;
        // res.redirect();
    },
    wechatPay: function(req, res, callback) {
        debugger;
        var code = req.query.code;
        request.get({
                url: 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + settings.AppID + '&secret=' + settings.AppSecret + '&code=' + code + '&grant_type=authorization_code',
            },
            function(error, response, body) {
                debugger;
                if (response.statusCode == 200) {
                    // 第三步：拉取用户信息(需scope为 snsapi_userinfo)
                    var data = JSON.parse(body);
                    var access_token = data.access_token;
                    callback(res, req.params.id, data.openid);
                } else {
                    res.jsonp({ error: "没有授权openID!" });
                }
            }
        );
    },
    closeOrder: function(id) {
        var sendObject = {
            'mch_id': settings.mch_id,
            'nonce_str': 'bfbeducation',
            'out_trade_no': id,
            'service': 'unified.trade.close'
        };
        var keys = Object.getOwnPropertyNames(sendObject).sort(),
            strPay = "";
        keys.forEach(function(key) {
            var v = sendObject[key];
            if ("sign" != key && "key" != key) {
                strPay = strPay + key + "=" + v + "&";
            }
        });
        strPay = strPay + "key=" + settings.key;
        var md5 = crypto.createHash('md5'),
            sign = md5.update(strPay).digest('hex').toUpperCase();
        sendObject.sign = sign;
        var data = toxml(sendObject);

        request.post({
                url: 'https://pay.swiftpass.cn:443/pay/gateway',
                body: data
            },
            function(error, response, body) {
                if (response.statusCode == 200) {} else {}
            }
        );
    }
};

module.exports = Pay;