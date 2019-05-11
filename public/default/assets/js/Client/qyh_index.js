var hideConfirmForm, sureConfirmForm;
window.showAlert = function (msg, title, callback) {
    $('#confirmModal').show();
    // $('#confirmModal .weui-dialog__hd').hide();
    $('#confirmModal .weui-dialog__bd').text(msg);
    $('#confirmModal .weui-dialog__title').text(title || '提醒');

    $('#confirmModal .weui-dialog__ft .btnCancel').text("确定");
    $('#confirmModal .weui-dialog__ft #btnSure').hide();

    hideConfirmForm = function () {
        callback && callback();
        $('#confirmModal').hide();
    };
};

window.showConfirm = function (msg, title, hidecallback, surecallback) {
    $('#confirmModal').show();
    // $('#confirmModal .weui-dialog__hd').hide();
    $('#confirmModal .weui-dialog__hd .weui-dialog__title').text(title || "确认");
    $('#confirmModal .weui-dialog__bd').text(msg);

    $('#confirmModal .weui-dialog__ft .btnCancel').text("取消");
    $('#confirmModal .weui-dialog__ft #btnSure').show();

    hideConfirmForm = function () {
        hidecallback && hidecallback();
        $('#confirmModal').hide();
    };

    sureConfirmForm = function () {
        surecallback && surecallback();
        $('#confirmModal').hide();
    };
};

$(document).ready(function () {
    $('#confirmModal .weui-dialog__ft #btnSure').on("click", function (e) {
        sureConfirmForm && sureConfirmForm();
    });

    $('#confirmModal .weui-dialog__ft #btnCancel').on("click", function (e) {
        hideConfirmForm && hideConfirmForm();
    });
});


window.selfAjax = function (method, url, filter, callback) {
    loading();
    return $[method](
        url,
        filter,
        function (data) {
            callback(data);
            hideLoading();
            return data;
        });
};
window.loadingCount = 0; //loading计数
window.loading = function () {
    loadingCount++;
    if (loadingCount == 1) {
        $("#loadingIndicator").show();
    }
};

window.hideLoading = function () {
    loadingCount--;
    if (loadingCount == 0) {
        $("#loadingIndicator").hide();
    }
};

window.is_weixn = function () {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == "micromessenger") { //这就是微信用的内置浏览器  
        return true;
    } else {
        return false;
    }
};

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