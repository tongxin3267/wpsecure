const model = require('./model.js');

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

};

step1().then(function () {
    try {
        return step2();
    } catch (err) {
        console.log(err);
    }
});