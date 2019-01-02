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
        item:cc.Node,
        scrollView:cc.Node,
        bg:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //this.bg.on("touchstart", this.close, this);
    },

    init:function (cb) {
        this._cb = cb;
        this.content = this.scrollView.getComponent('uiloopscrollview');
        const list = adc.getMoreInfo();
        this._list = list;
        this.initScrollView();
        this.content.setTotalNum(list.length);
        this.content.resetView();
        //console.log("@@@@@@@@@@@moreGameLayer end start@@@@@@@@@@", list);

    },
    initScrollView:function(){
        this.content.registerCreateItemFunc(()=>{
            const itemNode = cc.instantiate(this.item);
            itemNode.active = true;
            return itemNode;
        });
        this.content.registerUpdateItemFunc((cell,index)=>{
            const info = this._list[index];
            var js = cell.getComponent('moreItem');
            js.show(info);
        });
    },
    jmp2hezi:function(event){
        const appid = "wx845a2f34af2f4235";
        var parm = "pages/main/main";
        parm = parm.indexOf('?') > 0 ? parm : parm +'?';
        parm = parm.indexOf('gender') > 0 ? parm : parm + '&gender='+ global.getGender();
        const url = "https://cdn.phonecoolgame.com/wxgame/hezi/back/fangkuaiwan_quanping.jpg";//盒子
        if(appid && !wxAd.wxBversionLess("2.2.0") ) {
            //do some things
            wx.navigateToMiniProgram({
                appId: appid,
                path: parm,
                success:(res)=>{},
            });
        }
        else preview.previewUrlImage(url);
    },
    close: function(){
        this.node.active = false;
        if(typeof this._cb == 'function'){
            this._cb();
            this._cb = null
        }
    },

    // update (dt) {},
});
