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
const preview = require("preview");
var wxAd = require('wxAd');
var global = require('global');
const UP_TIME = 60; //更新时间
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
        frameIcon: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
    },

    start() {
        let info = adc.getAdBigFrame();
        if (info) {
            this._adInfo = info;
            this._spr = adc.getSpriteFrame(this._adInfo.url);
            if (!this._spr) {
                this.node.active = false;
                return;
            }
            this.createAnimation()
            this.schedule(this.updateAnimation, UP_TIME)
        } else {
            this.node.active = false;
        }
    },
    updateAnimation() {
        let info = adc.getAdBigFrame();
        if (info.url != this._adInfo.url) {
            this._spr = adc.getSpriteFrame(info.url);
            if (!this._spr) {
                return;
            }
            this._adInfo = info;
            this.createAnimation()
        }
    },
    createAnimation() {
        let ani = this.frameIcon.getComponent(cc.Animation);
        if (!this.frameIcon.getComponent(cc.Sprite))
            this.frameIcon.addComponent(cc.Sprite);
        let aniClip = this.createAnimationClip();
        ani.getClips().map((e) => ani.removeClip(e));
        ani.addClip(aniClip);
        ani.play('aniClip');
    },
    createAnimationClip() {
        let list = [];
        let width = 512;
        let height = 290;
        let len = this._adInfo.len || 14;
        let _len = Math.ceil(len / 2);

        for (let i = 0; i < _len; i++) {
            let spr = this._spr.clone();
            spr.setRect(cc.rect(0, i * height, width, height));
            list.push(spr);
            if ((i + 1) * 2 <= len) {
                spr = this._spr.clone();
                spr.setRect(cc.rect(width, i * height, width, height));
                list.push(spr);
            }
        }
        let aniClip = cc.AnimationClip.createWithSpriteFrames(list, this._adInfo.rate || 5);
        aniClip.speed = 1;
        aniClip.wrapMode = cc.WrapMode.Loop;
        aniClip.name = 'aniClip';
        return aniClip;
    },
    clickBtn() {
        const appid = this._adInfo['jmpid'];
        var parm = this._adInfo['parm'];
        parm = parm.indexOf('?') > 0 ? parm : parm + '?';
        parm = parm.indexOf('gender') > 0 ? parm : parm + '&gender=' + global.getGender();
        const share = this._adInfo['share'];
        if (!global.wxBversionLess("2.2.0"))
            //do some thing;
            wx.navigateToMiniProgram({
                appId: appid,
                path: parm,
                success: (res) => { },
                fail: (res) => {
                    if (adc.checkLink(share) && res.errMsg.indexOf(appid) > 0)
                        preview.previewUrlImage(share);
                },
            });
        else if (adc.checkLink(share))
            preview.previewUrlImage(share);
    },
    //update(dt) { },
});
