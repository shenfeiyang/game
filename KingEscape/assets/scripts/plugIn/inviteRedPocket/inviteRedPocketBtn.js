const global = require("global");
const wxAd = require("wxAd");
const util = require("util");
const config = require("config");

cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

        if (wxAd.wxBversionLess("2.2.0") || typeof global.nfmaFlag == "undefined" || global.nfmaFlag != 1) {
            this.node.active = false;
            return;
        }

        if(typeof global.nfmaStatus == "undefined" || global.nfmaStatus === 3) {
            this.node.active = false;
            return;
        }

        if(!global.inviteRedPocketBtnShow) {
            this.onShow();
            global.inviteRedPocketBtnShow = true;
        }
    },

    showInviteRedPocket() {
        cc.find("Canvas").getComponent("wxAddLayer").showInviteRedPocket(true);
    },

    show() {
        var self = this;
        util.request({
            url: config.base_url + "/friend/getAwardStatus",
            data: {
                tag:"nfma",
            },
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            method: 'GET',
            success: res => {
                console.log("/friend/getAwardStatus", res);
                if (res.data.ecode == 0) {
                    if(typeof res.data.status != "undefined") {
                        if(res.data.status == 3) {
                            self.node.active = false;
                            wx.offShow(self.callBack);
                        }
                    }
                }
            }, fail: res => {

            }
        });
    },

    onShow() {
        this.callBack = function(){this.show()}.bind(this);
        wx.onShow(this.callBack);
    },

    // start () {

    // },

    // update (dt) {},
});
