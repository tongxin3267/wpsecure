$(document).ready(function () {
    var pageManager = {
        options: {
            $mainSelectBody: $('.content.mainModal table tbody')
        },
        init: function () {
            this.initStyle();
            this.initEvents();
            this.initData();
        },
        initStyle: function () {
            $("#left_btnGood").addClass("active");

            $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
            $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动
        },
        initEvents: function () {
            var that = this;
            $(".mainModal #InfoSearch #btnSearch").on("click", function (e) {
                that.search();
            });

            $("#gridBody").on("click", "td .btnSet", function (e) {
                var obj = e.currentTarget;
                var entity = $(obj).parent().data("obj");
                location.href = "/shop/{0}/good/{1}/attribute/{2}".format($("#shopId").val(), $("#goodId").val(), entity._id);
            });
        },
        initData: function () {
            this.search();
        },
        search: function (p) {
            var that = this,
                filter = {
                    name: $(".mainModal #InfoSearch #Name").val(),
                    goodId: $('#goodId').val()
                },
                pStr = p ? "p=" + p : "";
            this.options.$mainSelectBody.empty();
            selfAjax("post", "/admin/goodAttributeList/search?" + pStr, filter, function (data) {
                if (data && data.records.length > 0) {
                    var d = $(document.createDocumentFragment());
                    data.records.forEach(function (record) {
                        var $tr = $('<tr id=' + record._id + '><td>' + record.name + '</td><td>' +
                            record.sequence + '</td><td><div class="btn-group">' + that.getButtons() + '</div></td></tr>');
                        $tr.find(".btn-group").data("obj", record);
                        d.append($tr);
                    });
                    that.options.$mainSelectBody.append(d);
                }
                setPaging("#mainModal", data, that.search.bind(that));
            });
        },
        getButtons: function () {
            var buttons = '<a class="btn btn-default btnSet">设置</a>';
            return buttons;
        }
    };

    pageManager.init();
});