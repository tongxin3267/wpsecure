$(document).ready(function () {
    var curDate = moment($("#salaryMonth").val(), "YYYY-MM-DD"),
        curYear = curDate.year(),
        curMonth = curDate.month() + 1,
        count = 0;

    var pageManager = {
        init: function () {
            this.initData();
            this.initEvents();
        },
        initData: function () {
            $(".center-title .curDate").text(curYear + "年" + curMonth + "月");
            this.searchSalary();
        },
        initEvents: function () {
            var that = this;
            $(".center-title .prev").click(function (e) {
                if (count < 4) {
                    that.newDate();
                    that.searchSalary();
                    count++;
                }
            });

            $(".center-title .next").click(function (e) {
                if (count > -1) {
                    that.newDate(1);
                    that.searchSalary();
                    count--;
                }
            });
        },
        searchSalary: function () {
            selfAjax("post", "/client/salaryList/search", {
                year: curYear,
                month: curMonth
            }, function (data) {
                $(".salaryItems").empty();
                if (!data) {
                    // 没有数据
                    return;
                }

                if (data.error) {
                    showAlert(data.error);
                    return;
                }

                var d = $(document.createDocumentFragment()),
                    obj = data.other,
                    $cells = $(' <div class="weui-cells"></div>'),
                    curParent;
                d.append($cells);
                obj.forEach(function (item) {
                    if (item.parent) {
                        if (curParent != item.parent) {
                            curParent = item.parent;
                            $cells = $(' <div class="weui-cells"></div>');
                            d.append('<div class="weui-cells__title">' + item.parent + '</div>');
                            d.append($cells);
                            $cells.append('<div class="weui-cell"><div class="weui-cell__bd"><p>' + item.title + '</p></div><div class="weui-cell__ft">' + item.value + '</div></div>');
                        } else {
                            $cells.append('<div class="weui-cell"><div class="weui-cell__bd"><p>' + item.title + '</p></div><div class="weui-cell__ft">' + item.value + '</div></div>');
                        }
                    } else {
                        d.append('<div class="weui-cell"><div class="weui-cell__bd"><p>' + item.title + '</p></div><div class="weui-cell__ft">' + item.value + '</div></div>');
                    }
                })
                $(".salaryItems").append(d);
            });
        },
        newDate: function (increase) {
            if (increase) {
                curDate = curDate.add(1, 'months');
            } else {
                curDate = curDate.subtract(1, 'months');
            }
            curYear = curDate.year();
            curMonth = curDate.month() + 1;
            $(".center-title .curDate").text(curYear + "年" + curMonth + "月");
        }
    };
    pageManager.init();
})