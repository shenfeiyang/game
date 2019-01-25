var urls = require('route').urls
var config = require('config')
var global = require('global')
var util = require('util');
var userOperate = require('userOperate');
userOperate = new userOperate();
var ad = require('ad');
var share = require('share');
share = new share();
// 获取用户信息
const getUseInfo = function (callBack) {
    if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        wx.getUserInfo({
            success: res => {
                console.log('get user info:', res)
                config.userInfo = res.userInfo
                userOperate.setUserDataInfo(res.userInfo);
                if (callBack && typeof callBack == 'function') callBack(res.userInfo);
                //config.userInfo = res.userInfo
                if (global.getDoAuView == 2) {
                    //上传统计用户授权率分子
                    util.request({
                        url: config.base_url + "/stat/authorizeStat",
                        header: { 'content-type': 'application/x-www-form-urlencoded' },
                        method: 'POST',
                        data: {
                            appid: config.config.appid,
                            type: 2,
                        },
                        success: function (res) {
                            console.log("成功发送收集授权的分子", res);

                        },
                        fail: function (er) {
                            console.log("发送收集授权的分子失败");
                        }
                    });
                    global.getDoAuView = 3;
                }

            },
        })
    }
};

const _login = function (res, success, fail) {
    var d = res.data;
    if (d && (d.ecode == 0 || d.ecode == 2)) {
        console.log("login +", res)
        if (res.data["uid"]) {
            config.UID = res.data["uid"];
        }
        if (res.data['sessionkey']) {
            config.sessionkey = res.data.sessionkey;
        }

        if (typeof res.data.spTag.nfmaFlag != "undefined") {
            global.nfmaFlag = Number(res.data.spTag.nfmaFlag);
        }

        if (typeof res.data.spTag.nfmaStatus != "undefined") {
            global.nfmaStatus = Number(res.data.spTag.nfmaStatus);
        }

        if (typeof res.data.spTag.coinGift != "undefined") {
            global.coinGiftOnly = Number(res.data.spTag.coinGift);
        }
        //console.log("这里是login函数:" + res.data.spTag.spHbao);
        if (res.data.spTag.spHbao != null && (res.data.spTag.spHbao == 0 || res.data.spTag.spHbao == 1)) {
            global.showHongbao = res.data.spTag.spHbao;
        }
        if (typeof res.data.spTag.logindays != "undefined") {
            global.setLoginDays(parseInt(res.data.spTag.logindays));
        }

        //console.log("******登录获取到的ressmGame信息" + res.data.spTag.smGame);
        if (res.data.spTag.smGame != null && (res.data.spTag.smGame == 0 || res.data.spTag.smGame == 1)) {
            global.showMysNewGame = res.data.spTag.smGame;
        }
        // 公众号拉粉
        if (res.data.spTag.vpnaFlag != null) {
            global.setLoginCfgByKey('vpnaFlag', res.data.spTag.vpnaFlag);
        }
        //北上广深 判断 1是，0 不是
        if (res.data.spTag.cityFlag != null) {
            global.setLoginCfgByKey('cityFlag', res.data.spTag.cityFlag);
        }
        //有效用户 0 ，无效分享（垃圾用户）1
        if (res.data.spTag.spshare != null) {
            global.setLoginCfgByKey('spshare', res.data.spTag.spshare);
        }
        //点击分享小卡片进入的人  1 消除类游戏显示新的首页， 0 显示老的首页
        if (res.data.spTag.spShareUser != null) {
            global.setLoginCfgByKey('spShareUser', res.data.spTag.spShareUser);
        }
        console.log("******登录获取到的showFs信息" + res.data.spTag.showFs);
        if (res.data.spTag.showFs != null && (res.data.spTag.showFs == 0 || res.data.spTag.showFs == 1)) {
            global.showFullScreenAdv = res.data.spTag.showFs;
        }
        //是否为新用户 1为 新用户，0为老用户
        if (res.data.spTag.newuser != null) {
            global.setLoginCfgByKey('newuser', res.data.spTag.newuser);
        }
        // 登录成功 获取用户数据 再登录回调
        //userOperate.getUserData(function(){
        if (success && typeof success == 'function') success(res.data);
        //});
        if (!!config.UID) {
            var launcInfo = wx.getLaunchOptionsSync();
            share.reportShareText(launcInfo);
        }
    } else {
        var msg = "server login fail." + JSON.stringify(res);
        console.log(msg);
        if (fail && typeof fail == 'function') fail();
    }
}

const firstLogin = function (success, fail) {
    wx.login({
        success: res => {
            console.log('first login wx login success:', res);
            login(res.code, function () {
                let auth = require('auth').getInstance();
                auth.showAuthView(function () {
                    ad.postAdvert();
                    let launcInfo = wx.getLaunchOptionsSync();
                    if (launcInfo && launcInfo["query"] && launcInfo.query["uid"]) {
                        share.addFriend(launcInfo.query["uid"]);
                    }
                    if (success && typeof success == 'function') success();
                });
            }, function () {
                if (fail && typeof fail == 'function') fail();
            });
        }
    });
};

const login = function (code, success, fail) {
    var param = config.getParam();
    param["appsign"] = util.sign(param);
    param["js_code"] = code;
    let launcInfo = wx.getLaunchOptionsSync();
    if (typeof launcInfo.query["from"] != "undefined") {
        param["channel_id"] = launcInfo.query["from"];
    } else if (launcInfo.scene == 1007 || launcInfo.scene == 1008 || launcInfo.scene == 1044 || launcInfo.scene == 1096) {
        param["channel_id"] = 'share';
    }
    //uid上报
    if (launcInfo.query['uid']) {
        param['from_uid'] = launcInfo.query['uid'];
    }
    //上报ios/android
    let sysInfo = wx.getSystemInfoSync();
    param['ptform'] = sysInfo.platform;
    util.request({
        url: urls.login,
        data: param,
        success: function (res) {
            _login(res, success, fail);
        },
        fail: function (er) {
            console.error("loginf fails", er);
            if (fail && typeof fail == 'function') fail();
        }
    });
};
const loginSmall = (success, fail) => {
    var param = {};
    let launcInfo = wx.getLaunchOptionsSync();
    if (typeof launcInfo.query["from"] != "undefined") {
        param["channel_id"] = launcInfo.query["from"];
    } else if (launcInfo.scene == 1007 || launcInfo.scene == 1008 || launcInfo.scene == 1044 || launcInfo.scene == 1096) {
        param["channel_id"] = 'share';
    }
    //uid上报
    if (launcInfo.query['uid']) {
        param['from_uid'] = launcInfo.query['uid'];
    }
    //上报ios/android
    let sysInfo = wx.getSystemInfoSync();
    param['ptform'] = sysInfo.platform;


    util.request({
        url: urls.baseUrl + '/loginSmall',
        data: param,
        success: function (res) {
            _login(res, success, fail);
        },
        fail: function (er) {
            console.error("loginf fails", er);
            if (fail && typeof fail == 'function') fail();
        }
    });
};
module.exports = {
    login: login,
    _login: _login,
    getUseInfo: getUseInfo,
    firstLogin: firstLogin,
    loginSmall: loginSmall,

}