
cc.Class({
    extends: cc.Component,

    properties: {
        totalMoney: cc.Label,
    },

    //初始化，传值
    init(self) {
        this.self = self;
        this.gc = self.gc;
        //屏幕适配
        this.node.width = this.self.node.width;
        this.node.height = this.self.node.height;

        this.self.sessionData.buff = [0, 0, 0, 0];
        this.buff1 = 0;
        this.buff2 = 0;
        this.buff3 = 0;
        this.buff4 = 0;

        this.isShare = true;
    },

    //打开强化界面
    openAdvanceWindow() {
        this.money = this.self.gc.getGold();
        this.totalMoney.string = this.money;

        this.onBtnHuan();

        if (this.self.gameBg) {
            this.self.gameState = '';
        }
        this.windowOpenEffect = this.node.getComponent('windowOpenEffect');
        this.windowOpenEffect.showPanel(this.node);

        //关闭banner广告
        this.self.bannerAd.hide();

    },

    //关闭强化界面
    closeAdvanceWindow() {
        this.windowOpenEffect.closePanel();

        //按钮音效
        this.self.audio.onButtonAudio();

        if (this.self.gameBg) {
            this.self.openOverWindow();
        }

        //打开banner广告
        this.self.bannerAd.show();
    },

    //开始游戏
    onBtnStart() {
        this.node.parent.removeChild(this.node);
        //按钮音效
        this.self.audio.onButtonAudio();

        //扣除buff金币
        this.gc.subGold(this.money - parseInt(this.totalMoney.string));

        if (this.self.gameBg) {
            this.self.stage.restart();

            this.self.startGame();

        } else {
            cc.director.loadScene('GameScene');
        }

        this.self.sessionData.buff_free = [false, false, false, false];
    },

    //能力强化界面
    onBtnHuan() {
        for (let i = 1; i < 5; i++) {
            let gou = this.node.getChildByName('buff' + i).getChildByName('gou');
            let buffNum = this.node.getChildByName('buff' + i).getChildByName('buffNum');
            let buyBtnStr = this.node.getChildByName('buff' + i).getChildByName('buyBtn').getChildByName('ad_now');
            let money = this.node.getChildByName('buff' + i).getChildByName('money');
            if (!gou.active) {
                let arr = new Array();
                for (let j = 0; j < this.self.bufftbl.getLength(); j++) {
                    if (this.self.bufftbl.indexOf(j).buff_type === i) {
                        arr.push(this.self.bufftbl.indexOf(j));
                    }
                }
                let index = 0;
                if (this.self.sessionData.buff_free[i - 1]) {
                    index = arr.length - 1;
                } else {
                    index = Math.floor(Math.random() * arr.length);
                }
                let addNum = parseFloat(arr[index].buff_value);
                let price = arr[index].price;

                if (i < 4) {
                    buffNum.getComponent(cc.Label).string = '增加' + addNum * 100 + '%';
                }
                if (i === 4) {
                    buffNum.getComponent(cc.Label).string = '增加' + addNum + '级';
                }
                money.getComponent(cc.Label).string = price;

                if (this.self.sessionData.buff_free[i - 1]) {
                    gou.active = true;
                    buyBtnStr.active = false;
                    this.self.sessionData.buff[i - 1] = addNum;
                }
            }
        }
    },

    //能力强化界面金币购买
    onBtnBuy(event) {
        let totalMoney = parseInt(this.node.getChildByName('totalMoney').getComponent(cc.Label).string);
        var node = event.target;
        var buttonMoney = parseInt(node.parent.getChildByName('money').getComponent(cc.Label).string);
        if (totalMoney >= buttonMoney) {
            totalMoney = totalMoney - buttonMoney;
            node.active = false;
            node.parent.getChildByName('gou').active = true;
            this.node.getChildByName('totalMoney').getComponent(cc.Label).string = totalMoney.toString();

            //判断buff类型
            switch (node.parent) {
                case this.node.getChildByName('buff1'):
                    this.buff1 = parseInt(node.parent.getChildByName('buffNum').getComponent(cc.Label).string.replace(/[^0-9]/ig, "")) / 100;
                    this.self.sessionData.buff[0] = this.buff1;
                    break;
                case this.node.getChildByName('buff2'):
                    this.buff2 = parseInt(node.parent.getChildByName('buffNum').getComponent(cc.Label).string.replace(/[^0-9]/ig, "")) / 100;
                    this.self.sessionData.buff[1] = this.buff2;
                    break;
                case this.node.getChildByName('buff3'):
                    this.buff3 = parseInt(node.parent.getChildByName('buffNum').getComponent(cc.Label).string.replace(/[^0-9]/ig, "")) / 100;
                    this.self.sessionData.buff[2] = this.buff3;
                    break;
                case this.node.getChildByName('buff4'):
                    this.buff4 += parseInt(node.parent.getChildByName('buffNum').getComponent(cc.Label).string.replace(/[^0-9]/ig, ""));
                    this.self.sessionData.buff[3] = this.buff4;
                    break;
            }
        } else {
            switch (event.target.parent) {
                case this.node.getChildByName('buff1'):
                    this.sharePoint = 104;
                    break;
                case this.node.getChildByName('buff2'):
                    this.sharePoint = 105;
                    break;
                case this.node.getChildByName('buff3'):
                    this.sharePoint = 106;
                    break;
                case this.node.getChildByName('buff4'):
                    this.sharePoint = 107;
                    break;
            }
            if (this.isShare) {
                this.onBtnShare(event);
            } else {
                this.onBtnShareAd(event);
            }
        }

        //按钮音效
        this.self.audio.onButtonAudio();
    },

    //能力强化界面分享获得
    onBtnShare(event) {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            this.gc.publicSharingWithSvrcfg((res) => {
                let node = event.target;
                node.active = false;
                node.parent.getChildByName('gou').active = true;
                //判断buff类型
                switch (node.parent) {
                    case this.node.getChildByName('buff1'):
                        this.buff1 = parseInt(node.parent.getChildByName('buffNum').getComponent(cc.Label).string.replace(/[^0-9]/ig, "")) / 100;
                        this.self.sessionData.buff[0] = this.buff1;
                        this.self.sessionData.buff_free[0] = true;
                        break;
                    case this.node.getChildByName('buff2'):
                        this.buff2 = parseInt(node.parent.getChildByName('buffNum').getComponent(cc.Label).string.replace(/[^0-9]/ig, "")) / 100;
                        this.self.sessionData.buff[1] = this.buff2;
                        this.self.sessionData.buff_free[1] = true;
                        break;
                    case this.node.getChildByName('buff3'):
                        this.buff3 = parseInt(node.parent.getChildByName('buffNum').getComponent(cc.Label).string.replace(/[^0-9]/ig, "")) / 100;
                        this.self.sessionData.buff[2] = this.buff3;
                        this.self.sessionData.buff_free[2] = true;
                        break;
                    case this.node.getChildByName('buff4'):
                        this.buff4 += parseInt(node.parent.getChildByName('buffNum').getComponent(cc.Label).string.replace(/[^0-9]/ig, ""));
                        this.self.sessionData.buff[3] = this.buff4;
                        this.self.sessionData.buff_free[3] = true;
                        break;
                }

                this.isShare = false;
            }, this.sharePoint);
        } else {
            let node = event.target;
            node.active = false;
            node.parent.getChildByName('gou').active = true;
            //判断buff类型
            switch (node.parent) {
                case this.node.getChildByName('buff1'):
                    this.buff1 = parseInt(node.parent.getChildByName('buffNum').getComponent(cc.Label).string.replace(/[^0-9]/ig, "")) / 100;
                    this.self.sessionData.buff[0] = this.buff1;
                    this.self.sessionData.buff_free[0] = true;
                    break;
                case this.node.getChildByName('buff2'):
                    this.buff2 = parseInt(node.parent.getChildByName('buffNum').getComponent(cc.Label).string.replace(/[^0-9]/ig, "")) / 100;
                    this.self.sessionData.buff[1] = this.buff2;
                    this.self.sessionData.buff_free[1] = true;
                    break;
                case this.node.getChildByName('buff3'):
                    this.buff3 = parseInt(node.parent.getChildByName('buffNum').getComponent(cc.Label).string.replace(/[^0-9]/ig, "")) / 100;
                    this.self.sessionData.buff[2] = this.buff3;
                    this.self.sessionData.buff_free[2] = true;
                    break;
                case this.node.getChildByName('buff4'):
                    this.buff4 += parseInt(node.parent.getChildByName('buffNum').getComponent(cc.Label).string.replace(/[^0-9]/ig, ""));
                    this.self.sessionData.buff[3] = this.buff4;
                    this.self.sessionData.buff_free[3] = true;
                    break;
            }
        }
    },


    //观看视频获得
    onBtnShareAd(event) {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            this.gc.playAdNew((res) => {
                let node = event.target;
                node.active = false;
                node.parent.getChildByName('gou').active = true;
                //判断buff类型
                switch (node.parent) {
                    case this.node.getChildByName('buff1'):
                        this.buff1 = parseInt(node.parent.getChildByName('buffNum').getComponent(cc.Label).string.replace(/[^0-9]/ig, "")) / 100;
                        this.self.sessionData.buff[0] = this.buff1;
                        this.self.sessionData.buff_free[0] = true;
                        break;
                    case this.node.getChildByName('buff2'):
                        this.buff2 = parseInt(node.parent.getChildByName('buffNum').getComponent(cc.Label).string.replace(/[^0-9]/ig, "")) / 100;
                        this.self.sessionData.buff[1] = this.buff2;
                        this.self.sessionData.buff_free[1] = true;
                        break;
                    case this.node.getChildByName('buff3'):
                        this.buff3 = parseInt(node.parent.getChildByName('buffNum').getComponent(cc.Label).string.replace(/[^0-9]/ig, "")) / 100;
                        this.self.sessionData.buff[2] = this.buff3;
                        this.self.sessionData.buff_free[2] = true;
                        break;
                    case this.node.getChildByName('buff4'):
                        this.buff4 += parseInt(node.parent.getChildByName('buffNum').getComponent(cc.Label).string.replace(/[^0-9]/ig, ""));
                        this.self.sessionData.buff[3] = this.buff4;
                        this.self.sessionData.buff_free[3] = true;
                        break;
                }

                this.isShare = true;
            }, this.sharePoint);
        } else {
            let node = event.target;
            node.active = false;
            node.parent.getChildByName('gou').active = true;
            //判断buff类型
            switch (node.parent) {
                case this.node.getChildByName('buff1'):
                    this.buff1 = parseInt(node.parent.getChildByName('buffNum').getComponent(cc.Label).string.replace(/[^0-9]/ig, "")) / 100;
                    this.self.sessionData.buff[0] = this.buff1;
                    this.self.sessionData.buff_free[0] = true;
                    break;
                case this.node.getChildByName('buff2'):
                    this.buff2 = parseInt(node.parent.getChildByName('buffNum').getComponent(cc.Label).string.replace(/[^0-9]/ig, "")) / 100;
                    this.self.sessionData.buff[1] = this.buff2;
                    this.self.sessionData.buff_free[1] = true;
                    break;
                case this.node.getChildByName('buff3'):
                    this.buff3 = parseInt(node.parent.getChildByName('buffNum').getComponent(cc.Label).string.replace(/[^0-9]/ig, "")) / 100;
                    this.self.sessionData.buff[2] = this.buff3;
                    this.self.sessionData.buff_free[2] = true;
                    break;
                case this.node.getChildByName('buff4'):
                    this.buff4 += parseInt(node.parent.getChildByName('buffNum').getComponent(cc.Label).string.replace(/[^0-9]/ig, ""));
                    this.self.sessionData.buff[3] = this.buff4;
                    this.self.sessionData.buff_free[3] = true;
                    break;
            }
        }
    }
});
