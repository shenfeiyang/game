cc.Class({
    extends: cc.Component,

    properties: {

    },

    showPanel(panel) {
        this.panel = panel;
        // 动画 
        var cbFadeOut = cc.callFunc(this.onFadeOutFinish, this);

        this.actionFadeIn = cc.spawn(cc.fadeTo(0.2, 255), cc.scaleTo(0.2, 1.0));
        this.actionFadeOut = cc.sequence(cc.spawn(cc.fadeTo(0.2, 0), cc.scaleTo(0.2, 1.2)), cbFadeOut);

        // 展现 alert
        this.startFadeIn();
    },

    closePanel(){
        this.startFadeOut();
    },

    // 执行弹进动画
    startFadeIn(){
        this.panel.position = cc.v2(0, 0);
        this.panel.setScale(1.2);
        this.panel.opacity = 0;
        this.panel.runAction(this.actionFadeIn);
    },

    // 执行弹出动画
    startFadeOut() {
        this.panel.runAction(this.actionFadeOut);
    },

    // 弹出动画完成回调
    onFadeOutFinish() {
        this.panel.parent.removeChild(this.panel);
    }
});
