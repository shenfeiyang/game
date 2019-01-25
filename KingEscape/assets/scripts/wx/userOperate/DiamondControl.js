var global = require("global");
var urls = require('route').urls;
var util = require('../utils/util');
var config = require('config');
var payment = require("Payment");
var localUrl = urls.baseUrl;

// localUrl = "http://192.168.9.108";

/**
 * 用来添加钻石
 */
var DiamondControl = ({
    /**
     * 加钻石
     * @param {number} diamondNum 
     * @param {string} reasonType 增加钻石原因, 默认为分享加钻石
     * 2001 分享加钻石
     * 2002 看视频加钻石
     * 2003 做任务加钻石
     * @param {function} callback 
     */
    AddTheDiamond: function (diamondNum, callback = () => {}, reasonType) {
        var url = localUrl + "/recharge/add_rechargepoint";
        reasonType = reasonType ? reasonType : 2001;
        console.log("### user uid ", config.UID, diamondNum, reasonType);

        var diamondArg = {
            "appid": config.config.appid,
            "uid": config.UID,
            "num": diamondNum,
            "add_log": reasonType,
        }

        diamondArg = JSON.stringify(diamondArg);
        util.request({
            url: url,
            data: diamondArg,
            method: "post",

            success: res => {
                console.log("###########add diamonmd success info ", res);
                payment.checkPaymentResults();
                callback(res.data);
            },

            fail: res => {
                console.log("！！！！！！add diamond fail info", res);
                let errorMsg = {
                    data: "can't connect server",
                    ecode: 704 //连不上服务器
                }
                callback(errorMsg);
            }
        });
    },

});

module.exports = DiamondControl;