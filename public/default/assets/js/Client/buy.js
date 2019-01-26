$(document).ready(function () {
    var pageManager = {
        option: {
            aVideo: null,
            aCanvas1: null,
            ctx1: null,
            aCanvas2: null,
            ctx2: null,
            aCanvas3: null,
            ctx3: null,
            lastTime: new Date().getTime(),
            timeOut: 60 * 1000
        },
        init: function () {
            this.initData();
            this.initEvents();
            // this.timer();
        },
        initData: function () {
            this.option.aVideo = document.getElementById('video');
            this.option.aCanvas1 = document.getElementById('canvas1');
            this.option.ctx1 = this.option.aCanvas1.getContext('2d');
            this.option.aCanvas2 = document.getElementById('canvas2');
            this.option.ctx2 = this.option.aCanvas2.getContext('2d');
            this.option.aCanvas3 = document.getElementById('canvas3');
            this.option.ctx3 = this.option.aCanvas3.getContext('2d');

            navigator.getUserMedia = navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia; //获取媒体对象（这里指摄像头）
            navigator.getUserMedia({
                video: true
            }, this.gotStream.bind(this), this.noStream.bind(this));
        },
        initEvents: function () {
            var that = this;
            $(".buy .img .cartoon").click(function (e) {
                selfAjax("post", "http://localhost:2369/localService/dropGood", {data:5}, function (data) {
                    if (data.error) {
                        showAlert(data.error);
                        return;
                    }
                    that.snap1();
                    setTimeout(function(){
                        that.snap1();
                    }, 200);
                    setTimeout(function(){
                        that.snap1();
                    }, 400);
                });
            });
        },
        timer: function () {
            var currentTime = new Date().getTime(); //更新当前时间
            if (currentTime - this.option.lastTime > this.option.timeOut) { //判断是否超时
                window.clearTimeout(this.option.inter);
                location.href = "/Client";
            } else {
                this.option.inter = setTimeout(this.timer.bind(this), 2000);
            }
        },
        noStream: function (err) {
            // log to server?
        },
        gotStream: function (stream) {
            this.option.aVideo.srcObject = stream;
            this.option.aVideo.onerror = function () {
                stream.stop();
            };
            stream.onended = this.noStream.bind(this);
            this.option.aVideo.onloadedmetadata = function () {
                // log to server?
            };
        },
        snap1: function () {
            this.option.ctx1.drawImage(this.option.aVideo, 0, 0, 640, 480);
            var base64Codes = this.option.aCanvas1.toDataURL("image/jpg");
            // var base64Codes = imgData.split(",")[1];
            var bl = this.convertBase64UrlToBlob(base64Codes);
            var formData = new FormData();
            formData.append("upfile", bl, Date.parse(new Date()) + ".jpg");
            $.ajax({
                type: "POST",
                data: formData,
                url: "/client/imageUp",
                contentType: false,
                processData: false,
                success: function (data) {
                    location.href = "/Client";
                }
            });
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