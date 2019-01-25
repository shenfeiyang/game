var MSG = require('messageId');
var global = require('global');
var config = require('config');
var userOperate = require('userOperate');
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
        myRankNum: cc.Label,
        myNextRank: cc.Label,
        myNextRankNum: cc.Label,
        titleText: {
            default: null,
            type: cc.Label,
        },
        titleRankText1: cc.Label,
        titleRankText2: cc.Label,

        qqPlatform: cc.Node,
        wxPlatform: cc.Node,
        //玩一玩
        scroll_1: cc.Node,
        scroll_2: cc.Node,

        listItem: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._isGroup = 0;
        this._userOperate = new userOperate();
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            this.sharedCanvas = wx.getOpenDataContext().canvas;
            this.sharedCanvas.width = 1100;
            this.sharedCanvas.height = 400;
        }

        this._content_1 = this.scroll_1.getComponent('uiloopscrollview');
        this._content_2 = this.scroll_2.getComponent('uiloopscrollview');
    },

    start() {
        //this.initRank();
    },
    qunRankBtn() {

        var parent = this.node.parent;
        var js = parent.getComponent('wxAddLayer');
        if (!!!js) {
            return;
        }
        // if(config.shareTicket){ 
        //     this.node.active = false;
        //     js.getOpenDataQunRankBtn();
        // }else{
        //     js.shareBtn();          
        // }
        let self = this;
        js.shareBtnWithGroup(null, function () {

            self.node.active = false;
            js.getOpenDataQunDoubleRankBtn();
        });

    },
    initRank(isGroup = 0, callbacks, customData, isQQPlay = false, qqData) {
        this.callbacks = callbacks;
        this._customData = customData;
        this._select = 0;
        this.scoreName = this._customData[0].text5;
        this.scoreName1 = this._customData[0].text6;
        this.qqPlatform.active = isQQPlay;
        this.wxPlatform.active = !isQQPlay;
        if (isQQPlay) {

            this._contentData = qqData;
            // this._contentData ={score:[{nick:'dad',score:'100',selfFlag:1,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
            // {nick:'dad',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
            // {nick:'dad',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
            // {nick:'dad',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
            // {nick:'dad',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},//contentData;
            // {nick:'dad',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
            // {nick:'dad',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
            // {nick:'dad',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
            // {nick:'dad',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
            // {nick:'dad',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
            // {nick:'dad',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
            // {nick:'dad',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},],
            // a1:[{nick:'dad',score:'100',selfFlag:1,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
            // {nick:'dad',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
            // {nick:'dad',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
            // {nick:'dad',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
            // {nick:'dad',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},//contentData;
            // {nick:'dad',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
            // {nick:'dad',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
            // {nick:'dad',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
            // {nick:'dad',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
            // {nick:'dad',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
            // {nick:'dad',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
            // {nick:'dad',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},] }

            this.initLoopScrollView(this._content_1, this.listItem, 'item', 0);
            this.initLoopScrollView(this._content_2, this.listItem, 'item', 1);
            this.resetLoopScrollView(this._content_1, this.getListLengthByKey(this._customData[this._select].text6));
            this.resetLoopScrollView(this._content_2, this.getListLengthByKey(this._customData[this._select].text5));
            this.updateText();
        } else {
            this._showFriendsRankImg();
            this.updateShowScore();
        }

        if (isGroup) {
            //this.titleText.string = "群排行榜";
            this._isGroup = 1;
            //this.groupNode.active = false;
        } else {
            //this.titleText.string = "好友排行榜";
            this._isGroup = 0;
            //this.groupNode.active = true;
        }
        this.updateShowInfo();

    },
    updateShowInfo() {
        this.myRank.string = this._customData[this._select].text1;
        this.myNextRank.string = this._customData[this._select].text2;
        this.titleRankText1.string = this._customData[this._select].text3;
        this.titleRankText2.string = this._customData[this._select].text4;
    },
    updateShowScore() {
        var score = 0
        if (this._customData[this._select].text6 == 'score') {
            score = this._userOperate.getScore();
        } else {
            score = this._userOperate.getScorePlus(this._customData[this._select].text6);
        }

        let scorePlus = this._userOperate.getScorePlus(this._customData[this._select].text5);
        this.myRankNum.string = score;
        this.myNextRankNum.string = scorePlus;
    },
    getFriendsNextBtn() {
        let self = this;
        let openDataContext = wx.getOpenDataContext()
        openDataContext.postMessage({
            id: self._isGroup ? MSG.MessageID.ON_MSG_GET_DOUBLE_FRIEND_RANK_NEXT : MSG.MessageID.ON_MSG_GET_DOUBLE_GROUP_RANK_NEXT,
        })
        this._showFriendsRankImg();
        // this.node.runAction(cc.sequence(cc.delayTime(0.1),cc.callFunc(function(){
        // })))
    },
    getFriendsBeforeBtn() {
        let self = this;
        let openDataContext = wx.getOpenDataContext()
        openDataContext.postMessage({
            id: self._isGroup ? MSG.MessageID.ON_MSG_GET_DOUBLE_FRIEND_RANK_BEFORE : MSG.MessageID.ON_MSG_GET_DOUBLE_GROUP_RANK_BEFORE,
        })
        this._showFriendsRankImg();
        // this.node.runAction(cc.sequence(cc.delayTime(0.1),cc.callFunc(function(){
        // })))
    },
    getFriendsCloseBtn() {
        let openDataContext = wx.getOpenDataContext()
        openDataContext.postMessage({
            id: MSG.MessageID.ON_MSG_GET_DOUBLE_FRIEND_RANK_CLOSE,
        })
    },
    _checkUpdate() {
        let openDataContext = wx.getOpenDataContext();
        let _dataName = this._customData[this._select].text5;
        let _dataName1 = this._customData[this._select].text6;
        openDataContext.postMessage({
            id: MSG.MessageID.ON_MSG_GET_DOUBLE_FRIEND_RANK_OPEN,
            dataName: _dataName,
            dataName1: _dataName1
        })
        this._showFriendsRankImg();
        this.updateShowScore();
        this.updateShowInfo();
    },
    check1() {

        if (!this._select) {
            return;
        }
        this._select = 0;
        this._checkUpdate();

    },
    check2() {
        if (this._select == 1) {
            return;
        }
        this._select = 1;
        this._checkUpdate();
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
        if (cc.sys.platform == cc.sys.WECHAT_GAME && self.sharedCanvas.width != 1100) {
            self.sharedCanvas.width = 1100;
            self.sharedCanvas.height = 400;
        }
    },

    initLoopScrollView(_scroll, item, jsName, select = 0) {
        let self = this;
        _scroll.registerCreateItemFunc(function () {
            var itemNode = cc.instantiate(item);
            return itemNode;
        });
        _scroll.registerUpdateItemFunc(function (cell, index) {
            var js = cell.getComponent(jsName);
            let key = self._customData[self._select].text6;
            if (select) {
                key = self._customData[self._select].text5;
            }
            let _qqKey = global.getQQRankeyByCustomKey(key)
            let data = self._contentData[_qqKey];
            let length = data.length;
            //console.log("registerUpdateItemFunc"+ _qqKey + JSON.stringify(data) );
            if (data[index]) {
                js.init(data[index], index, self, _qqKey, 1);
            }

        });

    },

    resetLoopScrollView(_scroll, num) {
        _scroll.setTotalNum(num);
        _scroll.resetView();
    },
    getListLengthByKey(key = 'score') {
        let _qqKey = global.getQQRankeyByCustomKey(key);
        let list = this._contentData[_qqKey];
        let length = 0;
        if (list) {
            length = list.length;
        }
        return length;
    },
    updateText() {
        let score = this.getScoreByKey(this._customData[this._select].text6);
        this.myRankNum.string = score;

        score = this.getScoreByKey(this._customData[this._select].text5);
        this.myNextRankNum.string = score;
    },
    getScoreByKey(key = 'score') {
        let _qqKey = global.getQQRankeyByCustomKey(key);
        let list = this._contentData[_qqKey];
        //console.log("updteText"+ _qqKey + JSON.stringify(list));
        let score = 0;
        for (let i = 0; i < list.length; i++) {
            if (list[i].selfFlag === 1) {
                score = list[i][_qqKey];
                break;
            }
        }
        return score;
    }
    // update (dt) {},
});