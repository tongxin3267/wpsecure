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
            $("#button1").on("click", function (e) {
                selfAjax("post", "/generator1", {
                    objId: $("#objId").val()
                }, function (data) {
                    if (data.error) {
                        alert(data.error);
                        return;
                    }
                    alert("sucess!");
                });
            });

            $("#button2").on("click", function (e) {
                selfAjax("post", "/generator2", {
                    objId: $("#objId").val()
                }, function (data) {
                    if (data.error) {
                        alert(data.error);
                        return;
                    }
                    alert("sucess!");
                });
            });

            $("#button3").on("click", function (e) {
                selfAjax("post", "/copyfiles", {
                    objId: $("#objId").val(),
                    topath: $("#topath").val()
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