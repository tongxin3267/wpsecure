$(document).ready(function () {
    var pageManager = {
        options: {
            curpage: 1,
            curSecureId: 0,
            curImg: "",
            $curSecure: null,
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
            $(".weui-tab .weui-tabbar .myreport").click(function (e) {
                location.href = "/Client/myreportView";
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

            $(".personalCenter").on("click", ".weui-panel .result .weui-media-box__title", function (e) {
                that.options.$curSecure = $(e.currentTarget);
                var entity = that.options.$curSecure.data("obj");
                that.rendEdit(entity);
            });

            $(".editResult .j_bottom .weui-btn_default").click(function (e) {
                $(".editResult").hide();
            });

            $(".editResult .j_bottom .weui-btn_primary").click(function (e) {
                // save and close then refresh page
                var filter = {
                    responseImage: that.options.curImg,
                    responseResult: $.trim($("#description").val()),
                    _id: that.options.curSecureId
                };
                selfAjax("post", "/Client/secureUpload/addResponse", filter, function (data) {
                    if (data.error) {
                        showAlert(data.error);
                        return;
                    }
                    showAlert("提交成功");
                    var entity = that.options.$curSecure.data("obj");
                    entity.responseImage = that.options.curImg;
                    entity.responseResult = $.trim($("#description").val());

                    $(".personalCenter #sId" + that.options.curSecureId + " .result img").attr("src", clientImgPath + entity.responseImage);
                    $(".personalCenter #sId" + that.options.curSecureId + " .result .desc").text(entity.responseResult);
                    $(".personalCenter #sId" + that.options.curSecureId + " .result .weui-media-box__info__meta").text(moment().format("YYYY-MM-DD HH:mm:ss"));
                    $(".editResult").hide();
                    that.options.$curSecure.data("obj", JSON.stringify(entity));
                });
            });

            $(".weui-uploader #uploaderInput").on("change", function (e) {
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
        },
        initData: function () {
            this.loadData(1);
        },
        loadData: function (page) {
            var that = this;
            selfAjax("post", "/Client/secureUpload/reporttome", {
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
                    $detail.find(".detail img").attr("src", clientImgPath + secure.imageName);
                }
                $detail.find(".detail .weui-media-box__info__meta").text(moment(secure.createdDate).format("YYYY-MM-DD HH:mm:ss"));
                if (secure.secureStatus == 1) {
                    // 已处理的
                    $detail.find(".result .desc").text(secure.responseResult);
                    if (secure.responseImage) {
                        $detail.find(".result img").attr("src", clientImgPath + secure.responseImage);
                    }
                    $detail.find(".result .weui-media-box__info__meta").text(moment(secure.updatedDate).format("YYYY-MM-DD HH:mm:ss"));
                }
                $detail.find(".result .weui-media-box__title").data("obj", JSON.stringify(secure));
                $detail.attr("id", "sId" + secure._id);
            });
            $(".personalCenter").append(d);
        },
        rendEdit: function (entity) {
            this.options.curSecureId = entity._id;
            $(".editResult").show();
            $(".editResult #description").val(entity.responseResult);
            $(".weui-uploader .imgFile").css("background-image", "url(" + clientImgPath + entity.responseImage + ")");
            this.options.curImg = entity.responseImage;
        },
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
                    $(".weui-uploader .imgFile").css("background-image", "url(" + data.url + ")");
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