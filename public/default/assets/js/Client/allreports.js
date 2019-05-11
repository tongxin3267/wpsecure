$(document).ready(function () {
    var pageManager = {
        options: {
            curpage: 1
        },
        init: function () {
            this.initEvents();
            this.initData();
        },
        initEvents: function () {
            var that = this;
            $(".weui-btn-area .more").click(function (e) {
                that.loadData(that.options.curpage + 1);
            });
            $(".weui-cells__title .weui-cell__ftl").click(function (e) {
                location.href = "/client/reportCenterView";
            });
        },
        initData: function () {
            this.loadData(1);
        },
        loadData: function (page) {
            var that = this;
            selfAjax("post", "/Client/secureUpload/allupload", {
                page: page
            }, function (data) {
                if (data) {
                    if (data.error) {
                        showAlert(data.error);
                        return;
                    }
                    that.options.curpage = page;
                    that.rendPage(data);
                    if (data.length < 14) {
                        $(".weui-btn-area .more").hide();
                        // showAlert("已加载全部内容！");
                    } else {
                        $(".weui-btn-area .more").show();
                    }
                } else {
                    $(".weui-btn-area .more").hide();
                    // showAlert("已加载全部内容！");
                }
            });
        },
        rendPage: function (data) {
            var d = $(document.createDocumentFragment());
            data.forEach(function (secure) {
                var detail = $("#tpl_secureDetail").html(),
                    $detail = $(detail);
                d.append($detail);

                $detail.find(".weui-panel__hd").text(secure.position);
                $detail.find(".detail .desc").text(secure.description);
                if (secure.imageName) {
                    $detail.find(".detail img").attr("src", "/uploads/client/images/" + secure.imageName);
                }
                $detail.find(".detail .weui-media-box__info__meta").text(moment(secure.createdDate).format("YYYY-MM-DD HH:mm:ss"));
                if (secure.secureStatus == 1) {
                    // 已处理的
                    $detail.find(".result .desc").text(secure.responseResult);
                    if (secure.responseImage) {
                        $detail.find(".result img").attr("src", "/uploads/client/images/" + secure.responseImage);
                    }
                    $detail.find(".result .weui-media-box__info__meta").text(moment(secure.updatedDate).format("YYYY-MM-DD HH:mm:ss"));
                } else {
                    $detail.find(".result").hide();
                }
            });
            $(".personalCenter").append(d);
        }
    };

    pageManager.init();
});