const fs = require('fs');

let files = fs.readdirSync(__dirname);

let js_files = files.filter((f) => {
    return f.endsWith('.js');
}, files);

module.exports = function (app) {
    for (let f of js_files) {
        // console.log(`import model from file ${f}...`);
        let name = f.substring(0, f.length - 3);
        if (name != "index" && name != "auth") {
            let model = require('./' + f);
            model(app);
        }
    }
};