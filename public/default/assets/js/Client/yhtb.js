$(document).ready(function () {
    selfAjax("post", "/Client/jssdk/getconfigure", {
        url: location.href.split('#')[0]
    }, function (data) {
        if (data.error) {
            showAlert(data.error);
            return;
        }
        wx.config({
            beta: true,
            debug: true,
            appId: data.appId,
            timestamp: data.timestamp,
            nonceStr: data.noncestr,
            signature: data.signature,
            jsApiList: ['chooseImage', 'selectEnterpriseContact'] // 必填，需要使用的JS接口列表，凡是要调用的接口都需要传进来
        });
    });

    wx.error(function (res) {
        // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
    });

    wx.checkJsApi({
        jsApiList: ['selectEnterpriseContact'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
        success: function (res) {
            // 以键值对的形式返回，可用的api值true，不可用为false
            // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
        }
    });

    var pageManager = {
        options: {
            curImg: null
        },
        init: function () {
            this.initEvents();
            this.initData();
        },
        initEvents: function () {
            var that = this;
            $(".personalCenter .weui-uploader #uploaderInput").on("change", function (e) {
                if (e.currentTarget.files.length == 1) {
                    // upload image
                    var fileObj = e.currentTarget.files[0],
                        formData = new FormData();
                    if (fileObj.size / 1024 > 1025) { //大于1M，进行压缩上传
                        that.photoCompress(fileObj, {
                            quality: 0.2
                        }, function (base64Codes) {
                            var bl = that.convertBase64UrlToBlob(base64Codes);
                            formData.append("upfile", bl, Date.parse(new Date()) + ".jpg");
                            that.uploadImage(formData);
                        });
                    } else { //小于等于1M 原图上传
                        formData.append("upfile", fileObj);
                        that.uploadImage(formData);
                    }
                }
            });

            $("#responseUser").click(function (e) {
                // 选择责任人
                wx.invoke("selectEnterpriseContact", {
                    "fromDepartmentId": 0,
                    "mode": "single",
                    "type": ["user"] // 必填，选择限制类型，指定department、user中的一个或者多个
                }, function (res) {
                    if (res.err_msg == "selectEnterpriseContact:ok") {
                        if (typeof res.result == 'string') {
                            res.result = JSON.parse(res.result) //由于目前各个终端尚未完全兼容，需要开发者额外判断result类型以保证在各个终端的兼容性
                        }

                        var selectedUserList = res.result.userList; // 已选的成员列表

                        if (selectedUserList.length > 0) {
                            var user = selectedUserList[0];
                            $("#responsorName").text(user.name);
                            $("#responsorName").attr("userId", user.id);
                        }
                    }
                });
            });

            $('.weui-btn-area #btnDone').click(function (e) {
                showConfirm("确定要提交吗？");
                $("#btnSure").off("click").on("click", function (e) {
                    var filter = {
                        imageName: that.options.curImg,
                        position: $.trim($("#position").val()),
                        description: $.trim($("#description").val()),
                        secureLevel: $.trim($("#secureLevel").val()),
                        responseUser: $.trim($("#responsorName").attr("userId")),
                        copyUser: $.trim($("#copyUser").val())
                    };
                    selfAjax("post", "/Client/secureUpload/add", filter, function (data) {
                        if (data.error) {
                            showAlert(data.error);
                            return;
                        }
                        showAlert("提交成功");
                        $('#confirmModal .modal-footer .btn-default').off("click").on("click", function (e) {
                            location.href = "/Client/myreport";
                        });
                    });
                });
            });
            $(".weui-tab .weui-tabbar .myreport").click(function (e) {
                location.href = "/Client/myreportView";
            });
            $(".weui-tab .weui-tabbar .reportme").click(function (e) {
                location.href = "/Client/reporttomeView";
            });
            $(".weui-tab .weui-tabbar .allreport").click(function (e) {
                location.href = "/Client/allreportsView";
            });
        },
        initData: function () {},
        uploadImage: function (formData) {
            var that = this;
            loading();
            $.ajax({
                type: "POST",
                data: formData,
                url: "/Client/imageUp",
                contentType: false,
                processData: false,
                success: function (data) {
                    $(".personalCenter .weui-uploader .imgFile").css("background-image", "url(" + data.url + ")");
                    that.options.curImg = data.name;
                    hideLoading();
                }
            });
        },
        photoCompress: function (file, w, callback) {
            var that = this,
                ready = new FileReader();
            /*开始读取指定的Blob对象或File对象中的内容. 当读取操作完成时,readyState属性的值会成为DONE,如果设置了onloadend事件处理程序,则调用之.同时,result属性中将包含一个data: URL格式的字符串以表示所读取文件的内容.*/
            ready.readAsDataURL(file);
            ready.onload = function () {
                var re = this.result;
                that.canvasDataURL(re, w, callback)
            }
        },
        canvasDataURL: function (path, obj, callback) {
            var img = new Image();
            img.src = path;
            img.onload = function () {
                var that = this;
                // 默认按比例压缩
                var w = that.width,
                    h = that.height,
                    scale = w / h;
                w = obj.width || w;
                h = obj.height || (w / scale);
                var quality = obj.quality || 0.7; // 默认图片质量为0.7
                //生成canvas
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                // 创建属性节点
                var anw = document.createAttribute("width");
                anw.nodeValue = w;
                var anh = document.createAttribute("height");
                anh.nodeValue = h;
                canvas.setAttributeNode(anw);
                canvas.setAttributeNode(anh);
                ctx.drawImage(that, 0, 0, w, h);

                // quality值越小，所绘制出的图像越模糊
                var base64 = canvas.toDataURL('image/jpeg', quality);
                // 回调函数返回base64的值
                callback(base64);
            }
        },
        convertBase64UrlToBlob: function (urlData) {
            var arr = urlData.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], {
                type: mime
            });
        }
    };

    pageManager.init();
});