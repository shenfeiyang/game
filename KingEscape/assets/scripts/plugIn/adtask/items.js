var config = require("config");

cc.Class({
    extends: cc.Component,

    properties: {
        diamond: cc.Node,
        rewardtip: cc.Node,
        num: cc.Node,
    },

    onLoad () {
        // this.wxAddLayer = cc.find("Canvas").getComponent("wxAddLayer");
        // this.adtaskLayer = cc.find("Canvas").getComponent("adtaskLayer");
    },

    setReward(scale , rewardSpr) {
        this.diamond.getComponent(cc.Sprite).spriteFrame = rewardSpr;
        this.diamond.scale = scale;
    },

    setAccomplishCallBack(accomplishCallBack) {
        this.accomplishCallBack = accomplishCallBack;
    },

    setAccomplishedCallBack(accomplishedCallBack) {
        this.accomplishedCallBack = accomplishedCallBack;
    },

    hideReward() {
        this.diamond.active = false;
        this.rewardtip.active = false;
        this.num.active = false;
    },
/**
 * 完成任务
 */
    accomplishTask() {
        this.accomplishCallBack();
    },
 /**
  * 领取奖励
  */   
    accomplishedTask() {
        this.accomplishedCallBack();
    },

    // update (dt) {},
});
