

// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html
var rank = require('rank');
var config = require('config');
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

        listItem: {
            default: null,
            type: cc.Prefab,
        },
        scrollView: cc.Node,
        titleScrollView: cc.Node,
        titleItem: cc.Prefab,
        myRank: cc.Label,
        myRankNum: cc.Label,
        aloneSp: cc.Node,
        moreSp: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // this._rankShowWidget = new Array();
        // for (var i = 0; i < 3; i++) {
        //     var index = i + 1;
        //     this._rankShowWidget[i] = cc.find("top/rank_" + index, this.node);
        // }
        // 内容列表
        this._content = this.scrollView.getComponent('uiloopscrollview');
        // 排行榜标题
        this._titleContent = this.titleScrollView.getComponent('uiloopscrollview');

    },
    // 回退
    goBack() {
        this.node.active = false;
    },
    start() {

    },
    // // 创建 items
    // createItem(i, info) {
    //     var _item = cc.instantiate(this.listItem);
    //     var itemJs = _item.getComponent('item')
    //     itemJs.init(info, i);
    //     return _item;
    // },
    // 初始化
    initRank(titleData, contentData, callbacks) {
        this._titleData = titleData;
        this._contentData = contentData;
        // this._contentData ={score:[{nick:'打发士大夫',score:'100',selfFlag:1,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
        // {nick:'大发送到发送到发送到发的发',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
        // {nick:'大发送到发送到发送到',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
        // {nick:'大丰收的范德萨',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
        // {nick:'大发光时代',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},//contentData;
        // {nick:'啊啊啊啊啊啊啊啊啊啊啊啊啊',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
        // {nick:'ddddddddddddddddddddddddddd',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
        // {nick:'dd',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
        // {nick:'ddsdageadfea',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
        // {nick:'gesdgaed',score:'100',selfFlag:0,url:'http://thirdqq.qlogo.cn/g?b=sdk&k=8lk7JPQ1npjrZzK5dzP0Ng&s=100&t=1483381753'},
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
        // //console.log("QQRankLayer"+ JSON.stringify(titleData) + JSON.stringify(this._contentData))
        this._select = 0;
        let flag = this._titleData.length > 1 ? true : false;
        this.moreSp.active = flag
        this.aloneSp.active = !flag;

        this.initLoopScrollView(this._titleContent, this.titleItem, this._contentData, 'rankMoreItem');
        this.initLoopScrollView(this._content, this.listItem, this._titleData, 'item', 1);
        this.resetLoopScrollView(this._titleContent, this._titleData.length);
        this.updateContenList();
        //this.initBestsData();
        this.updateText();
    },

    initBestsData() {
        this._beastInfoList = [];
        this._beastQQKey = null;
        let _qqKey = global.getQQRankeyByCustomKey(this._titleData[this._select].key);
        //console.log(_qqKey);
        this._beastQQKey = _qqKey;
        let list = this._contentData[_qqKey];
        for (let i = 0; i < 3; i++) {
            if (list && list[i]) {
                this._beastInfoList.push(list[i]);
            }
        }
        this._initBestsView(this._beastInfoList)
    },
    _initBestsView(list) {
        for (let i = 0; i < 3; i++) {
            var value = list[i];
            if (typeof (value) != "undefined") {
                this._initBest(i + 1, value);
                this._rankShowWidget[i].active = true;
            } else {
                this._rankShowWidget[i].active = false;
            }
        }
    },
    _initBest(index, value) {
        var path = "top/rank_" + index
        //这些都无用
        var _rank = cc.find(path, this.node);
        var name = cc.find("name", _rank);
        name = name.getComponent(cc.Label)
        var grade = cc.find("star/grade", _rank);
        grade = grade.getComponent(cc.Label)
        var image = cc.find("mask/image", _rank);
        image = image.getComponent(cc.Sprite)

        name.string = value.nick || "";
        grade.string = value[this._beastQQKey] || 0;
        //获取人物头像
        var texture = value.url;
        if (!texture) {
            return
        }
        cc.loader.load({ url: texture, type: 'png' }, function (err, texture) {
            var spriteFrame = new cc.SpriteFrame();
            spriteFrame.setTexture(texture)
            image.spriteFrame = spriteFrame
        })

    },
    initLoopScrollView(_scroll, item, data, jsName, flag = false) {
        let self = this;
        _scroll.registerCreateItemFunc(function () {
            var itemNode = cc.instantiate(item);
            return itemNode;
        });
        _scroll.registerUpdateItemFunc(function (cell, index) {
            var js = cell.getComponent(jsName);
            if (flag) {
                let _qqKey = global.getQQRankeyByCustomKey(self._titleData[self._select].key)
                let data = self._contentData[_qqKey];
                let length = data.length;
                //console.log("registerUpdateItemFunc"+ _qqKey + JSON.stringify(data) );
                if (data[index]) {
                    js.init(data[index], index, self, _qqKey);
                }

            } else {
                let data = self._titleData;
                js.init(data[index], index, self, 1, data.length);
            }

        });

    },
    resetLoopScrollView(_scroll, num) {
        _scroll.setTotalNum(num);
        _scroll.resetView();
    },

    updateOpenData() {
        //console.log("select",this._select)
        this.updateContenList();
        this.updataCellInfo(true);
        this.updateText();
        //this._showFriendsRankImg();

    },
    updateText() {
        let _qqKey = global.getQQRankeyByCustomKey(this._titleData[this._select].key);
        let list = this._contentData[_qqKey];
        //console.log("updteText"+ _qqKey + JSON.stringify(list));
        let score = 0;
        for (let i = 0; i < list.length; i++) {
            if (list[i].selfFlag === 1) {
                score = list[i][_qqKey];
                break;
            }
        }
        this.myRank.string = this._titleData[this._select].rankText;
        this.myRankNum.string = score;
    },
    //
    updateContenList() {
        let _qqKey = global.getQQRankeyByCustomKey(this._titleData[this._select].key)
        let list = this._contentData[_qqKey];
        let length = list ? list.length : 0;
        //length -= 3;
        if (length < 0) {
            length = 0;
        }
        this.resetLoopScrollView(this._content, length);
    },
    //更新 cell 信息
    updataCellInfo(flag = false) {
        let item = this._titleContent.getItemByIndex(this._select);
        item.getComponent('rankMoreItem').setSelet(flag);

    },
    // update (dt) {},
});
