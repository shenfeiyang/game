var urls = require('route').urls;
var config = require('config');
var login = require('login');
var globalFunc = require('globalFunc');
var util = require("util");
var global = require("global");

var Auth = cc.Class({
    statics: {
        instance: null,
        getInstance: function () {
            if (Auth.instance == null) {
                Auth.instance = new Auth();
            }
            return Auth.instance;
        }
    },

    ctor() {
        this.authWidget = null;
    },

    showAuthView(success, fail, changeBool) {
        if (fail === 1) {
            fail = success;
        }

        wx.getSetting({
            success: res => {
                console.log("wx.getSetting", res);
                if (!res.authSetting['scope.userInfo']) {
                    if (global.getDoAuView == 1) {
                        //上传统计用户授权率分母
                        global.getDoAuView = 2;
                        util.request({
                            url: config.base_url + "/stat/authorizeStat",
                            header: { 'content-type': 'application/x-www-form-urlencoded' },
                            method: 'POST',
                            data: {
                                appid: config.config.appid,
                                type: 1,
                            },
                            success: function (res) {
                                console.log("成功发送收集授权的分母", res);
                            },
                            fail: function (er) {
                                console.log("发送收集授权的分母失败");
                            }
                        });
                    }

                    let sysInfo = wx.getSystemInfoSync();
                    let result = globalFunc.compareVersion(sysInfo.SDKVersion, '2.0.1');
                    console.log('sysInfo SDKVersion:', sysInfo.SDKVersion, result);
                    if (result == -1) {
                        console.log('low sdk version, no user info btn ...');
                        login.getUseInfo();
                        if (success && typeof success == 'function') {
                            success();
                        }
                    } else {
                        this.loadAuthView(success, fail, changeBool);
                    }

                } else {
                    // 已获取授权, 获取用户数据上传到服务器
                    console.log('has auth and go to get user info ...');
                    login.getUseInfo();
                    if (success && typeof success == 'function') {
                        success();
                    }
                }
            },
            fail: res => {
                console.log("wx getSetting fail");
                if (fail && typeof fail == 'function') {
                    fail();
                }
            }
        });
    },

    loadAuthView(success, fail, changeBool) {
        let self = this;
        if (!cc.isValid(this.authWidget)) {
            console.log('authWidget is not valid:');
            this.authWidget = null;
        }
        if (this.authWidget != null) {
            console.log('authWidget not be null');
            // this.authWidget.active = true;
            this.authWidget.getComponent('authLayer').show();
            return;
        }
        console.log('to load auth view ...');
        cc.loader.loadRes("wx/auth/authWidget", cc.Prefab, function (err, prefab) {
            if (err) {
                console.error(err)
                return;
            }
            let widget = cc.instantiate(prefab);
            let canvas = cc.find("Canvas");
            canvas.addChild(widget);

            widget.setPosition(0, 0);
            widget.getComponent('authLayer').init(success, fail, changeBool);
            self.authWidget = widget;
        });

    }
});