import { parse } from 'url';
import { type } from 'os';

//var config  = require('config');
var localStorage = require('localStorage');

var Global = {
    CC_GAME_SHARE_CHANNEEL: 1,
    shareList: {

    },
    //记录游戏开始次数
    gameStartTimes: parseInt(cc.sys.localStorage.getItem('GameStartTimes')) || 0,
    //randStrList: cc.sys.localStorage.getItem("RandomString"),
    //好友助力 是否有 进入游戏随机字符串
    enterGameRandStr: false,
    // 游戏内 好友助力 
    shareAssist: false,
    loginDays: -1,

    //显示红包
    showHongbao: -1,
    //显示神秘新游
    showMysNewGame: -1,
    //显示全屏广告
    showFullScreenAdv: -1,
    fullScreenJumpId: " ",
    fullScreenJumpPath: " ",
    fullScreenJumpImage: " ",
    //正在首次运行首次强弹授权
    getDoAuView: 0,
    showAuthLy: 1,

    //用户余额
    accountBalance: 0,

    //分享监听事件回调
    funcObjList: [],
    shareObjTag: [],
    randStrList: null,
    // 文字轮播广告
    noticeAdInfo: 0,
    // 性别
    gender: 0,
    getGender: function () { return this.gender; },
    setGender: function (res) { this.gender = res; },
    //低分不复活 次数记录
    //lowScoreTimes: parseInt(localStorage.getLocalStorage("lowScoreTimes")) || 0,

    //登录配置信息
    loginCfg: {},
    getLoginCfgByKey(key) {
        return this.loginCfg[key];
    },
    setLoginCfgByKey(key, value) {
        this.loginCfg[key] = value;
    },

    userDataInfo: {},
    setUserDataInfo: function (useData) {
        if (!useData) {
            return;
        }
        for (var k in useData) {
            this.userDataInfo[k] = useData[k];
        }
        console.log("++++++++++++userDataInfo", this.userDataInfo)
        //this.userDataInfo = useData;
    },
    //获得用户信息
    getUserDataInfo: function () {
        return this.userDataInfo;
    },
    //获得数据 by name
    getUserDataInfoByName: function (name) {
        if (this.userDataInfo && this.userDataInfo[name]) {
            return this.userDataInfo[name]
        }
        return null;
    },
    //设置数据
    setUserDataInfoByName: function (name, value) {
        this.userDataInfo[name] = value
    },
    /**
     * 是否同一周？
     */
    isWeekTime: function (_time) {
        _time = _time || 0;
        var now = this.getTimestamp();
        var weekTime = now - (now - 316800) % 604800;
        var _weekTime = _time - (_time - 316800) % 604800;

        console.log("timeTamp", _weekTime, weekTime);
        if (_time && _weekTime === weekTime) {
            return true;
        }
        return false;
    },
    /**
     * 获得时间戳
     */
    getTimestamp: function () {
        var d = new Date();
        d.setDate(d.getDate());
        var timestamp = Date.parse(d);
        var d2 = new Date(timestamp);
        var now = timestamp / 1000;

        return now;
    },
    /**
     *  飘字
     * @param {*} target 
     * @param {*} _text 
     * @param {*} color 
     * @param {*} strokeColor 
     */
    flyText(target, _text, color, strokeColor, time, fontSize = 40) {
        var textNode = new cc.Node;
        textNode.addComponent(cc.Label);
        let sizeWidth = fontSize * (_text.length + 2);
        textNode.setContentSize(sizeWidth, fontSize + 2);
        var text = textNode.getComponent(cc.Label);
        text.string = _text || ""; //"飘字";
        text.fontSize = fontSize || 40;
        let lineHeight = fontSize ? fontSize + 2 : 42;
        text.lineHeight = lineHeight;
        text.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        textNode.color = color || cc.color(247, 255, 43, 255);
        if (strokeColor) {
            textNode.addComponent(cc.LabelOutline);
            var textOutLine = textNode.getComponent(cc.LabelOutline);
            textOutLine.color = strokeColor || cc.color(63, 2, 2, 255);
            textOutLine.width = 1;
        }
        target.addChild(textNode);
        var anchor = target.getAnchorPoint();
        var size = target.getContentSize();
        textNode.setPosition((0.5 - anchor.x) * size.width / 2, (0.5 - anchor.y) * size.height);

        var fadeOut = cc.fadeOut(0.2);
        var move = cc.moveBy(0.2, cc.v2(0, 200));
        time = time || 0.3;
        textNode.runAction(cc.sequence(cc.delayTime(time), cc.spawn(fadeOut, move), cc.callFunc(function () {
            textNode.destroy();
        })))
    },
    addStartGameTimes(num) {
        num = num || 1;

        this.gameStartTimes += num;
        cc.sys.localStorage.setItem('GameStartTimes', this.gameStartTimes);
    },
    getStartGameTimes() {
        let times = parseInt(cc.sys.localStorage.getItem('GameStartTimes'));
        if (isNaN(times)) {
            cc.sys.localStorage.setItem('GameStartTimes', 0);
            this.gameStartTimes = 0
        } else {
            this.gameStartTimes = parseInt(times);
        }
        return this.gameStartTimes;
    },
    getStartGameSeconds() {
        let now = this.getTimestamp();
        let seconds = parseInt(cc.sys.localStorage.getItem('GameStartSeconds'));
        if (isNaN(seconds)) {
            cc.sys.localStorage.setItem('GameStartSeconds', now);
            return now;
        }

        return parseInt(seconds);
    },
    //是否是相同 随机串
    IsRepeatRandString(str) {
        if (!this.randStrList) {
            let _string = cc.sys.localStorage.getItem("newRandomString");
            if (_string) {
                this.randStrList = JSON.parse(_string);
                this.removeItemForRandStrList();
            } else {
                this.randStrList = {};
            }
        }
        //console.log('IsRepeatRandString', this.randStrList)
        if (this.randStrList[str] && !this.randStrList[str].isUse) {
            this.randStrList[str] = NaN;
            cc.sys.localStorage.setItem("newRandomString", JSON.stringify(this.randStrList));
            return true;
        }
        return false;
    },
    removeItemForRandStrList() {
        if (!this.randStrList) {
            let _string = cc.sys.localStorage.getItem("newRandomString");
            if (_string) {
                this.randStrList = JSON.parse(_string);
                this.removeItemForRandStrList();
            } else {
                this.randStrList = {};
            }
        }
        for (let k in this.randStrList) {
            if (this.randStrList[k] && new Date().toDateString() != new Date(parseInt(this.randStrList[k].timestamp)).toDateString()) {
                this.randStrList[k] = NaN;
            }
        }
    },
    addRandString(str) {
        //console.log('globalRandomStr', this.randStrList, str);
        if (!this.randStrList) {
            let _string = cc.sys.localStorage.getItem("newRandomString");
            if (_string) {
                this.randStrList = JSON.parse(_string);
                this.removeItemForRandStrList();
            } else {
                this.randStrList = {};
            }
        }
        this.randStrList[str] = { str: str, timestamp: new Date().getTime(), isUse: 0 };
        cc.sys.localStorage.setItem("newRandomString", JSON.stringify(this.randStrList));
        console.log('globalRandomStr', this.randStrList);
        // let _string = cc.sys.localStorage.getItem("RandomString");
        // let strList = null;
        // if (!!!_string) {
        //     strList = new Array();
        //     strList.push(str);
        //     cc.sys.localStorage.setItem("RandomString", JSON.stringify(strList));
        // } else {
        //     strList = JSON.parse(_string);
        //     strList.push(str);
        //     cc.sys.localStorage.setItem("RandomString", JSON.stringify(strList));
        // }
    },

    getEnterGameRandStr() {
        return this.enterGameRandStr;
    },
    setEnterGameRandStr(flag) {
        this.enterGameRandStr = flag;
    },
    getShareAssist() {
        return this.shareAssist;
    },
    setShareAssist(flag) {
        this.shareAssist = flag;
    },
    // 低分不复活 次数记录
    getLowScoreTimes() {
        let times = parseInt(localStorage.getLocalStorage("lowScoreTimes")) || 0;
        return times;
    },
    setLowScoreTimes() {
        let times = parseInt(localStorage.getLocalStorage("lowScoreTimes")) || 0;
        localStorage.setLocalStorage("lowScoreTimes", times + 1);
    },
    // 高分分不复活 次数记录
    getHeightScoreTimes() {
        let times = parseInt(localStorage.getLocalStorage("heightScoreTimes")) || 0;
        return times;
    },
    setHeightScoreTimes() {
        let times = parseInt(localStorage.getLocalStorage("heightScoreTimes")) || 0;
        localStorage.setLocalStorage("heightScoreTimes", times + 1);
    },

    /**
     * 设置 分享接口渠道 （true 自定义假的分享回调，false 微信分享回调）
     */
    setShareChannel(flag = 0) {
        //if(flag){
        this.CC_GAME_SHARE_CHANNEEL = flag;
        //}
    },
    getShareChannel() {
        return this.CC_GAME_SHARE_CHANNEEL;
    },
    // 判断分享成功/失败 的最小时间点
    setShareMinTime(time = 1500) {
        this.shareMinTime = time;
    },
    getShareMinTime() {
        return this.shareMinTime;
    },
    // 设置连续分享 时间小于3000ms 大于1500 ms
    setLXShareTime(time = 3000) {
        this.shareLXTime = time;
    },
    getLXShareTime() {
        return this.shareLXTime;
    },
    //qq 排行榜key 的存储
    loadQQRankey() {
        let keyList = localStorage.getLocalStorage('qqRankKeyList');
        if (!keyList) {
            keyList = {}
        }
        this.qqRankeyList = keyList;
    },
    //上传
    upLoadQQRankey() {
        if (this.qqRankeyList) {
            localStorage.setLocalStorage('qqRankKeyList', this.qqRankeyList);
        }
    },
    // 获取 qqkey 对应的a1~16;
    getQQRankeyByCustomKey(key) {
        if (!this.qqRankeyList) {
            this.loadQQRankey();
        }
        let _qqKey = this.qqRankeyList[key];
        if (key == 'score') {
            return 'score';
        }
        if (!_qqKey) {
            this.setQQRankeyUseCustomKey(key);
            _qqKey = this.qqRankeyList[key];
        }
        return _qqKey;
    },
    setQQRankeyUseCustomKey(key) {
        if (!this.qqRankeyList) {
            this.loadQQRankey();
        }
        if (this.qqRankeyList[key]) {
            return;
        }
        if (key == 'weekScore' || key == 'score') {
            this.qqRankeyList[key] = 'score';
            this.qqRankeyList['score'] = key;
            this.upLoadQQRankey();
            return;
        }
        for (let i = 1; i <= 16; i++) {
            let _qqKey = 'a' + i;
            if (!this.qqRankeyList[_qqKey]) {
                this.qqRankeyList[key] = _qqKey;
                this.qqRankeyList[_qqKey] = key;
                break;
            }
        }
        this.upLoadQQRankey();
        return;
    },
    wxBversionLess: (vs) => {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            let bVersion = wx.getSystemInfoSync().SDKVersion;
            var vs2vn = (vs) => {
                return parseInt(vs.split(".").join("").slice(0, 3));
            }
            return vs2vn(bVersion) < vs2vn(vs);
        }
        return true;
    },
    //分享 全局保存回调
    setGlobalFunc: function (func, tag, _global = 0) {
        this.funcObjList[tag] = { func: func, global: _global };
        console.log("setGlobalFunc", this.funcObjList, this.shareObjTag);
        if (this.shareObjTag[tag]) {
            this.shareObjTag[tag] = null;
            if (this.funcObjList[tag].func && typeof this.funcObjList[tag].func == 'function') this.funcObjList[tag].func();
        }
    },
    getGlobalFunc: function (tag) {
        return this.funcObjList[tag];
    },
    saveGlobalEvent: function (tag) {
        this.shareObjTag[tag] = tag;
    },
    //登录天数
    setLoginDays(days) {
        if (typeof days == 'number')
            this.loginDays = days;
    },
    getLoginDays() {
        return this.loginDays;
    }
};

module.exports = Global;