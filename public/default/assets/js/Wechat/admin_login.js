$(document).ready(function () {
    $('#loginForm #btnLogin').click(function (e) {
        if ($(this).hasClass("weui-btn_disabled")) {
            return;
        }

        selfAjax("post", "/wechatAdmin/login", {
            name: $.trim($('#loginForm #name').val()),
            password: $.trim($('#loginForm #password').val())
        }, function (data) {
            if (data.error) {
                showAlert(data.error);
                return;
            }
            location.href = "/wechatAdmin";
        });
    });

    $("#loginForm #name").on("input", function (evt) {
        if ($.trim($(this).val()).length > 0) {
            if ($.trim($("#loginForm #password").val()).length > 0) {
                $("#btnLogin").removeClass("weui-btn_disabled");
            }
        } else {
            $("#btnLogin").addClass("weui-btn_disabled");
        }
    });

    $("#loginForm #password").on("input", function (evt) {
        if ($.trim($(this).val()).length > 0) {
            if ($.trim($("#loginForm #name").val()).length > 0) {
                $("#btnLogin").removeClass("weui-btn_disabled");
            }
        } else {
            $("#btnLogin").addClass("weui-btn_disabled");
        }
    });
});