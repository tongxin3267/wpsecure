// 老师，基本比较稳定，每学期都有新进来的老师也离职的老师
// grade 主要对组长来讲可以导出对应组的成绩，对于老师来讲可以进入对应年级的试题库

const db = require('../../db'),
    config = require('../../settings');

const Employee = db.defineModel('employees', {
    companyId: {
        type: db.INTEGER,
        comment: "公司Id"
    },
    name: {
        // 中文
        type: db.STRING(20)
    },
    mobile: {
        // 电话
        type: db.STRING(20),
        allowNull: true
    },
    weUserId: {
        // 微信企业号Id
        type: db.STRING(20),
        defaultValue: ''
    },
    other: {
        // 用于显示的字段，没有别的用途
        type: db.JSON,
        comment: "其他字段"
    }
});
module.exports = Employee;

//读取用户信息
Employee.getFilter = function (filter) {
    filter.isDeleted = false;
    return Employee.findOne({
        'where': filter
    });
};

Employee.getFilters = function (filter) {
    filter.isDeleted = false;
    return Employee.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

Employee.getFiltersWithPage = function (page, filter) {
    if (!filter.isDeleted) {
        filter.isDeleted = false;
    }
    return Employee.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};