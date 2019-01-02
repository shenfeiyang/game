// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

const config = require('config');
const global = require('global')
cc.Class({
    extends: cc.Component,

    properties: {
        main: cc.Node,
        show: cc.Node,
        showText: cc.Label,
        showDifShare: cc.Node,
        showDifText: cc.Label,
        showAwards: cc.Node,
        showAwardsText: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

    },

    start() {
        //this.showDifText.string = "红包奖励每天每个群只能分享" + config.groupTimes + "次，换个群分享试试"
        this.showText.string = "随机抽取100元现金，30元话费或" + config.freeRedPocket.getStr() + ",每天限量3000元现金，先到先得。";
        this.showAwardsText.string = config.freeRedPocket.getStr();
    },
    setWxAddLayer(js, callbacks) {
        this._wxAddLayer = js;
        this._callback = callbacks;
    },
    showActive() {
        let self = this;
        if (this.node.active)
            this.node.active = false;
        this.node.scale = 0.01;
        self.node.active = true;
        this.node.runAction(cc.sequence(cc.callFunc(() => {
            self.node.active = true;
        }), cc.scaleTo(0.2, 1)))
    },
    hideActive() {
        let self = this;
        if (!this.node.active)
            return;
        this.main.runAction(cc.sequence(cc.scaleTo(0.2, 0.01), cc.callFunc(() => {
            self.main.scale = 1;
            if (self.showDifShare.active) self.showDifShare.active = false;
            if (self.showAwards.active) self.showAwards.active = false;
            if (!self.show.active) self.show.active = true;
            self.node.active = false;
        })))
    },
    shareBtn() {
        let self = this;
        if (this._wxAddLayer)
            this._wxAddLayer.shareBtnWithGroupAndTimes(0, (res) => {
                if (!res) {
                    wx.showModal({
                        title: ' 提示',
                        content: "请分享到群试试哦",
                        showCancel: false,
                        success: function (res) {
                        }
                    });
                    return;
                } else if (res == 2 && !!global.getUserDataInfoByName('difGroups')) {
                    self.showDifShare.active = true;
                    return;
                }
                self.show.active = false;
                self.showAwards.active = true;
            })
    },
    getAwardsBtn() {
        this.hideActive();
        if (this._callback && typeof this._callback == 'function') this._callback();
    },


    // update (dt) {},
});
