// 管理员的账号，分等级权限将会不同

const db = require('../../db'),
    config = require('../../settings');

const User = db.defineModel('users', {
    name: {
        type: db.STRING(20)
    },
    password: db.STRING(50),
    email: {
        type: db.STRING(50),
        allowNull: true
    },
    mobile: {
        type: db.STRING(20),
        allowNull: true
    },
    role: {
        type: db.INTEGER,
        defaultValue: 0
    } //0 superAdmin, 3 schoolAdmin, 10 rollCallUser, 7 team leader
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