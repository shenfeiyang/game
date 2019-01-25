// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var util = require('util');
var global = require('global')
var config = require("config")

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },

        advImage: cc.Sprite,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {

        var self = this;
        self.imageUrl = global.fullScreenJumpImage;
        self.appid = global.fullScreenJumpId
        self.path = global.fullScreenJumpPath;
        console.log("****OnLoad中跳转appid：", self.appid + "  path:", self.path);
        self.loadRes(self.imageUrl);


        // self.imageUrl = "https://gss2.bdstatic.com/-fo3dSag_xI4khGkpoWK1HF6hhy/baike/w%3D268%3Bg%3D0/sign=26571a0b5ee736d158138b0ea36b28ff/728da9773912b31b2e0899fe8c18367adbb4e185.jpg";

    },

    loadRes: function (imageUrl) {
        let self = this;
        console.log("全屏广告load加载", imageUrl);
        cc.loader.load(imageUrl, function (err, texture) {
            var myImage = new cc.SpriteFrame(texture);
            self.advImage.spriteFrame = myImage;
        }, )


    },


    startGameBtnFun: function () {

        let self = this;
        console.log("****跳转appid：", self.appid + "  path:", self.appid);
        wx.navigateToMiniProgram({
            appId: self.appid,
            path: self.path,
            success: (res) => { },
            fail: (res) => { },
        });

    },

    colseBtnFun: function () {
        this.node.active = false;
    },

    start() {

    },

    // update (dt) {},
});