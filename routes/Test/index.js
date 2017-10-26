var https = require('https'),
    zlib = require('zlib'),
    crypto = require('crypto');

function toxml(nodes) {
    var xmlContent = "<xml>";
    nodes.forEach(function (node) {
        xmlContent = xmlContent + "<" + node.key + "><![CDATA[" + node.value + "]]></" + node.key + ">"
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
module.exports = function (app) {
    app.get('/test', function (req, res) {
        res.render('Test/irecorder.html', {
            title: '测试支付'
        });
    });

    app.post('/test', function (req, res) {
        var paras = [],
            strPay = "service=pay.weixin.native&mch_id=101560037142&out_trade_no=" + req.body.orderId +
            "&body=" + req.body.body1 + "&total_fee=" + req.body.orderAmount + "&mch_create_ip=127.0.0.1&notify_url=http://zhangwei.dev.swiftpass.cn/demo/TenpayResult.asp" +
            "&nonce_str=testnonce&key=e6371d360d79eb9fa4c25c7f91d2bc6b";
        strPay = "body=1&mch_create_ip=127.0.0.1&mch_id=101560037142&nonce_str=51cps&notify_url=http://zhangwei.dev.swiftpass.cn/demo/TenpayResult.asp&out_trade_no=201744227240&service=pay.weixin.native&total_fee=1&key=e6371d360d79eb9fa4c25c7f91d2bc6b";

        paras.push({
            key: 'body',
            value: '1'
        });
        paras.push({
            key: 'mch_create_ip',
            value: '127.0.0.1'
        });
        paras.push({
            key: 'mch_id',
            value: '101560037142'
        });
        paras.push({
            key: 'nonce_str',
            value: '51cps'
        });
        paras.push({
            key: 'notify_url',
            value: 'http://zhangwei.dev.swiftpass.cn/demo/TenpayResult.asp'
        });
        paras.push({
            key: 'out_trade_no',
            value: '201744227240'
        });
        paras.push({
            key: 'service',
            value: 'pay.weixin.native'
        });
        paras.push({
            key: 'total_fee',
            value: '1'
        });
        // paras.push({ key: 'key', value: '9d101c97133837e13dde2d32a5054abb' });

        var md5 = crypto.createHash('md5'),
            sign = md5.update(strPay).digest('hex').toUpperCase();

        paras.push({
            key: 'sign',
            value: sign
        });
        var data = toxml(paras);
        var options = {
            hostname: 'pay.swiftpass.cn',
            port: 443,
            path: '/pay/gateway',
            method: 'POST'
        };

        var reqPay = https.request(options, function (resPay) {
            console.log('statusCode:', resPay.statusCode);
            console.log('headers:', resPay.headers);

            resPay.on('data', function (d) {
                var body = d.toString(),
                    imgCode = mysubstr(body, "<code_img_url><![CDATA[", "]]></code_img_url>");

                res.render('Test/pay.html', {
                    title: '测试支付',
                    imgCode: imgCode
                });
            });
        });

        reqPay.on('error', function (e) {
            console.error(e);
        });
        reqPay.write(data);
        reqPay.end();
    });
};


// body=1&mch_create_ip=127.0.0.1&mch_id=7551000001&
// nonce_str=51cps¬ify_url=http://zhangwei.dev.swiftpass.cn/demo/TenpayResult.asp&
// out_trade_no=201744227237&service=pay.weixin.native&total_fee=1&
// key=9d101c97133837e13dde2d32a5054abb


// A2B35E20681EB6576DD71DE7020921AB



//<xml><service><![CDATA[pay.weixin.native]]></service>
//<mch_id><![CDATA[7551000001]]></mch_id>
//<out_trade_no><![CDATA[201744227237]]></out_trade_no>
//<body><![CDATA[1]]></body>
//<total_fee><![CDATA[1]]></total_fee>
//<mch_create_ip><![CDATA[127.0.0.1]]></mch_create_ip>
//<notify_url><![CDATA[http://zhangwei.dev.swiftpass.cn/demo/TenpayResult.asp]]></notify_url>
//<nonce_str><![CDATA[51cps]]></nonce_str>
//<sign><![CDATA[A2B35E20681EB6576DD71DE7020921AB]]></sign></xml>


// var util = require('util'),   https = require('https');  
// var regUrl = "https://ssl.mail.163.com/regall/unireg/call.do;jsessionid=%s?cmd=register.start&adapter=%s&reforward=common/reform&targetCmd=register.ctrlTop";
// var cookie = 'a=b;c=d;',
//     mail = 'regUsername', pass = 'password', vcode = 'abcde';
// var _regUrl = util.format(regUrl, 'id123455', 'param2'); 
// var post_option = url.parse(_regUrl);  post_option.method = 'POST';  post_option.port = 443; 
// var post_data = querystring.stringify({    'name': mail,     'uid': mail + '@163.com',     'confirmPassword': pass,     'password': pass,     'vcode': vcode,     'flow': 'main',     'from': '163mail_right',     'mobile': '',     });  post_option.headers = {    'Content-Type': 'application/x-www-form-urlencoded',     'Content-Length': post_data.length,    Cookie: cookie                        }; 
// var post_req = https.request(post_option, function(res) {      res.on('data', function(buffer) {      console.log(buffer.toString());      }); 
//             post_req.write(post_data); 
//             post_req.end();