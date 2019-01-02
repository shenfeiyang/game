// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
const adc = require("adc");
const preview = require("preview");
const wxAd = require("wxAd");
const global = require("global");
const coinGift = require("coinGift");
var self = null;
cc.Class({
    extends: cc.Component,
    properties: {
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        self = this;
        if (!wxAd.wxBversionLess("2.2.0") && typeof global.coinGiftOnly != "undefined" && global.coinGiftOnly == 1) {
            this.node.active = true;
            self.wxOnshow();
        } else {
            this.node.active = false;
        }
        global.coinGiftNode = this.node;
        // const wxAddLayer = cc.find("Canvas").getComponent("wxAddLayer");
        // wxAddLayer.getCoinGiftOnlyEvent(function () {
        //     console.log("scccccc");
        // }, function () {
        //     console.log("fff");
        // })
    },

    start() {

    },

    //监听金币礼包回调
    wxOnshow() {
        wx.onShow(function (res) {
            coinGift.getIconGift(res);
        })
    },

    //金币礼物点击事件
    onClickEvent() {
        console.log("onclickEvent coin");
        if (cc.sys.platform != cc.sys.WECHAT_GAME) {
            return;
        }
        var jumpid = "wx845a2f34af2f4235";
        var parm = "pages/main/main?coinGiftOnly=coinGiftOnly";
        parm = parm.indexOf('?') > 0 ? parm : parm +'?';
        parm = parm.indexOf('gender') > 0 ? parm : parm + '&gender='+ global.getGender();
        if (!wxAd.wxBversionLess("2.2.0")) {
            //do some thing;
            console.log("满足2.2.0");
            wx.navigateToMiniProgram({
                appId: jumpid,
                path: parm,
                success: (res) => {
                    console.log(res);
                },
            });
        }
    }
    // update (dt) {},
});
