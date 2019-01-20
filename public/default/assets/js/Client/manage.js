$(document).ready(function () {
    var pageManager = {
        option: {
            container: $(".paths"),
            goods: null,
            curPath: ""
        },
        init: function () {
            this.initData();
            this.initEvents();
        },
        initEvents: function () {
            var that = this;
            $("#btnExit").on("click", function (e) {
                // 退出
                location.href = "/Client/manage/logout";
            });

            $("#btnRefresh").on("click", function (e) {
                location.href = location.href;
            });

            $("#btnEmpty").on("click", function (e) {
                $(".paths table td").each(function (i) {
                    var path = $(this).data("obj");
                    $(".paths #" + path._id + " .count").val(0);
                });
            });

            $("#btnFull").on("click", function (e) {
                $(".paths table td").each(function (i) {
                    var path = $(this).data("obj");
                    $(".paths #" + path._id + " .count").val(10);
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

            // close model
            $("#myModal .goodList").on("click", "img", function (e) {
                // get current seq
                var entity = $(e.currentTarget).parent().data("obj");
                $("#" + that.option.curPath._id + " img").attr("src", "../uploads/icons/" + entity.img);
                $("#" + that.option.curPath._id + " .shopName").text(entity.name);
                that.option.curPath.goodName = entity.name;
                that.option.curPath.img = entity.img;
                that.option.curPath.goodId = entity._id;
                $('#myModal').modal('hide');
            });

            $("#btnSave").click(function (e) {
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
                                $td = $("<td id=" + result.paths[i]._id + "><img src={0} /><div class='shopName'>{1}</div><div>商品数量: <input type='number' min=0 class='count' value={2} /></div></td>".format("../uploads/icons/" + img, name, count));
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
                    goodId: path.goodId,
                    goodName: path.goodName,
                    goodCount: $(".paths #" + path._id + " .count").val(),
                    _id: path._id
                });
            });
            return paths;
        }
    };

    pageManager.init();
});