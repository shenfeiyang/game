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
        },
        scrollView: cc.Node,
        myRankNum: cc.Label,
        rankMoreItem: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._isGroup = false;
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            this.sharedCanvas = wx.getOpenDataContext().canvas;
            this.sharedCanvas.width = 620;
            this.sharedCanvas.height = 650;
        }
        this._content = this.scrollView.getComponent('uiloopscrollview');
    },
    initLoopScrollView(_scroll) {
        let self = this;
        _scroll.registerCreateItemFunc(function () {
            var itemNode = cc.instantiate(self.rankMoreItem);
            return itemNode;
        });
        _scroll.registerUpdateItemFunc(function (cell, index) {

            let js = cell.getComponent('rankMoreItem');
            console.log(js);
            js.init(self._customData[index], index, self);
        });

    },
    resetLoopScrollView(_scroll, num) {
        console.log(num);
        _scroll.setTotalNum(num);
        _scroll.resetView();
    },

    start() {
        //this.initRank();
        // this.initLoopScrollView(this._content);
        // this.resetLoopScrollView(this._content,0);
    },
    qunRankBtn() {
        let self = this;
        var parent = this.node.parent;
        var js = parent.getComponent('wxAddLayer');
        if (!!!js) {
            return;
        }
        js.shareBtnWithGroup(null, function () {
            self.node.active = false;
            js.getMoreFirendsRankQun();
        });

    },
    initRank(isGroup, customData, callbacks) {
        this.callbacks = callbacks;
        this._customData = customData;
        this._showFriendsRankImg();
        this._wxAddLayer = this.node.parent.getComponent('wxAddLayer');

        if (isGroup) {
            this.titleText.string = "群排行榜";
            // this.groupNode.active = false;
        } else {
            this.titleText.string = "好友排行榜";
            this._isGroup = 0;
            //this.groupNode.active = true;
        }
        this._select = 0;
        this.updateText();
        console.log(this._customData);
        this.initLoopScrollView(this._content);
        this.resetLoopScrollView(this._content, this._customData.length);
    },

    updateText() {
        var score = 0;
        if (this._customData[this._select].key === 'score') {
            score = this._wxAddLayer.getScore()
        } else {
            score = this._wxAddLayer.getScorePlus(this._customData[this._select].key)
        }

        this.myRank.string = this._customData[this._select].rankText;
        this.myRankNum.string = score;
    },
    updateOpenData() {
        console.log("select", this._select)
        let openDataContext = wx.getOpenDataContext();
        openDataContext.postMessage({
            id: this.isGroup ? MSG.MessageID.ON_MSG_GET_MORE_QUN_RANK_OPEN : MSG.MessageID.ON_MSG_GET_MORE_RANK_OPEN,
            key: this._customData[this._select].key,
        })
        this.updataCellInfo(true);
        this.updateText();
        this._showFriendsRankImg();

    },
    //更新 cell 信息
    updataCellInfo(flag = false) {
        let item = this._content.getItemByIndex(this._select);
        item.getComponent('rankMoreItem').setSelet(flag);

    },
    getFriendsNextBtn() {
        let openDataContext = wx.getOpenDataContext()
        openDataContext.postMessage({
            id: MSG.MessageID.ON_MSG_GET_MORE_RANK_NEXT,
        })
        this._showFriendsRankImg();
        // this.node.runAction(cc.sequence(cc.delayTime(0.1),cc.callFunc(function(){
        // })))
    },
    getFriendsBeforeBtn() {
        let openDataContext = wx.getOpenDataContext()
        openDataContext.postMessage({
            id: MSG.MessageID.ON_MSG_GET_MORE_RANK_BEFORE,
        })
        this._showFriendsRankImg();
        // this.node.runAction(cc.sequence(cc.delayTime(0.1),cc.callFunc(function(){
        // })))
    },
    getFriendsCloseBtn() {
        let openDataContext = wx.getOpenDataContext()
        openDataContext.postMessage({
            id: MSG.MessageID.ON_MSG_GET_FRIEND_RANK_CLOSE,
        })
    },

    showSharedCanvas() {
        if (!this.todraw) {
            this.unschedule(this.showSharedCanvas);
            // return;
        }

        console.log('get one sharedcanvas ...');

        var texture2D = new cc.Texture2D();
        texture2D.initWithElement(this.sharedCanvas);
        texture2D.handleLoadedTexture();
        var sp = new cc.SpriteFrame(texture2D);
        this.rank.spriteFrame = sp;
    },

    _showFriendsRankImg() {
        this.todraw = true;
        this.unschedule(this.showSharedCanvas);
        this.schedule(this.showSharedCanvas, 0.2, 5);

        // let openDataContext = wx.getOpenDataContext();
        // let sharedCanvas = openDataContext.canvas;

        // var main = function () {
        //     var texture2D = new cc.Texture2D();
        //     texture2D.initWithElement(sharedCanvas);
        //     texture2D.handleLoadedTexture();
        //     var sp = new cc.SpriteFrame(texture2D);
        //     this.rank.spriteFrame = sp;
        // };

        // setTimeout(main, 500);

        // this.rank.spriteFrame.setTexture(texture2D);
        //let canvas = wx.createCanvas()
        // let canvas = cc.game.canvas;
        // let context = canvas.getContext('2d')
        // context.drawImage(sharedCanvas, 0, 0);
    },
    closeBtn() {
        global.showRank = false;
        this.node.active = false;
        this.todraw = false;
        if (this.callbacks) {
            this.callbacks();
        }
    },


    onEnable() {
        var self = this;
        global.showRank = true;
        if (cc.sys.platform == cc.sys.WECHAT_GAME && self.sharedCanvas.width != 620) {
            self.sharedCanvas.width = 620;
            self.sharedCanvas.height = 650;
        }
    },
    // update (dt) {},
});