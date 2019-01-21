$(document).ready(function () {
    var pageManager = {
        option: {
            lastTime: new Date().getTime(),
            timeOut: 5 * 1000
        },
        init: function () {
            this.initData();
            this.initEvents();
            this.timer();
        },
        initData: function () {

        },
        initEvents: function () {
            var that = this;
            $(".focus .img .cartoon").click(function (e) {
                location.href = "/Client/buy";
            });
            /* 鼠标移动事件 */
            // $(document).mousemove(function () {
            //     that.pauseVideo();
            //     console.log("change last time!");
            // });
        },
        timer: function () {
            var currentTime = new Date().getTime(); //更新当前时间
            if (currentTime - this.option.lastTime > this.option.timeOut) { //判断是否超时
                window.clearTimeout(this.option.inter);
                location.href = "/Client";
            } else {
                this.option.inter = setTimeout(this.timer.bind(this), 2000);
            }
        }
    };

    pageManager.init();
});