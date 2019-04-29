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
    nickname: {
        // 别名
        type: db.STRING(20),
        defaultValue: ""
    },
    mobile: {
        // 电话
        type: db.STRING(20),
        allowNull: true
    },
    engName: {
        // 英文
        type: db.STRING(20),
        defaultValue: ''
    },
    password: db.STRING(50),
    address: {
        type: db.STRING(100),
        defaultValue: ""
    },
    role: {
        type: db.INTEGER,
        defaultValue: 20
    }, // 20 employee, 11 team leader, 25 其他
    schoolId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    subjectId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    gradeType: {
        type: db.STRING(50),
        defaultValue: '5'
    }, // 小学和初中太不同了，独立出2个分支: 5-小学 10-初中 15-高中 20-出国 25-wonders
    nativePlace: {
        //籍贯
        type: db.STRING(50),
        defaultValue: ''
    },
    idType: {
        //户口性质
        type: db.STRING(10),
        defaultValue: ''
    },
    marryType: {
        //婚育状况
        type: db.STRING(20),
        defaultValue: ''
    },
    partyType: {
        //政治面貌
        type: db.STRING(20),
        defaultValue: ''
    },
    sex: {
        type: db.BOOLEAN,
        defaultValue: false
    },
    isRegSecur: {
        // 是否签订保密协议
        type: db.BOOLEAN,
        defaultValue: false
    },
    // departmentId: {
    //     // 部门信息或许有问题
    //     type: db.INTEGER,
    //     defaultValue: 0
    // },
    departmentName: {
        // 部门名称
        type: db.STRING(50),
        defaultValue: ''
    },
    positionType: {
        // 职位类别
        type: db.BOOLEAN,
        defaultValue: false
    },
    highEduBg: {
        // 最高学历
        type: db.STRING(50),
        defaultValue: ''
    },
    graduateSchool: {
        // 毕业学校
        type: db.STRING(50),
        defaultValue: ''
    },
    graduateSubject: {
        // 学习专业
        type: db.STRING(50),
        defaultValue: ''
    },
    idNumber: {
        // 身份证号
        type: db.STRING(20),
        defaultValue: ''
    },
    firstWorkDate: {
        // 参加工作时间
        type: db.STRING(20),
        defaultValue: ''
    },
    onBoardDate: {
        // 入职时间
        type: db.DATE,
        defaultValue: db.NOW
    },
    yearHolidays: {
        // 年假
        type: db.DECIMAL(10, 2),
        defaultValue: 0
    },
    usedHolidays: {
        // 已用年假
        type: db.DECIMAL(10, 2),
        defaultValue: 0
    },
    overTime: {
        // 加班小时数
        type: db.INTEGER,
        defaultValue: 0
    },
    weUserId: {
        // 微信企业号Id
        type: db.STRING(20),
        defaultValue: ''
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