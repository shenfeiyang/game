cc.Class({
    extends: cc.Component,

    properties: {
        money: cc.Label,
        doubleMoney: cc.Label,
        totalMoney: cc.Label,

        btnDouble: cc.Node,
        btnDoubleSp: [cc.SpriteFrame]
    },

    //打开击败奖励界面
    openAwardWindow(gc, game) {
        this.game = game;
        this.gc = gc;
        //屏幕适配
        this.node.width = this.game.node.width;
        this.node.height = this.game.node.height;

        this.money.string = ':' + this.game.killNum + '';
        this.doubleMoney.string = ':' + this.game.killNum * 2 + '';
        this.totalMoney.string = this.game.totalMoney + '';

        if(!this.game.goodGame.active){
            this.game.goodGame.active = true;
        }

        //双倍领取呼吸动画
        this.btnHuxi();
        this.unschedule(this.btnHuxi);
        this.schedule(this.btnHuxi, 4);

        if(cc.sys.localStorage.getItem('awardAdChange')){
            this.btnDouble.getComponent(cc.Sprite).spriteFrame = this.btnDoubleSp[1];
        }else{
            this.btnDouble.getComponent(cc.Sprite).spriteFrame = this.btnDoubleSp[0];
        }

        
    },

    //双倍领取按钮呼吸动画
    btnHuxi() {
        let action1 = cc.scaleTo(2, 1.1);
        let action2 = cc.scaleTo(2, 1);
        this.btnDouble.runAction(cc.sequence(action1, action2));
    },

    //关闭击败奖励界面(直接领取)
    closeAwardWindow() {
        this.game.totalMoney += this.game.killNum;
        this.gc.addGold(this.game.killNum);
        this.node.parent.removeChild(this.node);
        this.game.openOverWindow();

        //按钮音效
        this.game.audio.onButtonAudio();
    },

    //双倍领取
    doubleDraw() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            if(cc.sys.localStorage.getItem('awardAdChange')){
                this.gc.playAdNew((res) => {
                    this.game.totalMoney += this.game.killNum * 2;
                    this.gc.addGold(this.game.killNum * 2);
                    this.node.parent.removeChild(this.node);
                    this.game.openOverWindow();

                    cc.sys.localStorage.setItem('awardAdChange', false);
                }, 109); 
            }else{
                this.gc.publicSharingWithSvrcfg((res) => {
                    this.game.totalMoney += this.game.killNum * 2;
                    this.gc.addGold(this.game.killNum * 2);
                    this.node.parent.removeChild(this.node);
                    this.game.openOverWindow();

                    cc.sys.localStorage.setItem('awardAdChange', true);
                }, 109); 
            }
        } else {
            this.game.totalMoney += this.game.killNum * 2;
            this.gc.addGold(this.game.killNum * 2);
            this.node.parent.removeChild(this.node);
            this.game.openOverWindow();
        }

        //按钮音效
        this.game.audio.onButtonAudio();
    },

});
