$(document).ready(function () {
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

            $('.weui-btn-area #btnDone').click(function (e) {
                showConfirm("确定要提交吗？");
                $("#btnConfirmSave").off("click").on("click", function (e) {
                    var filter = {
                        imageName: that.options.curImg,
                        position: $.trim($("#position").val()),
                        description: $.trim($("#description").val()),
                        secureLevel: $.trim($("#secureLevel").val()),
                        responseUser: $.trim($("#responseUser").val()),
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