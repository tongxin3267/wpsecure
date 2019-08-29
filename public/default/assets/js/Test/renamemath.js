$(document).ready(function () {
    var pageManager = {
        options: {},
        init: function () {
            this.initStyle();
            this.initEvents();
            this.initData();
        },
        initStyle: function () {

        },
        initEvents: function () {
            var that = this;
            $("#button3").on("click", function (e) {
                selfAjax("post", "/renameMath", {
                    source: $("#source").val(),
                    target: $("#target").val()
                }, function (data) {
                    if (data.error) {
                        alert(data.error);
                        return;
                    }
                    alert("sucess!");
                });
            });
        },
        initData: function () {

        }
    };

    pageManager.init();
});