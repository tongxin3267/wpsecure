// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const Supplier = db.defineModel('suppliers', {
    companyId: {
        type: db.INTEGER
    },
    name: {
        type: db.STRING(50)
    },
    description: {
        type: db.STRING(100),
        defaultValue: ""
    }, // 描述信息
    sequence: {
        type: db.INTEGER,
        defaultValue: 0
    },
    ali_appId: {
        type: db.STRING(32),
        defaultValue: ''
    },
    ali_privateKey: {
        type: db.STRING(1600),
        defaultValue: ''
    },
    ali_alipayPublicKey: {
        type: db.STRING(400),
        defaultValue: ''
    },
    ali_gateway: {
        type: db.STRING(100),
        defaultValue: ''
    },
    ali_app_auth_token: {
        type: db.STRING(50),
        defaultValue: ''
    },
    we_appId: {
        type: db.STRING(32),
        defaultValue: ''
    },
    we_appSecret: {
        type: db.STRING(50),
        defaultValue: ''
    },
    we_mch_id: {
        type: db.STRING(50),
        defaultValue: ''
    },
    we_Mch_key: {
        type: db.STRING(50),
        defaultValue: ''
    }
});
module.exports = Supplier;

//读取用户信息
Supplier.getFilter = function (filter) {
    filter.isDeleted = false;
    return Supplier.findOne({
        'where': filter
    });
};

Supplier.getFilters = function (filter) {
    filter.isDeleted = false;
    return Supplier.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['_id']
        ]
    });
};

Supplier.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return Supplier.findAndCountAll({
        'where': filter,
        order: [
            ['sequence'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};