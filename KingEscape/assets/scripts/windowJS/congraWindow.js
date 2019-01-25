
cc.Class({
    extends: cc.Component,

    properties: {
        icon: cc.Sprite,
        tip: cc.RichText,

        iconSp: [cc.SpriteFrame]
    },

    init(menu, type, tipStr, tipNum) {
        this.menu = menu;
        //屏幕适配
        this.node.width = this.menu.node.width;
        this.node.height = this.menu.node.height;

        this.windowOpenEffect = this.node.getComponent('windowOpenEffect');
        this.windowOpenEffect.showPanel(this.node);

        switch (type) {
            case 1:
                this.icon.spriteFrame = this.iconSp[0];
                break;
            case 2:
                this.icon.spriteFrame = this.iconSp[1];
                break;
            case 3:
                this.icon.spriteFrame = this.iconSp[2];
                break;
            case 4:
                this.icon.spriteFrame = this.iconSp[3];
                break;
            case 5:
                this.icon.spriteFrame = this.iconSp[4];
                break;
            case 6:
                this.icon.spriteFrame = this.iconSp[5];
                break;
            case 7:
                this.icon.spriteFrame = this.iconSp[6];
                break;
            case 8:
                this.icon.spriteFrame = this.iconSp[7];
                break;
        }

        this.tip.string = '<b><color=#fcd106>' + tipStr + '</c><color=#61ff01>' + tipNum + '</color></b>';
    },

    //关闭恭喜获得窗口
    closeCongraWindow() {
        this.windowOpenEffect.closePanel();

        //按钮音效
        this.menu.audio.onButtonAudio();
    },
});
