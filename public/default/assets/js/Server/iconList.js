$(document).ready(function () {
    var pageManager = {
        options: {},
        init: function () {
            this.initStyle();
            this.initEvents();
        },
        initStyle: function () {
            $("#left_btnIcon").addClass("active");
        },
        initEvents: function () {
            var that = this;
            $(".mainModal #btnUpload").on("click", function (e) {
                var file = document.getElementById('upfile').files;
                if (file.length > 0) {
                    var formData = new FormData();
                    formData.append("upfile", file[0]);
                    $.ajax({
                        type: "POST",
                        data: formData,
                        url: "/admin/iconUp",
                        contentType: false,
                        processData: false,
                        success: function (data) {
                            showAlert("上传成功！");
                        }
                    });
                }
            });
        }
    };

    pageManager.init();
});