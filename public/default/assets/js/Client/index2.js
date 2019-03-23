$(document).ready(function () {
    var pageManager = {
        init: function () {
            this.initData();
            this.initEvents();
        },
        initEvents: function () {
            $(".personalCenter .weui-cells").on("click", ".weui-cell", function (e) {
                var id = $(e.currentTarget).attr("id");
                location.href = "/Client/goodList/shop/" + id;
            });
            $("#btnSend").click(function (e) {
                selfAjax("get", "/Client/sendTemplate", null, function (result) {
                    if (result.error) {
                        showAlert(result.error);
                        return;
                    }
                    showAlert("解锁成功！");
                });
            });
        },
        initData: function () {
            if ($("#authUrl").val()) {
                // 需要用户授权，获取用户信息
                location.href = $("#authUrl").val();
                return;
            }
        }
    };

    pageManager.init();
});