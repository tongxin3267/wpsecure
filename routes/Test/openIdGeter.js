var request = require('request');

module.exports = function(app) {
    var AppID = 'wx3fc2b5ecc62fb706';
    var AppSecret = '9aa16bfd1a73d231130e51758036c23c';

    app.get('/openIdGeter', function(req, res) {
        // 第一步：用户同意授权，获取code
        var router = 'get_wx_access_token';
        // 这是编码后的地址
        var return_uri = 'http%3A%2F%2Fwww.bfbeducation.com%2Fget_wx_access_token'; // + router;
        var scope = 'snsapi_base';

        res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + AppID + '&redirect_uri=' + return_uri + '&response_type=code&scope=' + scope + '&state=123#wechat_redirect');
    });

    app.get('/get_wx_access_token', function(req, res) {
        var code = req.query.code;
        request.get({
                url: 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + AppID + '&secret=' + AppSecret + '&code=' + code + '&grant_type=authorization_code',
            },
            function(error, response, body) {
                if (response.statusCode == 200) {
                    // 第三步：拉取用户信息(需scope为 snsapi_userinfo)
                    //console.log(JSON.parse(body));
                    var data = JSON.parse(body);
                    var access_token = data.access_token;
                    var openid = data.openid;

                    res.render('Test/openIdGeter.html', {
                        title: 'openId测试 成功' + openid
                    });
                } else {
                    console.log(response.statusCode);
                    res.render('Test/openIdGeter.html', {
                        title: 'openId测试 失败'
                    });
                }
            }
        );
    });
};