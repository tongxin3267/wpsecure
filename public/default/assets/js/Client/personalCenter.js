$(document).ready(function () {
    var pageManager = {
        options: {},
        init: function () {
            this.initEvents();
            this.initData();
        },
        initEvents: function () {
            var that = this;
            $(".weui-cell_access.meupload").click(function (e) {
                location.href = "/Client/myreport";
            });
            $(".weui-cell_access.tome").click(function (e) {
                location.href = "/Client/reporttome";
            });
        },
        initData: function () {

        }
    };

    pageManager.init();
});