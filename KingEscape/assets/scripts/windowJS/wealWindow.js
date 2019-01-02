cc.Class({
    extends: cc.Component,

    properties: {
        reviveCoin: cc.Label,
        wealTip: cc.Prefab
    },

    init(menu) {
        this.menu = menu;
        this.reviveCoin.string = ':' + this.menu.wealOnceReviveCoinNum;
        //屏幕适配
        this.node.width = this.menu.node.width;
        this.node.height = this.menu.node.height;

        this.windowOpenEffect = this.node.getComponent('windowOpenEffect');
        this.windowOpenEffect.showPanel(this.node);
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
            this.menu.gc.publicSharingWithSvrcfg((res) => {
                self.menu.reviveCoinNum += self.menu.wealOnceReviveCoinNum;
                num++;
                self.menu.gc.setBlobMap({
                    wealGetTimes: new Date().getTime() + '_' + num,
                    reviveCoin: self.menu.reviveCoinNum
                });

                //领取提示
                self.getTip = cc.instantiate(self.wealTip);
                self.getTip.opacity = 0;
                self.getTip.runAction(cc.fadeTo(0.2, 255));
                self.node.addChild(self.getTip);
                self.scheduleOnce(() => {
                    self.getTip.runAction(cc.sequence(cc.fadeTo(0.2, 0), cc.callFunc(self.removeTip, self)));
                }, 2);

                self.menu.reviveNumLabel.string = self.menu.reviveCoinNum.toString();
            }, 102);
        } else {
            this.menu.reviveCoinNum += this.menu.wealOnceReviveCoinNum;
            num++;
            this.menu.gc.setBlobMap({
                wealGetTimes: new Date().getTime() + '_' + num,
                reviveCoin: self.menu.reviveCoinNum
            });

            //领取提示
            this.getTip = cc.instantiate(this.wealTip);
            this.getTip.opacity = 0;
            this.getTip.runAction(cc.fadeTo(0.2, 255));
            this.node.addChild(this.getTip);
            this.scheduleOnce(() => {
                this.getTip.runAction(cc.sequence(cc.fadeTo(0.2, 0), cc.callFunc(this.removeTip, this)));
            }, 2);

            //更新menu场景复活币
            this.menu.reviveNumLabel.string = this.menu.reviveCoinNum.toString();
        }

        //按钮音效
        this.menu.audio.onButtonAudio();
    },

    //移除提示窗
    removeTip() {
        this.node.removeChild(this.getTip)
    },

    //判断是否是同一天
    isSameDay(oldTime, nowTime) {
        let oldDate = new Date(oldTime);
        let nowDate = new Date(nowTime);

        let old = oldDate.getFullYear() + '' + oldDate.getMonth() + '' + oldDate.getDate();
        let now = nowDate.getFullYear() + '' + nowDate.getMonth() + '' + nowDate.getDate();
        console.log(old);
        console.log(now);
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
    }
});
