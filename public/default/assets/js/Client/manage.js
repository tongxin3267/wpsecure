$(document).ready(function () {
    var pageManager = {
        option: {
            container: $(".paths"),
            goods: null
        },
        init: function () {
            this.initData();
            this.initEvents();
        },
        initEvents: function () {
            var that = this;
            $("#btnExit").on("click", function (e) {
                // 退出
                location.href = "/student/login";
            });

            $(".paths").on("click","img", function(e){
                // get current seq
                // $('#myModal #id').val(entity._id);
                $('#myModal').modal({
                    backdrop: 'static',
                    keyboard: false
                });
            });

            // close model
            $("#myModal .goodList").on("click","img", function(e){
                // get current seq
                // $('#myModal #id').val(entity._id);
                $('#myModal').modal('hide');
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
                                $td = $("<td><img src={0} /><div>{1}</div><div>商品数量: <input type='number' min=0 id='count' value={2} /></div></td>".format(img, name, count));
                                $td.data("obj", result.paths[i]);
                                $tr.append($td);
                            }
                            else {
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
                        $td = $("<td><img src={0} /><div>{1}</div></td>".format(img, name));
                        $td.data("obj", result.paths[i]);
                        $tr.append($td);
                    });
                    $table.append($tr);
                    $("#myModal .goodList").append($table);
                }
            });
        }
    };

    pageManager.init();
});