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
const preview = require("preview");
var wxAd = require('wxAd');
var global = require('global');
const xoff = 0;
const yoff = 15;
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
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.reloadRemoteAd();
        this.pos = this.node.getPosition();
    },
    walk() {
        //if(this.walk) return;
        const pos = this.pos;
        const walk = cc.repeatForever(
            cc.sequence(
                cc.delayTime(0.2),
                cc.moveBy(0.1, cc.v2(xoff, yoff)),
                cc.moveBy(0.1, cc.v2(-xoff, -yoff)),
                cc.moveBy(0.1, cc.v2(xoff, yoff)),
                cc.moveBy(0.1, cc.v2(-xoff, -yoff)),
                cc.delayTime(1.5),
                //cc.moveTo(1.5, cc.v2(pos.x, pos.y))
            ));
        this.node.stopAllActions();
        this.node.runAction(walk);
        //this.walk = true;
    },
    createRemoteAd(update) {
        const adFrame = adc.getAdFrame(update);
        if (!adFrame.url) return -1;
        //else if(adframe.url == "") return;
        if (cc.sys.platform != cc.sys.WECHAT_GAME) return;
        //const node=cc.find("Canvas/remoteAdAnimationBtn");
        const node = this.node;
        let self = this;
        if (node) {
            if (!node.getComponent(cc.Sprite)) node.addComponent(cc.Sprite);
            //if(!node.getComponent(cc.Button))node.addComponent(cc.Button);
            if (!node.getComponent(cc.Animation)) node.addComponent(cc.Animation);
            const sprite = node.getComponent(cc.Sprite);
            /*
            const url = "http://cdn.phonecoolgame.com/wxgame/tuiguang/hezi_lxwz.jpg";
            const rects = [
                {x :  0, y : 0, w : 100, h : 100, },
                {x : 50, y : 0, w : 100, h : 100, },
                {x :100, y : 0, w : 100, h : 100, },
                {x :150, y : 0, w : 100, h : 100, },
                {x :200, y : 0, w : 100, h : 100, },
                {x :250, y : 0, w : 100, h : 100, },
            ];
            const dt = 10;
            const name = url;
            const appid = "wxbfc3d4d1dce6f301";
            */
            const url = adFrame.url;
            const size = adFrame.size;
            const dt = adFrame.dt;
            const len = adFrame.len;
            const appid = adFrame.id;
            const name = url;
            /*
            node.on('click', ()=>{
                self.remoteAdBtn();
            }, self);
            */
            this._adFrame = adFrame;
            const cb = () => {
                const animationClip = adc.getRemoteClip(url, size, dt, len);
                //console.log("animationClip is <<<<<<<<<<<<<<<<<", animationClip);
                const setClipWrapMode = (clip, mode) => {
                    clip.wrapMode = mode;
                }
                const setClipName = (clip, name) => (clip.name = name);
                setClipWrapMode(animationClip, cc.WrapMode.Loop);
                setClipName(animationClip, name);
                const ani = node.getComponent(cc.Animation);
                //remove all clips,
                ani.getClips().map((e) => ani.removeClip(e));
                ani.addClip(animationClip);
                ani.play(name);
                this.walk();
                //console.log("Wait<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
                this.refreshRemoteAd();
                //self.waitDel = null;
            }
            if (typeof this.waitDel == "function") this.waitDel();
            this.waitDel = () => adc.unWait4Res(url, cb);
            adc.wait4Res(url, cb);
        }
    },
    /*
    *   {@reject(res) failed}
    *   {@reject(res) success }
    * 
    */
    remoteAdBtn: function (event, reject, result, path) {
        if (this._adFrame) {
            const appid = this._adFrame['jmpid'];
            var parm = this._adFrame['parm'];
            parm = parm.indexOf('?') > 0 ? parm : parm + '?';
            parm = parm.indexOf('gender') > 0 ? parm : parm + '&gender=' + global.getGender();
            const share = this._adFrame['url'];
            if (!wxAd.wxBversionLess("2.2.0"))
                //do some thing;
                wx.navigateToMiniProgram({
                    appId: appid,
                    path: parm,
                    success: result,
                    fail: (res) => {
                        if (adc.checkLink(share) && res.errMsg.indexOf(appid) > 0)
                            preview.previewUrlImage(share);
                    },
                });
            else if (adc.checkLink(share))
                preview.previewUrlImage(share);
        }
        this.reloadRemoteAd();
    },

    /*
     *{@force : true | false 是否重新拉取}
     *  加载过程可能会有延迟
     */
    reloadRemoteAd(force) {
        this._show = true;
        const cb = () => {
            if (this.createRemoteAd(force) != -1) {//res is not ready yet. listen continue.
                adc.unWait4ResAny(cb);
                if (typeof this.clearRemoteAdCb == "function") this.clearRemoteAdCb();
            }
        }
        if (typeof this.clearRemoteAdCb == "function") this.clearRemoteAdCb();
        this.clearRemoteAdCb = () => adc.unWait4ResAny(cb);

        adc.wait4ResAny(cb);
    },
    showRemoteAd() {
        this._show = true;
        this.refreshRemoteAd();
    },
    hideRemoteAd() {
        this._show = false;
        this.refreshRemoteAd();
    },
    refreshRemoteAd() {
        const old = this.node.active;
        this.node.active = this._show;
        if (!old && this._show) {
            let clips = this.node.getComponent(cc.Animation).getClips();
            this.node.getComponent(cc.Animation).play(clips[0].name);
        }
    },
    onDisable() {
        const ani = this.node.getComponent(cc.Animation)
        if (ani) ani.stop();
    },
    onDestroy() {
        this.unschedule(this.callback);
        if (this.waitDel) {
            this.waitDel();
            this.waitDel = null;
        }
        if (typeof this.clearRemoteAdCb == "function") {
            this.clearRemoteAdCb();
            this.clearRemoteAdCb = null;
        }
    },

    start() {

    },

    // update (dt) {},
});
