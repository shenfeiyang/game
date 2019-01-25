var MSG = require('messageId');
var config = require("config");
var self = null;
var global = require("global");
cc.Class({
    extends: cc.Component,

    properties: {
        rank: cc.Sprite,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        self = this;
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            self.sharedCanvas = wx.getOpenDataContext().canvas;
            self.sharedCanvas.width = 100;
            self.sharedCanvas.height = 200;
            this.openDataContext = wx.getOpenDataContext();
            this.wxAddLayerJs = cc.find("Canvas").getComponent("wxAddLayer");
            this.wxAddLayerJs.setFriendsRankScore(1);
        }

    },

    start() {

    },

    onEnable() {
        this._showFriendsRankImg();
        // this.walk();
    },

    walk() {
        var xoff = 0;
        var yoff = 15;
        const walk = cc.repeatForever(
            cc.sequence(
                cc.delayTime(0.2),
                cc.moveBy(0.1, cc.p(xoff, yoff)),
                cc.moveBy(0.1, cc.p(-xoff, -yoff)),
                cc.moveBy(0.1, cc.p(xoff, yoff)),
                cc.moveBy(0.1, cc.p(-xoff, -yoff)),
                cc.delayTime(1.5),
            ));
        this.node.stopAllActions();
        this.node.runAction(walk);
    },
    getFriendsBeforeBtn() {
        if (self.sharedCanvas.width != 100) {
            self.sharedCanvas.width = 100;
            self.sharedCanvas.height = 200;
        }
        this.openDataContext.postMessage({
            id: MSG.MessageID.ON_MSG_GET_NEXT_PEOPLE,
            openid: config.UID,
        })
    },

    _showFriendsRankImg() {
        self.unschedule(self.showSharedCanvas);
        self.schedule(self.showSharedCanvas, 2);
    },

    showSharedCanvas() {
        if (cc.sys.platform != cc.sys.WECHAT_GAME) {
            return
        }
        if (!!global.showRank) {
            this.rank.spriteFrame = "";
            global.setFriendScore = true;
            return;
        }
        if (!!global.setFriendScore) {
            global.setFriendScore = false;
        } else {
            return;
        }
        this.getFriendsBeforeBtn();
        var texture2D = new cc.Texture2D();
        texture2D.initWithElement(self.sharedCanvas);
        texture2D.handleLoadedTexture();
        var sp = new cc.SpriteFrame(texture2D);
        self.rank.spriteFrame = sp;
    },

    onDisable() {
        self.unschedule(self.showSharedCanvas);
        // this.node.stopAllActions();
    },

    // update (dt) {},
});
