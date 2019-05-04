var model = require("../model.js"),
    SystemConfigure = model.systemConfigure;
module.exports = {
    checktokens: function (appId) {
        return SystemConfigure.getFilter({
                appId: appId
            })
            .then(configure => {
                if (!configure) {
                    return SystemConfigure.bulkCreate([{
                        appId: appId,
                        name: 'access_token',
                        updatedDate: '2019-4-1'
                    }, {
                        appId: appId,
                        name: 'jsapi_ticket',
                        updatedDate: '2019-4-1'
                    }, {
                        appId: appId,
                        name: "authorizer_access_token",
                        value: "",
                        updatedDate: '2019-4-1'
                    }, {
                        appId: appId,
                        name: "authorizer_refresh_token",
                        value: "",
                        updatedDate: '2019-4-1'
                    }]);
                }
            });
    }
};