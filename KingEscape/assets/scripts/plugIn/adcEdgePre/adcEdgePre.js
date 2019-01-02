// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var global = require('global');
const preview = require("preview");
var adc = require('adc');
var config = require('config');
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
        gameBtn: [cc.Node],
        nameNode: [cc.Node],
        mainNode: cc.Node,


    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._adEdges = adc.getAdEdges() ? adc.getAdEdges() : [];
        this.node.active = this._adEdges.length > 0;
        //console.log("adcEdgePre",this._adEdges);
        if(this._adEdges && this._adEdges.length > 0 ){
            this.loadUrl(0);
        }
        
    },
    loadUrl(index){
        let self = this;
        const cb = ()=>{
            if(self.createIcon(self._adEdges[index]['icon'],index) != -1) {//res is not ready yet. listen continue.
                adc.unWait4Res(self._adEdges[index]['icon'],cb);
                if(index + 1 < self._adEdges.length && index + 1 < 3){
                    self.loadUrl(index + 1);  
                }
            }
            
        }
        adc.wait4Res(this._adEdges[index]['icon'], cb);
    },

    loadUrl(index) {
        let self = this;
        const cb = () => {
            if (self.createIcon(self._adEdges[index]['icon'], index) != -1) {//res is not ready yet. listen continue.
                adc.unWait4Res(self._adEdges[index]['icon'], cb);
                if (index + 1 < self._adEdges.length && index + 1 < 4) {
                    self.loadUrl(index + 1);
                }
            }
        }
        adc.wait4Res(this._adEdges[index]['icon'], cb);
    },

    createIcon(url,index){
        let iconSf = adc.getSpriteFrame(url);
        console.log("url",url,index, iconSf);
        if(!iconSf) return -1;
        this.gameBtn[index].active = true;
        // this.gameBtn[index].getComponent(cc.Sprite).spriteFrame = iconSf;
        let gameIcon = cc.find('mask/kuang', this.gameBtn[index]);
        gameIcon.getComponent(cc.Sprite).spriteFrame = iconSf;
        this.nameNode[index].getComponent(cc.Label).string = this._adEdges[index].name;
        let lbol = this.nameNode[index].getComponent(cc.LabelOutline);
        lbol.color = config.adEdges.labOL.color;
        lbol.width = config.adEdges.labOL.width;
        if(index == this._adEdges.length-1 || index == 2 ) this.mainNode.active = true;
    },
    //事件
    goGameBtn(event, cusData) {
        let index = parseInt(cusData);
        if (isNaN(index)) {
            index = 0;
        }
        if (!this._adEdges[index]['jmpid']) return;
        const appid = this._adEdges[index]['jmpid'];
        var parm = this._adEdges[index]['parm'];
        parm = parm.indexOf('?') > 0 ? parm : parm + '?';
        parm = parm.indexOf('gender') > 0 ? parm : parm + '&gender=' + global.getGender();
        const share = this._adEdges[index]['url'];
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
    start() {

    },

    // update (dt) {},
});
