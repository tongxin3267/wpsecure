$(document).ready(function () {
    $("#header_btnBasic").on("click", function (e) {
        location.href = "/people";
    });
});

window.showAlert = function (msg, title, isModal) {
    if (!isModal) {
        $('#confirmModal').modal({
            backdrop: 'static',
            keyboard: false
        });
    }

    $('#confirmModal #confirmModalLabel').text(title || "提示");
    $('#confirmModal .modal-body').text(msg);

    $('#confirmModal .modal-footer .btn-default').text("确定");
    $('#confirmModal #btnConfirmSave').hide();
};

window.showConfirm = function (msg, title, isModal) {
    if (!isModal) {
        $('#confirmModal').modal({
            backdrop: 'static',
            keyboard: false
        });
    }
    $('#confirmModal #confirmModalLabel').text(title || "确认");
    $('#confirmModal .modal-body').text(msg);

    $('#confirmModal .modal-footer .btn-default').text("取消");
    $('#confirmModal #btnConfirmSave').show();
};

window.setSelectEvent = function ($selectBody, callback) {
    $selectBody.off("click").on("click", "tr", function (e) {
        var obj = e.currentTarget;
        var entity = $(obj).data("obj");
        callback(entity);
    });
};

window.selfAjax = function (method, url, filter, callback) {
    loading();
    $[method](
        url,
        filter,
        function (data) {
            callback(data);
            hideLoading();
        }
    );
};

window.loading = function () {
    $("#loadingIndicator").modal({
        backdrop: 'static',
        keyboard: false
    });
};

window.hideLoading = function () {
    setTimeout(function () {
        $("#loadingIndicator").modal('hide');
    }, 0);
};

window.getAllCheckedIds = function (objs) {
    var trainIds = [];
    objs.each(function (index) {
        if (this.checked) {
            trainIds.push($(this).val());
        }
    });
    return trainIds;
};

//Html编码获取Html转义实体  
// function htmlEncode(value) {
//     return encodeURI(value);
//     // return $('<div/>').text(value).html();
// };
//Html解码获取Html实体  
// function htmlDecode(value) {
//     return decodeURI(value);
//     // return $('<div/>').html(value).text();
// };

String.prototype.format = function () {
    var result = this;
    if (arguments.length == 0)
        return null;
    for (var i = 0; i < arguments.length; i++) {
        var re = new RegExp('\\{' + (i) + '\\}', 'gm');
        result = result.replace(re, arguments[i]);
    }
    return result;
};