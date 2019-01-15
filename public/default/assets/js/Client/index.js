$(document).ready(function () {
    var pageManager = {
        option: {
            video: document.getElementById("video"),
            lastTime: new Date().getTime(),
            timeOut: 10 * 1000
        },
        init: function () {
            this.initData();
            this.initEvents();
            // this.timer();
        },
        initData: function () {

        },
        initEvents: function () {
            var that = this;

            /* 鼠标移动事件 */
            $(document).mousemove(function () {
                that.option.lastTime = new Date().getTime(); //更新操作时间
                console.log("change last time!");
            });

            this.option.video.onclick = function (e) {
                that.option.video.pause();
                $(".video").hide();
                // that.timer();
                console.log("begin timer!");
            }
        },
        timer: function () {
            var currentTime = new Date().getTime(); //更新当前时间
            if (currentTime - this.option.lastTime > this.option.timeOut) { //判断是否超时
                window.clearTimeout(this.option.inter);
                // 待机，播放广告
                this.option.video.play();
                $(".video").show();
            } else {
                this.option.inter = setTimeout(this.timer.bind(this), 2000);
            }
        }
    };

    pageManager.init();
});