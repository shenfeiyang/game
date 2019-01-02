// import { EFAULT } from "constants";
// import { fail } from "assert";
// import { connect } from "net";

// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var self = null;
var preview = require('preview');
var config = require('config');

cc.Class({
    extends: cc.Component,
    properties: {
        leftSpr: cc.SpriteFrame,
        rightSpr: cc.SpriteFrame,
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad() { },

    start() {
        self = this;
        var btn = self.getComponent(cc.Button);
        //btn.node.on("click", preview.previewImage, self);
        btn.node.on("click", () => {
            const wxAddLayer = cc.find("Canvas").getComponent("wxAddLayer");
            wxAddLayer.moreGame();
        }, self);
        var spr = self.getComponent(cc.Sprite);
        if (config.officalAccount.direction == "left") {
            console.log("left");
            spr.spriteFrame = self.leftSpr;
        } else {
            spr.spriteFrame = self.rightSpr;
            console.log("other");
        }
    },



    // update (dt) {},
});
