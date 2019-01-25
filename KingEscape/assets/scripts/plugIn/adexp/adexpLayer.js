// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

const adc = require("adc");
const wxAd = require("wxAd");
const preview = require("preview");
var global = require('global');
const cfg = require("config");
const row = 4;
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
        item: cc.Node,
        scrollView: cc.Node,
        bg: cc.Node,
        list: cc.Node,
        ban: cc.Node,
        btn: cc.Node,
        btn2: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        //this.bg.on("touchstart", this.close, this);
        const dx = this.btn2.parent.convertToWorldSpaceAR(this.btn2.getPosition()).x - this.btn.parent.convertToWorldSpaceAR(this.btn.getPosition()).x;
        this._left = cc.v2(this.list.getPosition().x - dx, this.list.getPosition().y);
        this._right = this.list.getPosition();
    },

    start() {
        this.init();
        this.list.active = false;
        this.ban.active = false;

        this.list.setPosition(this._left);
        const walk = cc.repeatForever(
            cc.sequence(
                cc.delayTime(0.2),
                cc.scaleTo(0.3, 1.3, 1.3),
                cc.scaleTo(0.2, 1.0, 1.0),
                cc.delayTime(0.5),
                //cc.moveTo(1.5, cc.v2(pos.x, pos.y))
            ));
        this.btn.runAction(walk);
        this._clicking = false;
    },
    click() {
        console.log(this._clicking);
        if (this._clicking) return;
        this._clicking = true;
        const right = this.list.active;
        const show = (is) => {
            this.list.active = !!is;
            //this.ban.active = !!is;
            this.btn.active = !is;
        };
        const start = () => !right ? show(true) : null;
        const end = cc.callFunc(() => { this._clicking = false; right ? show(false) : null }, this, 0);
        const walk = cc.sequence(
            //cc.delayTime(0.2),
            cc.moveTo(0.5, right ? this._left : this._right),
            end
        );
        this.list.stopAllActions();
        start();
        this.list.runAction(walk);
    },

    init: function (cb) {
        this._cb = cb;
        this.content = this.scrollView.getComponent('uiloopscrollview');
        const list = adc.getAdexpInfo();
        this._list = list;
        this.initScrollView();
        this.content.setTotalNum(Math.ceil(list.length / row));
        this.content.resetView();
        const size = cfg.officalAccount ? cfg.officalAccount : { width: 640, height: 1136 };
        this.ban.setContentSize(size.width, size.height);
        //console.log("@@@@@@@@@@@moreGameLayer end start@@@@@@@@@@", list);

        this.btn.active = this._list.length > 0;

    },
    initScrollView: function () {
        this.content.registerCreateItemFunc(() => {
            const itemNode = cc.instantiate(this.item);
            itemNode.active = true;
            return itemNode;
        });
        this.content.registerUpdateItemFunc((cell, index) => {
            const offset = index * row;
            const infos = this._list.slice(offset, offset + row);
            var js = cell.getComponent('adexpItem');
            js.show(infos);
        });
    },
    jmp2hezi: function (event) {
        const appid = "wx845a2f34af2f4235";
        var parm = "pages/main/main";
        parm = parm.indexOf('?') > 0 ? parm : parm + '?';
        parm = parm.indexOf('gender') > 0 ? parm : parm + '&gender=' + global.getGender();
        const url = "https://cdn.phonecoolgame.com/wxgame/hezi/back/fangkuaiwan_quanping.jpg";//盒子
        if (appid && !wxAd.wxBversionLess("2.2.0")) {
            //do some things
            wx.navigateToMiniProgram({
                appId: appid,
                path: parm,
                success: (res) => { },
                fail: (res) => {
                }
            });
        } else
            preview.previewUrlImage(url);
    },
    close: function () {
        this.node.active = false;
        if (typeof this._cb == 'function') {
            this._cb();
            this._cb = null
        }
    },

    // update (dt) {},
});
