var isNew = true;

$(document).ready(function () {
    $("#left_btnContract").addClass("active");
});

//------------search funfunction
$("#editfile #btnSubmit").on("click", function (e) {
    var file = document.getElementById('upfile').files;
    if (file.length > 0) {
        $('#editfile #btnSubmit').attr("disabled", "disabled");
        var formData = new FormData();
        formData.append("avatar", file[0]);
        $.ajax({
            type: "POST",
            data: formData,
            url: "/people/batchAddContract",
            contentType: false,
            processData: false,
        }).then(function (data) {
            $('#editfile #btnSubmit').removeAttr("disabled");
            if (data && data.sucess) {
                location.href = "/people/score";
            } else {
                showAlert("批量导入失败！");
            }
        });
    }
});

$("#editfile #btnResult").on("click", function (e) {
    location.href = "/people/score";
});

$("#editfile #btnClear").on("click", function (e) {
    selfAjax("get", "/people/score/clearAll", null, function (data) {
        if (data && data.sucess) {
            showAlert("删除记录成功");
        }
    });
});