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
const preview = require('preview');
const wxAd = require("wxAd");
var global = require('global');
const qqplay = require("qqPlay");

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
        icons: [cc.Node],
        sprites: [cc.Sprite],
        names: [cc.Label],
        //defaultSpriteFrame:cc.SpriteFrame,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.clearWait = [];
    },
    show: function (infos) {
        /*
        const cb = ()=>{
            const spriteFrame = adc.getSpriteFrame(info.icon)
            this.icon.spriteFrame = spriteFrame;// ? spriteFrame :this.icon.spriteFrame;
            this.unWait4Res();
        }
        this.unWait4Res();
        adc.wait4Res(info.icon, cb);
        this.clearWait = ()=>{
            adc.unWait4Res(info.icon, cb)
        }*/
        this.unWait4Res();
        this.icons.map((icon, idx) => {
            const info = infos[idx];
            if (!info) {
                icon.active = false;
                return;
            }
            this.names[idx].string = info.name;
            const cb = () => {
                const spriteFrame = adc.getSpriteFrame(info.icon)
                this.sprites[idx].spriteFrame = spriteFrame;// ? spriteFrame :this.icon.spriteFrame;
                adc.unWait4Res(info.icon, cb);
                //console.log("%%%%%%%%%%%%%%%%%%%%%%%", info.icon);
            }
            adc.wait4Res(info.icon, cb);
            this.clearWait[idx] = () => { adc.unWait4Res(info.icon, cb); this.clearWait[idx] = null; }
        })
        this._data = infos;
    },
    unWait4Res: function () {
        this.clearWait.map((unwait) => typeof unwait == "function" ? unwait() : null)
        this.clearWait = [];
    },
    onStartGame: function (event, idx) {
        const data = this._data[idx];
        const appid = data ? data['jmpid'] : undefined;
        var parm = data ? data['parm'] : undefined;
        parm = parm ? parm.indexOf('?') > 0 ? parm : parm + '?' : undefined;
        parm = parm ? parm.indexOf('gender') > 0 ? parm : parm + '&gender=' + global.getGender() : undefined;
        const url = data ? data['share'] : undefined;
        console.log("click index of adexp", data);
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            if (appid && !wxAd.wxBversionLess("2.2.0"))
                //do some thing;
                wx.navigateToMiniProgram({
                    appId: appid,
                    path: parm,
                    success: (res) => { },
                    fail: (res) => {
                        if (adc.checkLink(url) && res.errMsg.indexOf(appid) > 0) preview.previewUrlImage(url);
                    }
                });
            else if (adc.checkLink(url)) preview.previewUrlImage(url);
        } else if (appid && cc.sys.platform == cc.sys.QQ_PLAY) {
            qqplay.skipGame(Number(appid), parm);
            console.log(appid, parm);
        }
    },
    onDetail: function (event, idx) {
        const data = this._data[idx];
        const url = data ? data.url : null;
        if (adc.checkLink(url)) preview.previewUrlImage(url);
    },
    onDestroy() {
        this.unWait4Res();
    },

    start() {

    },

    // update (dt) {},
});
