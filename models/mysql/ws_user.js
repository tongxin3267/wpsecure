// 账号，现在比较复杂，允许一个账号下有多个学生

const db = require('../../db'),
    config = require('../../settings');

const WS_user = db.defineModel('ws_users', {
    name: {
        type: db.STRING(20)
    },
    password: db.STRING(50)
});
module.exports = WS_user;

WS_user.getFilter = function (filter) {
    filter.isDeleted = false;
    return WS_user.findOne({
        'where': filter
    });
};

WS_user.getFilters = function (filter) {
    filter.isDeleted = false;
    return WS_user.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

WS_user.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return WS_user.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};