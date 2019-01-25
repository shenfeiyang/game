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
        // },s
        collectAwardsPre : cc.Prefab,
        cltsAwards : cc.Prefab,
        ISNEW: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        ///console.log("cltAwards",this.cltsAwards,this.collectAwardsPre)
    },

    start () {
        //收藏有礼
        if( config.gamecenter_link && cc.sys.platform == cc.sys.WECHAT_GAME){
            
            let cltawds = localStorage.getLocalStorage('collect');
            if(cltawds){
                this.node.active = false;
                this.node.destroy();
                return;
            }
            if(this.ISNEW){
                let launcInfo = wx.getLaunchOptionsSync();
                if( parseInt(launcInfo.scene) == 1104 ){
                    this.node.active = false;
                    this.node.destroy();
                    return;   
                }
            }
            this._wxAddLayer = cc.find('Canvas').getComponent('wxAddLayer');
            let blob = this._wxAddLayer.getBlob();
            if(!blob || (  blob && !blob['collect']) ){
                if(!this.ISNEW){
                    this.doAction();
                }
            }else if(blob && blob['collect']){
                this.node.active = false;
                this.node.destroy();
                if(this.ISNEW){
                    //this.node.setPosition();
                }
            }else{
                if(!this.ISNEW){
                    this.doAction();
                }
            }
        }else{
            this.node.active = false;
            this.node.destroy();
        }
    },
    doAction(){
        let pos = this.node.getPosition();
        //cc.moveTo(0.2,cc.v2(pos.x+15,pos.y)), cc.moveTo(0.4,cc.v2(pos.x -15,pos.y)), cc.moveTo(0.2,cc.v2(pos.x,pos.y))
        let time = 1;
        this.node.runAction(cc.repeatForever(cc.sequence( 
            cc.spawn(cc.rotateTo(time,-7),cc.scaleTo(time, 1.02)),
            cc.spawn(cc.rotateTo(time,0),cc.scaleTo(time, 1)),
            cc.spawn(cc.rotateTo(time,7),cc.scaleTo(time, 1.02)),
            cc.spawn(cc.rotateTo(time,0),cc.scaleTo(time, 1))
             )));
    },
    touchBtn(){
        let canvas =  cc.find('Canvas');

        let launcInfo = wx.getLaunchOptionsSync();
        let colletNode;
        if( parseInt(launcInfo.scene) == 1104 ){
            colletNode =  cc.instantiate(this.cltsAwards);
            colletNode.getComponent('cltAwards').setColletIcon(this.node);
        }else{
            colletNode =  cc.instantiate(this.collectAwardsPre);
        }
        //console.log("colletNode",colletNode,this.cltsAwards);
        canvas.addChild(colletNode);
        colletNode.setPosition(0, 0);
        
    }
    // update (dt) {},
});
