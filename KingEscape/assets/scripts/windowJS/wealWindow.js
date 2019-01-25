cc.Class({
    extends: cc.Component,

    properties: {
        reviveCoin: cc.Label,
        getBtn: cc.Sprite,
        getBtnSp: [cc.SpriteFrame],
        tip: cc.Label
    },

    init(menu) {
        this.menu = menu;
        this.reviveCoin.string = ':' + this.menu.wealOnceReviveCoinNum;
        //屏幕适配
        this.node.width = this.menu.node.width;
        this.node.height = this.menu.node.height;

        this.windowOpenEffect = this.node.getComponent('windowOpenEffect');
        this.windowOpenEffect.showPanel(this.node);

        if (cc.sys.localStorage.getItem('wealAdChange')) {
            this.getBtn.spriteFrame = this.getBtnSp[1];
            this.tip.string = '观看视频可领取';
        } else {
            this.getBtn.spriteFrame = this.getBtnSp[0];
            this.tip.string = '分享到群可领取';
        }

        //关闭banner广告
        this.menu.bannerAd.hide();
    },

    //每日福利领取按钮
    onWealGetBtn() {
        let data = this.menu.gc.getBlobMap();
        let self = this;
        let num = 0;
        if (data) {
            if (data['wealGetTimes']) {
                let times = data['wealGetTimes'].split('_');
                if (this.isSameDay(parseInt(times[0]), new Date().getTime()) && parseInt(times[1]) >= this.menu.wealReviveCoinMaxNum) {
                    self.menu.gc.showModal("已达领取上限");
                    return;
                }
                if (this.isSameDay(parseInt(times[0]), new Date().getTime())) {
                    num = parseInt(times[1]);
                }
            }
        }
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            if (cc.sys.localStorage.getItem('wealAdChange')) {
                this.menu.gc.playAdNew((res) => {
                    self.menu.reviveCoinNum += self.menu.wealOnceReviveCoinNum;
                    num++;
                    self.menu.gc.setBlobMap({
                        wealGetTimes: new Date().getTime() + '_' + num,
                        reviveCoin: self.menu.reviveCoinNum
                    });

                    //领取提示
                    self.menu.wealWindowTip();

                    self.menu.reviveNumLabel.string = self.menu.reviveCoinNum.toString();

                    cc.sys.localStorage.setItem('wealAdChange', false);
                    // self.getBtn.spriteFrame = this.getBtnSp[0];
                    // self.tip.string = '分享到群可领取';

                    self.closeWealWindow();
                }, 102);
            } else {
                this.menu.gc.publicSharingWithSvrcfg((res) => {
                    self.menu.reviveCoinNum += self.menu.wealOnceReviveCoinNum;
                    num++;
                    self.menu.gc.setBlobMap({
                        wealGetTimes: new Date().getTime() + '_' + num,
                        reviveCoin: self.menu.reviveCoinNum
                    });

                    //领取提示
                    self.menu.wealWindowTip();

                    self.menu.reviveNumLabel.string = self.menu.reviveCoinNum.toString();

                    cc.sys.localStorage.setItem('wealAdChange', true);
                    // self.getBtn.spriteFrame = this.getBtnSp[1];
                    // self.tip.string = '观看视频可领取';

                    self.closeWealWindow();
                }, 102);
            }
        } else {
            this.menu.reviveCoinNum += this.menu.wealOnceReviveCoinNum;
            num++;
            this.menu.gc.setBlobMap({
                wealGetTimes: new Date().getTime() + '_' + num,
                reviveCoin: self.menu.reviveCoinNum
            });

            //领取提示
            this.menu.wealWindowTip();

            //更新menu场景复活币
            this.menu.reviveNumLabel.string = this.menu.reviveCoinNum.toString();

            this.closeWealWindow();
        }

        //按钮音效
        this.menu.audio.onButtonAudio();
    },

    //判断是否是同一天
    isSameDay(oldTime, nowTime) {
        let oldDate = new Date(oldTime);
        let nowDate = new Date(nowTime);

        let old = oldDate.getFullYear() + '' + oldDate.getMonth() + '' + oldDate.getDate();
        let now = nowDate.getFullYear() + '' + nowDate.getMonth() + '' + nowDate.getDate();

        if (old === now) {
            return true;
        } else {
            return false;
        }
    },

    //关闭每日福利窗口
    closeWealWindow() {
        this.windowOpenEffect.closePanel();

        this.menu.reviveNumLabel.string = this.menu.reviveCoinNum.toString();

        //按钮音效
        this.menu.audio.onButtonAudio();

        //打开banner广告
        this.menu.bannerAd.show();

        //刷新小红点
        this.menu.redPointTip2();
    }
});
