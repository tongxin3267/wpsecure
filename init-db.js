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
            return model.systemConfigure.create({
                name: 'access_token'
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