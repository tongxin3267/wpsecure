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
                    name: 'suite_ticket',
                    suitId: 'ww683e156d777a4cf6'
                }, {
                    name: "suite_access_token",
                    suitId: 'ww683e156d777a4cf6'
                }, {
                    name: "permanent_code",
                    suitId: 'ww683e156d777a4cf6',
                    appId: 'wwb50dd79078e140ef'
                }, {
                    name: "access_token",
                    suitId: 'ww683e156d777a4cf6',
                    appId: 'wwb50dd79078e140ef'
                }])
                .then(() => {
                    return model.company.create({
                        name: "一格",
                        password: "e10adc3949ba59abbe56e057f20f883e",
                        we_appId: "wwb50dd79078e140ef"
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