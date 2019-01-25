
cc.Class({
    extends: cc.Component,

    properties: {
        icon: cc.Sprite,
        tip1: cc.RichText,
        tip2: cc.RichText,

        iconSp: [cc.SpriteFrame]
    },

    init(game) {
        this.game = game;
        this.gc = game.gc;
        this.game.boxIsOpen = true;
        //屏幕适配
        this.node.width = this.game.node.width;
        this.node.height = this.game.node.height;

        //this.windowOpenEffect = this.node.getComponent('windowOpenEffect');
        //this.windowOpenEffect.showPanel(this.node);

        this.mostWeight = 0;
        for (let i = 0; i < this.game.treasure.getLength(); i++) {
            this.mostWeight += parseInt(this.game.treasure.indexOf(i).weight);
        }

        this.finalNum = 0;
        let allWeight = 0;
        let rand = Math.ceil(Math.random() * this.mostWeight);
        for (let i = 0; i < this.game.treasure.getLength(); i++) {
            if (rand > allWeight && rand <= allWeight + parseInt(this.game.treasure.indexOf(i).weight)) {
                this.finalNum = i;
            }
            allWeight += parseInt(this.game.treasure.indexOf(i).weight);
        }

        this.icon.spriteFrame = this.iconSp[this.finalNum];
        let data = this.game.treasure.indexOf(this.finalNum).name.split('+');
        this.tip1.string = '<b><color=#fcd106>' + data[0] + '</c><color=#61ff01>+' + data[1] + '</color></b>';
        this.tip2.string = '<b><color=#B8B8DF>额外获得：</c><color=#ECDFA1>经验+' + this.game.boxOtherGift + '</color></b>';

    },

    //分享领取
    btnShare() {
        let self = this;
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            this.gc.publicSharingWithSvrcfg((res) => {
                self.awardType();
                //玩家增加经验
                this.game.stage.player.expAddTotal += this.game.boxOtherGift;
            }, 112);
        } else {
            self.awardType();
            //玩家增加经验
            this.game.stage.player.expAddTotal += this.game.boxOtherGift;
        }

        this.closeCongraWindow();
    },

    //奖励类型
    awardType() {
        let type = this.game.treasure.indexOf(this.finalNum).type;
        let awardNum = parseFloat(this.game.treasure.indexOf(this.finalNum).num);
        let self = this;
        switch (type) {
            case 1:
                //加复活币
                this.game.reviveCoinNum += parseInt(awardNum);
                this.gc.setBlobMap({
                    reviveCoin: self.game.reviveCoinNum
                });
                break;
            case 2:
                //加金币
                this.gc.addGold(parseInt(awardNum));
                break;
            case 3:
                //加护盾
                this.game.shieldNum += parseInt(awardNum);
                this.gc.setBlobMap({
                    shieldNum: self.game.shieldNum
                });
                this.game.initSkill();
                break;
            case 4:
                //加飞镖
                this.game.dartNum += parseInt(awardNum);
                this.gc.setBlobMap({
                    dartNum: self.game.dartNum
                });
                this.game.initSkill();
                break;
            case 5:
                this.game.boxBuff1 = awardNum;
                this.game.limitTimeBuff(1);
                break;
            case 6:
                this.game.boxBuff2 = awardNum;
                this.game.limitTimeBuff(2);
                break;
            case 7:
                this.game.boxBuff3 = awardNum;
                this.game.limitTimeBuff(3);
                break;
            case 8:
                this.game.stage.player.expAddTotal += awardNum;
                break;
            case 9:
                this.game.stage.player.expAddTotal += awardNum;
                break;
        }
    },

    //关闭恭喜获得窗口
    closeCongraWindow() {
        //this.windowOpenEffect.closePanel();
        this.node.parent.removeChild(this.node);
        this.game.boxIsOpen = false;
        this.game.stage.boxSchedule();

        this.scheduleOnce(() => {
            this.game.stage.player.dunMax.active = false;
        }, 2);

        //按钮音效
        this.game.audio.onButtonAudio();
    },
});
