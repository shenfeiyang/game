// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
const adc = require("adc");
const config = require("config");
var global = require('global');
let adTime = global.getUserDataInfoByName('adTime') ? global.getUserDataInfoByName('adTime') / 1000 : 60;     //loop 周期
let fail = 1;
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
        banner: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        cc.game.addPersistRootNode(this.node);
        this._banner = cc.instantiate(this.banner);
        this.node.addChild(this._banner);
        this._banner.setPosition(0, 0);
    },

    start() {
        this.initList();
    },
    initList() {
        let list = adc.getFarvorPlayInfo();
        console.log("BannerRootNode", list);
        if (list && list.length > 0) {
            console.log('BannerRootNode', this._banner)
            this._bannerList = list;
            this._banner.getComponent('banner_1').init(list);
            this._banner.active = true;
            this.schedule(this.mainTime, adTime);
        } else {
            let self = this;
            if (fail)
                this.scheduleOnce(() => { fail = 0; self.initList() }, 3);
        }
    },
    onEnable() {
        let canvas = cc.find('Canvas');
        let sceneSize = cc.director.getWinSize();
        let frameSize = cc.view.getFrameSize();
        let res = wx.getSystemInfoSync()
        let myWidth = res.screenWidth;
        let myHeight = res.screenHeight;
        let top = 105;
        if (!config.bannerWidth || frameSize.height / frameSize.width >= 1.78) {
            top += 30;
        }
        let dh = sceneSize.height / myHeight * top;
        this.node.setPosition(sceneSize.width / 2,
            (this._banner.getContentSize().height / 2 * config.bannerScale + this._banner.getContentSize().height / 2 * (1 - config.bannerScale)) + dh);
    },

    mainTime() {
        this._banner.getComponent('banner_1').init(this._bannerList);
    }
    // update (dt) {},
});
