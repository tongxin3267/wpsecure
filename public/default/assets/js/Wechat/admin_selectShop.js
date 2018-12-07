$(document).ready(function () {
    var pageManager = {
        options: {
            $mainSelectBody: $('#selShop')
        },
        init: function () {
            this.initEvents();
            this.initData();
        },
        initEvents: function () {
            $('#btnSure').click(function (e) {
                location.href = "/wechatadmin/{0}/login".format($("#selShop").val());
            });
        },
        initData: function () {
            var that = this;
            selfAjax("post", "/wechatAdmin/getAllShops", null, function (data) {
                if (data && data.length > 0) {
                    var d = $(document.createDocumentFragment());
                    data.forEach(function (record) {
                        d.append('<option value=' + record._id + '>' + record.name + '</option>');
                    });
                    that.options.$mainSelectBody.append(d);
                }
            });
        }
    };

    pageManager.init();
});