// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const Salary = db.defineModel('salarys', {
    companyId: {
        type: db.INTEGER,
        comment: "公司Id"
    },
    employeeName: {
        // teacher  name
        type: db.STRING(50),
        comment: "员工名字"
    },
    employeeId: {
        type: db.INTEGER,
        comment: "员工Id"
    },
    mobile: {
        // 电话
        type: db.STRING(20),
        comment: "手机",
        defaultValue: ""
    },
    year: {
        type: db.INTEGER,
        comment: "年份"
    },
    month: {
        type: db.INTEGER,
        comment: "月份"
    },
    _id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true, //自动递增, 
        comment: "主键，自增"
    },
    other: {
        // 用于显示的字段，没有别的用途
        type: db.JSON,
        comment: "其他字段"
    }
});
module.exports = Salary;

//读取用户信息
Salary.getFilter = function (filter) {
    filter.isDeleted = false;
    return Salary.findOne({
        'where': filter
    });
};

Salary.getFilters = function (filter) {
    filter.isDeleted = false;
    return Salary.findAll({
        'where': filter,
        order: [
            ['_id']
        ]
    });
};

Salary.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return Salary.findAndCountAll({
        'where': filter,
        order: [
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};