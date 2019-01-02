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
        nameLabel: cc.Label,
        descLabel:cc.Label,
        icon:cc.Sprite,
        //defaultSpriteFrame:cc.SpriteFrame,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    show: function(info){
        this.nameLabel.string = info.name;
        this.descLabel.string = info.desc;
        //load icon from remote here...
        //const spriteFrame = adc.getSpriteFrame(info.icon)
        //this.icon.spriteFrame = spriteFrame ? spriteFrame :this.icon.spriteFrame;
        const cb = ()=>{
            const spriteFrame = adc.getSpriteFrame(info.icon)
            this.icon.spriteFrame = spriteFrame;// ? spriteFrame :this.icon.spriteFrame;
            this.unWait4Res();
        }
        this.unWait4Res();
        adc.wait4Res(info.icon, cb);
        this.clearWait = ()=>{
            adc.unWait4Res(info.icon, cb)
        }

        this._data = info;
    },
    unWait4Res:function(){
        if(this.clearWait) this.clearWait();
        this.clearWait = null;
    },
    onStartGame:function(event){
        const data= this._data;
        const appid = data ? data['jmpid'] : undefined;
        var parm = data ? data['parm'] : undefined;
        parm = parm ? parm.indexOf('?') > 0 ? parm : parm +'?' : undefined;
        parm = parm ? parm.indexOf('gender') > 0 ? parm : parm + '&gender='+ global.getGender() : undefined ;
        const url = data ? data['url'] : undefined;
        if(appid && !wxAd.wxBversionLess("2.2.0")) 
            //do some thing;
            wx.navigateToMiniProgram({
                appId: appid,
                path: parm,
                success:(res)=>{},
            });
        else if(adc.checkLink(url)) preview.previewUrlImage(url);
    },
    onDetail: function(event){
        const data = this._data;
        const url = data ? data.url: null;
        if (adc.checkLink(url))  preview.previewUrlImage(url);
    },
    onDestroy(){
        this.unWait4Res();
    },

    start () {

    },

    // update (dt) {},
});
