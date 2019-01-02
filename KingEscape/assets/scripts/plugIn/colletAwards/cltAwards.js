// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var config = require('config');
var localStorage = require('localStorage');
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
        awardsText: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.awardsText.getComponent(cc.Label).string = config.colletAwards;
    },

    start () {

    },
    sureBtn(){
        this._wxAddLayer = cc.find('Canvas').getComponent('wxAddLayer');
        if(this._wxAddLayer['_assistCallBack'] && typeof this._wxAddLayer._assistCallBack == 'function') {
            this._wxAddLayer.addGold(config.colletAwards);
            this._wxAddLayer.addDMLDText('恭喜获得金币X'+ config.colletAwards);
            this._wxAddLayer._assistCallBack();
            let blob = this._wxAddLayer.getBlob();
            localStorage.setLocalStorage('collect',1);
            if(!blob){
                blob = {};
            }
            blob['collect'] = 1;
            this._wxAddLayer.setBlob(blob);
            this.node.active = false;
            this._iconNode.active = false;
            return;
        }
    },
    setColletIcon(iconNode){
        this._iconNode = iconNode;
    },
    // update (dt) {},
});
