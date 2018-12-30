$(document).ready(function () {
    var pageManager = {
        pageOptions: {},
        pageInit: function () {
            this.pageInitStyle();
            this.pageInitEvents();
            this.pageInitData();
        },
        pageInitStyle: function () {
            $("#left_btnSite").addClass("active");
        },
        pageInitEvents: function () {
            var that = this;
            $(".toolbar #btnSave").on("click", function (e) {
                postObj = {
                    name: $.trim($('.mainModal #name').val()),
                    description: $.trim($('.mainModal #description').val())
                };
                postURI = "/admin/siteInfo/edit";
                selfAjax("post", postURI, postObj, function (data) {
                    if (data.error) {
                        showAlert(data.error);
                        return;
                    }
                    location.reload();
                });
            });
        },
        pageInitData: function () {
            this.pageSearch();
        },
        pageSearch: function (p) {
            selfAjax("post", "/admin/siteInfoList/search", {}, function (data) {
                if (data.error) {
                    showAlert(data.error);
                    return;
                }
                $(".mainModal #name").val(data.name);
                $(".mainModal #description").val(data.description);
            });
        }
    };

    pageManager.pageInit();
});