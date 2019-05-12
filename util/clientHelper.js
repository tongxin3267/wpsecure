var model = require("../model.js"),
    Company = model.company,
    Employee = model.employee;
module.exports = {
    autoLogin: function (req) {
        return Company.getFilter({
                we_appId: "wwb50dd79078e140ef"
            })
            .then(company => {
                req.session.company = company;
                return Employee.getFilter({
                        companyId: req.session.company._id,
                        weUserId: "ZhaoWeiPu"
                    })
                    .then(user => {
                        // user.dataValues.role = 100;
                        req.session.user = user.dataValues;
                    });
            });
    },
    checkSuiteId(q) {
        switch (q) {
            case "1":
                return "ww683e156d777a4cf6";
            case "2":
            case "2.0":
            case "2.1":
            case "2.2":
            case "2.3":
            case "2.4":
                return "wwbaec80ad8e9cf684";
        }
    },
    checkLoginPage(q) {
        switch (q) {
            case "1":
                return "/client/salaryView";
            case "2":
                return "/client/yhtbView";
            case "2.0":
                return "/client/reportCenterView";
            case "2.1":
                return "/client/myreportView";
            case "2.2":
                return "/client/reporttomeView";
            case "2.3":
                return "/client/reportcopymeView";
            case "2.4":
                return "/client/allreportsView";
        }
    }
};