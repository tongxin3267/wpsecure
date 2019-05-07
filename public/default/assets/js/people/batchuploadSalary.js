var isNew = true;

$(document).ready(function () {
    $("#left_btnSalary").addClass("active");

    $("#editfile #btnResult").on("click", function (e) {
        location.href = "/people/score?atm=left_btnSalary";
    });

    $("#editfile #btnClear").on("click", function (e) {
        selfAjax("get", "/people/score/clearAll", null, function (data) {
            if (data && data.sucess) {
                showAlert("删除记录成功");
            }
        });
    });

    $("#editfile #btnSubmit").on("click", function (e) {
        var file = document.getElementById('upfile').files;
        if (file.length > 0) {
            var formData = new FormData();
            formData.append("avatar", file[0]);
            formData.append("year", $("#editfile #year").val());
            formData.append("month", $("#editfile #month").val());
            loading();
            $.ajax({
                type: "POST",
                data: formData,
                url: "/people/salary",
                contentType: false,
                processData: false,
            }).then(function (data) {
                hideLoading();
                location.href = "/people/score?atm=left_btnSalary";
            });
        }
    });

    function initData() {
        var curDate = new Date(),
            curYear = curDate.getFullYear(),
            curMonth = curDate.getMonth();
        for (var i = -2; i < 2; i++) {
            var tmpYear = curYear + i,
                strSelect = "";
            if (i == 0) {
                strSelect = "selected";
            }
            $("#year").append('<option value="' + tmpYear + '" ' + strSelect + '>' + tmpYear + '</option>');
        }
        for (var i = 0; i < 12; i++) {
            var strSelect = "",
                j = i + 1;
            if (i == curMonth) {
                strSelect = "selected";
            }
            $("#month").append('<option value="' + j + '" ' + strSelect + '>' + j + '</option>');
        }
    };

    initData();
});