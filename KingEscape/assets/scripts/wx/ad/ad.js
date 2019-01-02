//import { format } from 'util';


var config = require('config')

var self = null;

const postAdvert = function () {
    if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        var launcInfo = wx.getLaunchOptionsSync();
        var appId = "";
        if (typeof (launcInfo.referrerInfo) == "undefined") {
        } else {
            appId = launcInfo.referrerInfo.appId;
        }
        wx.getUserInfo({
            success: function (res) {
                var city = res.userInfo.city;
                var gender = res.userInfo.gender;
                var param2 = {
                    deviceId: config.UID,
                    fromAppid: appId,
                    gender: gender,
                    city: city
                }
                console.log(param2);
                if (cc.sys.platform == cc.sys.WECHAT_GAME) {
                    var util = require('util');
                    var urls = require('route').urls
                    util.request({
                        url: urls.advert,
                        data: param2,
                        header: { 'content-type': 'application/x-www-form-urlencoded' },
                        method: 'POST',
                        success: res => {
                            console.log("postAdvert success")
                        },
                        fail: res => {
                            console.log("postAdvert fail");
                        },
                    })
                }
            },
        })
    }
}

module.exports = {
    postAdvert: postAdvert
}