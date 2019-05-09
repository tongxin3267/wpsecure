// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const EmployeeContract = db.defineModel('employeeContracts', {
    employeeId: {
        type: db.INTEGER,
        comment: "员工Id"
    },
    companyId: {
        type: db.INTEGER,
        comment: "公司Id"
    },
    sequence: {
        type: db.INTEGER,
        defaultValue: 0,
        comment: "序号"
    },
    startDate: {
        type: db.DATE,
        defaultValue: db.NOW,
        comment: "开始日期"
    },
    endDate: {
        type: db.DATE,
        defaultValue: db.NOW,
        comment: "结束日期"
    }
});
module.exports = EmployeeContract;

//读取用户信息
EmployeeContract.getFilter = function (filter) {
    if (!filter.companyId) {
        filter.companyId = -1;
    }
    filter.isDeleted = false;
    return EmployeeContract.findOne({
        'where': filter
    });
};

EmployeeContract.getFilters = function (filter) {
    if (!filter.companyId) {
        filter.companyId = -1;
    }
    filter.isDeleted = false;
    return EmployeeContract.findAll({
        'where': filter,
        order: [
            ['_id']
        ]
    });
};

EmployeeContract.getFiltersWithPage = function (page, filter) {
    if (!filter.companyId) {
        filter.companyId = -1;
    }
    filter.isDeleted = false;
    return EmployeeContract.findAndCountAll({
        'where': filter,
        order: [
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};