var util = require('util');
var config = require('config');
var global = require("global");
/**
 * 判断从盒子进入领取情况
 * @param {返回信息} launchInfo
 * @param {成功领取回调} callback1 
 * @param {领取失败回调} callback2
 */
const getIconGift = function (launchInfo, callback1 = null, callback2 = null) {
    if (cc.sys.platform != cc.sys.WECHAT_GAME) {
        return;
    }
    console.log("getIconGift", launchInfo);
    if (typeof launchInfo.query.coinGiftOnly == "undefined") {
        return;
    }
    var str = launchInfo.query.coinGiftOnly;
    if (str == "coinGiftOnly1" || str == "coinGiftOnly2") {
        util.request({
            url: config.base_url + "/user/setCoinState",
            data: {},
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            method: 'POST',
            success: res => {
                console.log("/user/setCoinState", res);
                global.coinGiftNode.active = false;
                if (res.data.ecode == 0) {
                    global.coinGiftOnly = 0;
                    global.coinGiftNode.active = false;
                    var ifDouble = false;
                    if (typeof global.sucCoinGift == "function" && str == "coinGiftOnly1") {
                        global.sucCoinGift(ifDouble = false);
                    } else if (typeof global.sucCoinGift == "function" && str == "coinGiftOnly2") {
                        global.sucCoinGift(ifDouble = true);
                    }
                } else {
                    if (typeof global.failCoinGift == "function") {
                        global.failCoinGift();
                    }
                }
            }, fail: res => {
                if (typeof global.failCoinGift == "function") {
                    global.failCoinGift();
                }
            }
        })
    }
};

/**
 * 领取金币礼包对外接口
 * @param {领取成功接口} callback1 
 * @param {领取失败接口} callback2 
 */
const coinGiftOnlyCallback = function (callback1, callback2) {
    if (typeof callback1 == "function") {
        global.sucCoinGift = callback1;
    }
    if (typeof callback2 == "function") {
        global.failCoinGift = callback2;
    }
};

module.exports = {
    getIconGift: getIconGift,
    coinGiftOnlyCallback: coinGiftOnlyCallback,
}
