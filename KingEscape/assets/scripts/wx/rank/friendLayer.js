//import { callbackify } from 'util';

// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var MSG = require('messageId');
var global = require('global');
var config = require('config');
var userOperate = require('userOperate');
var self = null;
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
        groupNode: {
            default: null,
            type: cc.Node,
        },
        rank: {
            default: null,
            type: cc.Sprite,
        },
        myRank: {
            default: null,
            type: cc.Label,
        },
        titleText: {
            default: null,
            type: cc.Label,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        self = this;
        self._isGroup = false;
        self._userOperate = new userOperate();
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            self.sharedCanvas = wx.getOpenDataContext().canvas;
            self.sharedCanvas.width = 620;
            self.sharedCanvas.height = 650;
        }
    },

    start() {
        //self.initRank();
    },
    qunRankBtn() {

        var parent = self.node.parent;
        var js = parent.getComponent('wxAddLayer');
        if (!!!js) {
            return;
        }
        // if(config.shareTicket){ 
        //     self.node.active = false;
        //     js.getOpenDataQunRankBtn();
        // }else{
        //     js.shareBtn();          
        // }
        js.shareBtnWithGroup(null, function () {
            self.node.active = false;
            js.getOpenDataQunRankBtn();
        });

    },
    initRank(isGroup, callbacks) {
        self.callbacks = callbacks;
        self._showFriendsRankImg();
        if (isGroup) {
            self.titleText.string = "群排行榜";
            self._isGroup = true;
            self.groupNode.active = false;
        } else {
            self.titleText.string = "好友排行榜";
            self._isGroup = false;
            //self.groupNode.active = true;
        }
        var score = 0
        score = self._userOperate.getScore();
        self.myRank.string = "我的分数：" + score;
    },
    getFriendsNextBtn() {
        let openDataContext = wx.getOpenDataContext()
        openDataContext.postMessage({
            id: self._isGroup ? MSG.MessageID.ON_MSG_GET_GROUP_RANK_NEXT : MSG.MessageID.ON_MSG_GET_FRIEND_RANK_NEXT,
        })
        self._showFriendsRankImg();
        // self.node.runAction(cc.sequence(cc.delayTime(0.1),cc.callFunc(function(){
        // })))
    },
    getFriendsBeforeBtn() {
        let openDataContext = wx.getOpenDataContext()
        openDataContext.postMessage({
            id: self._isGroup ? MSG.MessageID.ON_MSG_GET_GROUP_RANK_BEFORE : MSG.MessageID.ON_MSG_GET_FRIEND_RANK_BEFORE,
        })
        self._showFriendsRankImg();
        // self.node.runAction(cc.sequence(cc.delayTime(0.1),cc.callFunc(function(){
        // })))

        console.log("ppp", openDataContext);
    },
    getFriendsCloseBtn() {
        let openDataContext = wx.getOpenDataContext()
        openDataContext.postMessage({
            id: MSG.MessageID.ON_MSG_GET_FRIEND_RANK_CLOSE,
        })
    },

    showSharedCanvas() {
        if (!self.todraw) {
            self.unschedule(self.showSharedCanvas);
            // return;
        }

        console.log('get one sharedcanvas ...');

        var texture2D = new cc.Texture2D();
        texture2D.initWithElement(self.sharedCanvas);
        texture2D.handleLoadedTexture();
        var sp = new cc.SpriteFrame(texture2D);
        self.rank.spriteFrame = sp;
    },

    _showFriendsRankImg() {
        self.todraw = true;
        self.unschedule(self.showSharedCanvas);
        self.schedule(self.showSharedCanvas, 0.2, 5);

        // let openDataContext = wx.getOpenDataContext();
        // let sharedCanvas = openDataContext.canvas;

        // var main = function () {
        //     var texture2D = new cc.Texture2D();
        //     texture2D.initWithElement(sharedCanvas);
        //     texture2D.handleLoadedTexture();
        //     var sp = new cc.SpriteFrame(texture2D);
        //     self.rank.spriteFrame = sp;
        // };

        // setTimeout(main, 500);

        // self.rank.spriteFrame.setTexture(texture2D);
        //let canvas = wx.createCanvas()
        // let canvas = cc.game.canvas;
        // let context = canvas.getContext('2d')
        // context.drawImage(sharedCanvas, 0, 0);
    },
    closeBtn() {
        global.showRank = false;
        self.node.active = false;
        self.todraw = false;
        if (self.callbacks) {
            self.callbacks();
        }
    },

    onEnable() {
        global.showRank = true;
        if (cc.sys.platform == cc.sys.WECHAT_GAME && self.sharedCanvas.width != 620) {
            self.sharedCanvas.width = 620;
            self.sharedCanvas.height = 650;
        }
    },
    // update (dt) {},
});
