$(document).ready(function () {
    var pageManager = {
        options: {
            curpage: 1,
            isHandle: 0
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
            $(".weui-tab .weui-tabbar .reportup").click(function (e) {
                location.href = "/Client/yhtbView";
            });
            $(".weui-tab .weui-tabbar .reportme").click(function (e) {
                location.href = "/Client/reporttomeView";
            });
            $(".weui-tab .weui-tabbar .allreport").click(function (e) {
                location.href = "/Client/allreportsView";
            });

            $(".weui-tab .weui-navbar .unhandle").click(function (e) {
                // page to 1;
                // clear page
                that.options.curpage = 1;
                that.options.isHandle = 0;
                $(".personalCenter").empty();
                that.loadData(1);
                $(".weui-tab .weui-navbar .unhandle").addClass("weui-bar__item_on");
                $(".weui-tab .weui-navbar .handle").removeClass("weui-bar__item_on");
            });
            $(".weui-tab .weui-navbar .handle").click(function (e) {
                that.options.curpage = 1;
                that.options.isHandle = 1;
                $(".personalCenter").empty();
                that.loadData(1);
                $(".weui-tab .weui-navbar .handle").addClass("weui-bar__item_on");
                $(".weui-tab .weui-navbar .unhandle").removeClass("weui-bar__item_on");
            });
        },
        initData: function () {
            this.loadData(1);
        },
        loadData: function (page) {
            var that = this;
            selfAjax("post", "/Client/secureUpload/myupload", {
                page: page,
                isHandle: that.options.isHandle
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