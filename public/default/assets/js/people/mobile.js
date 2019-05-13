$(document).ready(function () {
    var pageManager = {
        pageOptions: {},
        pageInit: function () {
            this.pageInitStyle();
            this.pageInitEvents();
            this.pageInitData();
        },
        pageInitStyle: function () {},
        pageInitEvents: function () {
            var that = this;
            $("#btnLogin").on("click", function (e) {
                var validator = $('#myModal').data('formValidation').validate();
                if (validator.isValid()) {
                    var postURI = "/people/employee/addManager",
                        postObj = {
                            name: $('#myModal #name').val(),
                            mobile: $('#myModal #mobile').val(),
                            weUserId: $.trim($("#myModal #weUserId").val())
                        };
                    selfAjax("post", postURI, postObj, function (data) {
                        if (data.error) {
                            showAlert(data.error);
                            return;
                        }
                        location.href = "/" + $("#model").val();
                    });
                }
            });
        },
        pageInitData: function () {
            this.pageAddValidation();
        },
        pageAddValidation: function (callback) {
            setTimeout(function () {
                $('#myModal').formValidation({
                    fields: {
                        'mobile': {
                            trigger: "blur change",
                            validators: {
                                notEmpty: {
                                    message: '手机号码不能为空'
                                },
                                stringLength: {
                                    min: 11,
                                    max: 11,
                                    message: '手机号码需要11个字符'
                                }
                            }
                        }
                    }
                });
            }, 0);
        }
    };

    pageManager.pageInit();
});