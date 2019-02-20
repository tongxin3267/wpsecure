const model = require('./model.js'),
    crypto = require('crypto');

function step1() {
    console.log("begin step 1 ... ");
    return model.sync()
        .then(function () {
            var pArray = [];
            return Promise.all(pArray)
                .then(function () {
                    console.log('finished step 1 ....');
                });
        });
};

function step2() {
    var md5 = crypto.createHash('md5'),
        password = md5.update("admin12345").digest('hex');

    return model.user.create({
            name: "admin",
            password: password,
            role: 100
        })
        .then(o => {
            return model.systemConfigure.bulkCreate([{
                    name: 'access_token'
                }, {
                    name: "access_token_wechat"
                }, {
                    name: "component_verify_ticket" // need save every 2 hours
                }, {
                    name: "component_access_token" // need save every 2 hours
                }, {
                    name: "pre_auth_code" // may useless, no need to save
                }])
                .then(() => {
                    return model.siteInfo.create({
                        name: "测试",
                        description: "这是测试信息"
                    });
                });
        });
};

step1().then(function () {
    try {
        return step2();
    } catch (err) {
        console.log(err);
    }
});