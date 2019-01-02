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
        showTip:cc.Node,
        awardsText: cc.Node,
        finger: cc.Node,


    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.awardsText.getComponent(cc.Label).string = config.colletAwards;
        this.finger.runAction(cc.repeatForever(cc.blink(2.4,3)));
    },

    start () {

    },
    closeBtn(){
        this.node.active = false;
    },
    lingquBtn(){
        this.showTip.active = true;
    },
    sureBtn(){
        this.showTip.active = false;
    },
    // update (dt) {},
});
