var hideConfirmForm;
window.showAlert = function (msg, title, callback) {
    $('#confirmModal').show();
    $('#confirmModal #confirmModalLabel').text(title || "提示");
    $('#confirmModal .modal-body').text(msg);

    $('#confirmModal .modal-footer .btn-default').text("确定");
    $('#confirmModal #btnConfirmSave').hide();

    hideConfirmForm = function () {
        callback && callback();
        $('#confirmModal').hide();
    };
};

window.showConfirm = function (msg, title, hidecallback) {
    $('#confirmModal').show();
    $('#confirmModal #confirmModalLabel').text(title || "确认");
    $('#confirmModal .modal-body').text(msg);

    $('#confirmModal .modal-footer .btn-default').text("取消");
    $('#confirmModal #btnConfirmSave').show();

    hideConfirmForm = function () {
        hidecallback && hidecallback();
        $('#confirmModal').hide();
    };
};

$(document).ready(function () {
    $('#confirmModal #btnConfirmSave').on("click", function (e) {

    });

    $('#confirmModal .modal-footer .btn-default').on("click", function (e) {
        hideConfirmForm();
    });
});

window.loadingCount = 0; //loading计数
window.selfAjax = function (method, url, filter) {
    return loading()
        .then(function () {
            return new Promise(function (resolve, reject) {
                $[method](
                    url,
                    filter,
                    function (data) {
                        setTimeout(function () {
                            hideLoading();
                        }, 0);
                        resolve(data);
                    });
            });
        });
};

window.loading = function () {
    return new Promise(function (resolve, reject) {
        loadingCount++;
        if (loadingCount == 1) {
            $("#loadingIndicator").show();
            resolve();
        } else {
            resolve();
        }
    });
};

window.hideLoading = function () {
    return new Promise(function (resolve, reject) {
        loadingCount--;
        if (loadingCount == 0) {
            $("#loadingIndicator").hide();
            resolve();
        } else {
            resolve();
        }
    });
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