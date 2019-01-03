// 管理员的账号，分等级权限将会不同

const db = require('../../db'),
    config = require('../../settings');

const User = db.defineModel('users', {
    name: {
        type: db.STRING(20),
        defaultValue: ''
    },
    password: {
        type: db.STRING(50),
        defaultValue: ''
    },
    wxId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    shopName: {
        // 分店名称
        type: db.STRING(50),
        defaultValue: ''
    },
    shopId: {
        // 分店Id
        type: db.INTEGER,
        defaultValue: 0
    },
    role: {
        type: db.INTEGER,
        defaultValue: 0
    } //100 superAdmin, 5 normalAdmin, 0 机器操作员
});
module.exports = User;

//读取用户信息
User.getFilter = function (filter) {
    filter.isDeleted = false;
    return User.findOne({
        'where': filter
    });
};

User.getFilters = function (filter) {
    filter.isDeleted = false;
    return User.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

User.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return User.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};