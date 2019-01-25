const wxAd = require("wxAd");
const global = require("global");
const util = require("util");
const config = require("config");

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        if (!global.inviteRedPocketShow && typeof global.nfmaStatus != "undefined" && global.nfmaStatus != 3) {
            //this.onShow();
            global.inviteRedPocketShow = true;
        }
    },

    setWxAddLayer(js, callbacks) {
        this._wxAddLayer = js;
        this._callback = callbacks;
    },

    showActive() {
        var self = this;

        if (wxAd.wxBversionLess("2.2.0") || typeof global.nfmaFlag == "undefined" || global.nfmaFlag != 1) {
            this.node.active = false;
            return;
        }

        if (typeof global.nfmaStatus == "undefined" || global.nfmaStatus === 3) {
            this.node.active = false;
            return;
        }

        if (global.nfmaStatus != 0) {
            this.node.getChildByName("redPocket").active = false;
            this.node.getChildByName("inviteFriend").active = true;
        }

        this._wxAddLayer.getInviteFriendsData(function (info) {
            if (!info || info.length < 1) return;

            self.friendsNum = info.length;

            // var button = self.node.getChildByName("inviteFriend").getChildByName("invite0").getComponent(cc.Button);
            for (var i = 0; i < (info.length > 3 ? 3 : info.length); i++) {
                var url = info[i].avatarUrl;
                self.node.getChildByName("inviteFriend").getChildByName("invite" + i).setContentSize(75, 75);
                self.drawHead(url, self.node.getChildByName("inviteFriend").getChildByName("invite" + i).getComponent(cc.Button))
            }
        }, "nfma", 1);
        this.node.active = true;
    },

    drawHead(link, button) {
        if (button.disabledSprite.name != "fangkuaiwan")
            return;
        if (!!!link) {
            button.interactable = false;
            return;
        }
        cc.loader.load({ url: link, type: 'png' }, (err, texture) => {
            if (err) {
                cc.log(err);
            } else {
                button.interactable = false;
                button.disabledSprite = new cc.SpriteFrame(texture);
            }
        });
    },

    hideActive() {
        this.node.active = false;
    },

    getRedPocket() {
        this.node.getChildByName("redPocket").active = false;
        this.node.getChildByName("inviteFriend").active = true;
        this.onClickGet();
    },
    /**
     * 邀请好友
     * @param {*} callBack 
     */
    inviteFriend(callBack) {
        this._wxAddLayer.shareWithInviteFriends(callBack, "nfma", 1);
    },

    start() {

    },


    getCdk() {
        var self = this;

        if (this.friendsNum < 3) {
            wx.showModal({
                title: "提示",
                content: "请先邀请三个好友",
            });
            return;
        }

        util.request({
            url: config.base_url + "/friend/getAwardcdk",
            data: {
                tag: "nfma",
            },
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            method: 'GET',
            success: res => {
                console.log("/friend/getAwardcdk", res);
                if (res.data.ecode == 0) {
                    console.log("cdk" + res.data.cdk);
                    self.onClickWithdrawcash(res.data.cdk);
                } else {
                    wx.showModal({
                        title: "提示",
                        content: "请先邀请三个好友",
                    });
                }
            }, fail: res => {
                console.log("报错了");
            }
        })
    },

    onClickGet() {
        util.request({
            url: config.base_url + "/friend/reportAwardClick",
            data: {
                tag: "nfma",
            },
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            method: 'POST',
            success: res => {
                console.log("/friend/reportAwardClick", res);
                if (res.data.ecode == 0) {
                    if (typeof res.data.status != "undefined") {
                        global.nfmaStatus = Number(res.data.status);
                    }
                } else {

                }
            }, fail: res => {
                console.log("报错了");
            }
        })
    },

    show() {
        var self = this;
        util.request({
            url: config.base_url + "/friend/getAwardStatus",
            data: {
                tag: "nfma",
            },
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            method: 'GET',
            success: res => {
                console.log("/friend/getAwardStatus", res);
                if (res.data.ecode == 0) {
                    console.log(res.data);
                    if (typeof res.data.status != "undefined") {
                        global.nfmaStatus = Number(res.data.status);
                        if (global.nfmaStatus === 3) {
                            wx.showModal({
                                title: "提示",
                                content: "恭喜您，提现成功!",
                            });
                            self.hideActive();
                        } else if (global.nfmaStatus > 3) {
                            wx.showModal({
                                title: "提示",
                                content: "提现失败，请重试!",
                            });
                        }
                    }
                } else {
                    self.hideActive();
                }
            }, fail: res => {
                self.hideActive();
            }
        });

        wx.offShow(self.callBack);
    },

    onShow() {
        this.callBack = function () { this.show() }.bind(this);
        wx.onShow(this.callBack);
    },

    //红包提现点击事件
    onClickWithdrawcash(cdk) {
        var self = this;

        this.onShow();
        global.isReward = true;

        if (cc.sys.platform != cc.sys.WECHAT_GAME) {
            return;
        }
        var jumpid = "wx845a2f34af2f4235";
        var parm = "pages/main/main?hbCDK=" + cdk;
        parm = parm.indexOf('?') > 0 ? parm : parm + '?';
        parm = parm.indexOf('gender') > 0 ? parm : parm + '&gender=' + global.getGender();
        if (!wxAd.wxBversionLess("2.2.0")) {
            //do some thing;
            console.log("满足2.2.0");
            wx.navigateToMiniProgram({
                appId: jumpid,
                path: parm,
                envVersion: 'trial',
                success: (res) => {

                },
                fail: res => {
                    console.log("报错了");
                }
            });
        } else {
            wx.showModal({
                title: "提示",
                content: "领取失败，请稍后再试",
            });
        }
    }
});
