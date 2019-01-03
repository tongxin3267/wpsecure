$(document).ready(function () {
    var pageManager = {
        init: function () {
            this.initSubjects();
            this.initEvents();
        },
        initEvents: function () {
            $("#btnExit").on("click", function (e) {
                // 退出
                location.href = "/student/login";
            });
        },
        initSubjects: function () {

        }
    };

    pageManager.init();
});