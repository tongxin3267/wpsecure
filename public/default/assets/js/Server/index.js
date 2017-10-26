$(document).ready(function () {
    $("#header_btnEnroll").on("click", function (e) {
        location.href = "/admin/adminEnrollTrainList";
    });
    $("#header_btnClass").on("click", function (e) {
        location.href = "/admin/trainClassList";
    });
    $("#header_btnStudent").on("click", function (e) {
        location.href = "/admin/studentAccountList";
    });
    $("#header_btnFinancial").on("click", function (e) {
        location.href = "/admin/schoolReportList";
    });
    $("#header_btnBasic").on("click", function (e) {
        location.href = "/admin/schoolAreaList";
    });
    $("#header_btnEnrollExam").on("click", function (e) {
        location.href = "/admin/adminEnrollExamList";
    });
    $("#header_btnRollCall").on("click", function (e) {
        location.href = "/admin/adminRollCallList";
    });
    $("#header_btnBook").on("click", function (e) {
        location.href = "/admin/adminBookList";
    });
});

window.getTrainOrderStatus = function (isSucceed) {
    switch (isSucceed) {
        case 1:
            return "已报名"
            break;
        case 6:
            return "已预存"
            break;
        case 9:
            return "已取消"
            break;
    }
};

window.getPayway = function (way) {
    switch (way) {
        case 0:
            return "现金";
        case 1:
            return "刷卡";
        case 2:
            return "转账";
        case 8:
            return "支付宝";
        case 9:
            return "微信";
        case 6:
            return "在线";
        case 7:
            return "在线";
    }
    return "";
};

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
    $("#loadingIndicator").modal('hide');
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