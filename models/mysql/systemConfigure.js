// 模板，可以用于自动生成entity
// access_token 单个商户对应的token
// access_token_wechat
// component_verify_ticket 第三方应用的总ticket
// authorizer_refresh_token authorizer_access_token

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const SystemConfigure = db.defineModel('systemConfigures', {
    name: {
        // access_token
        type: db.STRING(50)
    },
    companyId: {
        type: db.INTEGER,
        comment: "公司Id"
    },
    appId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    value: {
        type: db.STRING(250),
        defaultValue: ''
    }
});
module.exports = SystemConfigure;

//读取用户信息
SystemConfigure.getFilter = function (filter) {
    filter.isDeleted = false;
    return SystemConfigure.findOne({
        'where': filter
    });
};

SystemConfigure.getFilters = function (filter) {
    filter.isDeleted = false;
    return SystemConfigure.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

SystemConfigure.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return SystemConfigure.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};