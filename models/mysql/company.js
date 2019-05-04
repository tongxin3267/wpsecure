//公司，站点是基于公司的，公司要公众号关注，钱付给供应商
const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const Company = db.defineModel('companys', {
    name: {
        // 公司名称
        type: db.STRING(50)
    },
    password: {
        type: db.STRING(50),
        defaultValue: ''
    },
    description: {
        type: db.STRING(100),
        defaultValue: ""
    }, // 其他信息
    sequence: {
        type: db.INTEGER,
        defaultValue: 0
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
    },
    // peoplePassword: {
    //     type: db.STRING(50),
    //     defaultValue: ''
    // }
});
module.exports = Company;

//读取用户信息
Company.getFilter = function (filter) {
    filter.isDeleted = false;
    return Company.findOne({
        'where': filter
    });
};

Company.getFilters = function (filter) {
    filter.isDeleted = false;
    return Company.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

Company.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return Company.findAndCountAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};