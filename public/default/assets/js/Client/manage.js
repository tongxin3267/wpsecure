$(document).ready(function () {
    var pageManager = {
        option: {
            container: $(".paths"),
            goods: null,
            curPath: "",
            curInput: null
        },
        init: function () {
            this.initData();
            this.initEvents();
            this.initKeyBoardEvents();
        },
        initEvents: function () {
            var that = this;
            $("#btnExit").on("click", function (e) {
                // 退出
                location.href = "/Client/manage/logout";
            });

            $("#btnRefresh").on("click", function (e) {
                // 刷新
                location.href = location.href;
            });

            $("#btnEmpty").on("click", function (e) {
                // 清空
                $(".paths table td").each(function (i) {
                    var path = $(this).data("obj");
                    $(".paths #" + path._id + " .count").val(0);
                });
            });

            $("#btnFull").on("click", function (e) {
                // 填满
                $(".paths table td").each(function (i) {
                    var path = $(this).data("obj");
                    $(".paths #" + path._id + " .count").val(10);
                });
            });

            $("#btnLock").on("click", function (e) {
                // 锁定
                selfAjax("post", "/Client/manage/lockShop", null, function (result) {
                    location.href = "/Client/manage/logout";
                });
            });

            $("#btnUnLock").on("click", function (e) {
                // 解锁定
                selfAjax("post", "/Client/manage/unlockShop", null, function (result) {
                    if (result.error) {
                        showAlert(result.error);
                        return;
                    }
                    showAlert("解锁成功！");
                });
            });

            $(".paths").on("click", "img", function (e) {
                // get current seq
                var entity = $(e.currentTarget).parent().data("obj");
                that.option.curPath = entity;
                $('#myModal').modal({
                    backdrop: 'static',
                    keyboard: false
                });
            });

            $(".paths").on("click", "td .count", function (e) {
                that.option.curInput = $(e.currentTarget);
                $(".mykb-box").show();
                e.stopPropagation();
                var position = that.option.curInput.position();
                var x = position.left - 150,
                    y = position.top + 60,
                    totalWidth = $(window).width(),
                    totalHeight = $(window).height();
                if (x + 360 > totalWidth) {
                    x = totalWidth - 360;
                }
                if (y + 270 > totalHeight) {
                    y = position.top - 270;
                }
                $(".mykb-box").css({
                    'left': (x > 0 ? x : 0),
                    'top': y
                });
            });
            $(".manage").click(function (e) {
                $(".mykb-box").hide();
            });
            // close model
            $("#myModal .goodList").on("click", "img", function (e) {
                // get current seq
                var entity = $(e.currentTarget).parent().data("obj");
                $("#" + that.option.curPath._id + " img").attr("src", "../uploads/icons/" + entity.img);
                $("#" + that.option.curPath._id + " .shopName").text(entity.name);
                that.option.curPath.goodName = entity.name;
                that.option.curPath.img = entity.img;
                that.option.curPath.goodId = entity.goodId;
                $('#myModal').modal('hide');
            });

            $("#btnSave").click(function (e) {
                // 保存
                // save all data to db
                var paths = JSON.stringify(that.getAllData());
                selfAjax("post", "/Client/manage/updatepaths", {
                    paths: paths
                }, function (result) {

                });
            });
        },
        initData: function () {
            var that = this;
            // goods and paths
            selfAjax("post", "/Client/manage/paths", null, function (result) {
                if (result.error) {
                    showAlert(result.error);
                    return;
                }
                that.option.goods = result.goods;
                if (result.paths && result.paths.length > 0) {
                    var $table = $("<table></table>"),
                        vCount = result.shop.vpathCount;
                    for (var i = 0; i < result.paths.length;) {
                        var $tr = $("<tr></tr>");
                        for (var j = 0; j < vCount; j++) {
                            if (i < result.paths.length) {
                                var img = result.paths[i].img || '',
                                    name = result.paths[i].goodName || '沒有商品',
                                    count = result.paths[i].goodCount || 0;
                                $td = $("<td id=" + result.paths[i]._id + "><img src={0} /><div class='shopName'>{1}</div><div>商品数量: <input type='number' min=0 max=99 class='form-control input-lg count' /></div></td>".format("../uploads/icons/" + (img || "blank.png"), name));
                                var $count = $td.find(".count");
                                for (var m = 0; m <= 10; m++) {
                                    $count.append('<option value=' + m + '>' + m + '</option>');
                                }
                                $count.val(count);
                                $td.data("obj", result.paths[i]);
                                $tr.append($td);
                            } else {
                                $td = $("<td></td>");
                                $tr.append($td);
                            }
                            i++;
                        }
                        $table.append($tr);
                    }
                    that.option.container.append($table);
                }

                if (result.goods && result.goods.length > 0) {
                    var $table = $("<table></table>"),
                        $tr = $("<tr></tr>");
                    result.goods.forEach(function (good) {
                        var img = good.img || '',
                            name = good.name;
                        $td = $("<td><img src={0} /><div>{1}</div></td>".format("../uploads/icons/" + img, name));
                        $td.data("obj", good);
                        $tr.append($td);
                    });
                    $table.append($tr);
                    $("#myModal .goodList").append($table);
                }
            });
        },
        getAllData: function () {
            var paths = [];
            $(".paths table td").each(function (i) {
                var path = $(this).data("obj");
                paths.push({
                    sequence: path.sequence,
                    goodId: path.goodId,
                    goodName: path.goodName,
                    goodCount: $(".paths #" + path._id + " .count").val(),
                    _id: path._id
                });
            });
            return paths;
        },
        initKeyBoardEvents: function () {
            var that = this;
            $(".mykb-box .num").click(function (e) {
                if ($(e.currentTarget).text() == ".") {
                    return;
                }
                var old = parseInt(that.option.curInput.val() || 0);
                that.option.curInput.val(old * 10 + parseInt($(e.currentTarget).text()));
            });

            $(".mykb-box .exit").click(function (e) {
                $(".mykb-box").hide();
            });
            $(".mykb-box .sure").click(function (e) {
                $(".mykb-box").hide();
            });

            $(".mykb-box .clearall").click(function (e) {
                that.option.curInput.val(0);
            });
            $(".mykb-box .del").click(function (e) {
                var old = parseInt(that.option.curInput.val() || 0);
                if (old == 0) {
                    return;
                }
                that.option.curInput.val(Math.floor(old / 10));
            });
        }
    };

    pageManager.init();
});