var util = require('util');
var config = require('config');
var commonNode = require('commonNode');
var global = require("global");
var urls = require('route').urls;

var localUrl = urls.baseUrl;

// var checkUrl = "https://gamecenter-dev.phonecoolgame.com";


//请通过wxAddLayer进行调用
var Payment = ({
    // extends: cc.Component,
    myIntervar: null,
    /**
     * ios小游戏支付  
     * @param {JSON} payInfo amount金额的最小单位为分 值为整数 最低为 1代表 1 分钱 100代表 1 元
     * openid 微信的openid 
     * productid 购买的物品描述
     * extdata 充值的额外说明
     * @param {function} _callBack 会在成功支付后，检查用户余额成功后调用, 这个回调函数可能会回调三次
     */
    iosPayment: function (payInfo, _callBack) {
        this.payid = payInfo.payid;
        var _extdata = null;
        // this.payid = 10012;
        if (payInfo.extdata !== undefined) {
            _extdata = payInfo.extdata;
        } else {
            _extdata = "游戏支付";
        }

        if (_callBack === undefined) {
            this.callBack = (res) => {
                console.log("！！！！！！single output ", res);
            }
        } else {
            this.callBack = _callBack;
        }

        this.money = payInfo.amount;
        let jsObj = {
            "amount": payInfo.amount,
            "channelid": "0",
            "extdata": _extdata,
            "payid": this.payid,
            "openid": config.UID,
            "productid": "1001",
            "productname": payInfo.productName,
            "roleid": "0",
            "serverid": "0",
            "cporderid": "1"
        }

        // var i = 1;
        // var myIntervar = setInterval(() => {
        //     if (i == 3) {
        //         clearInterval(myIntervar);
        //     }
        //     console.log("i", i++);
        // }, 500);

        jsObj = JSON.stringify(jsObj);
        this.payMsg = jsObj;
        this.getMiniprogramInfo();
    },

    /**
     * 获取小程序的信息  
     */
    getMiniprogramInfo: function () {
        var self = this;
        // cc.log("!!!!!!!!!!!get message");
        let url = localUrl + "/appPay/getAppPayInfo";
        let param = {
            payid: this.payid
        }

        util.request({
            url: url,
            data: param,
            method: "get",

            success: res => {
                console.log("@@@@@@@@, get mini program info", res);
                var miniProgramData = res.data;
                if (miniProgramData !== undefined) {
                    console.log(res.data);
                    if (miniProgramData.length > 1) {
                        let _index = Math.floor(Math.random() * (miniProgramData.length));
                        self.getSign(miniProgramData[_index]);
                    } else {
                        self.getSign(miniProgramData[0]);
                    }
                } else {
                    console.log("@@@@, the data is undefined", res);
                }
            },

            fail: res => {
                console.log("!!!!! get the program info fail", res);
            }
        });
    },

    /**
     * 获取参数的签名
     * @param {JSON} programMsg 该参数为要跳转的小程序的信息   
     */
    getSign: function (programMsg) {
        var self = this;
        let url = localUrl + "/recharge/ios_get_sign";
        let param = {
            data: this.payMsg
        }

        util.request({
            url: url,
            data: param,
            method: 'get',

            success: res => {
                console.log("##### mini data sign ", res);
                if (res.data.ecode === 0) {
                    self.jumpToTheApplet(programMsg, res.data.sign);
                } else {
                    console.log("!!!!get sign is undefined", res);
                }
            },

            fail: res => {
                cc.log("!!!!!!!!!!get sign info fail", res);
            }
        });
    },

    /**
     * 跳转支付小程序
     * @param {JSON} programMsg 要转的小程序的信息 
     * @param {string} _sign 支付参数的签名
     */
    jumpToTheApplet: function (programMsg, _sign) {
        var self = this;
        var signStr = {
            sign: _sign
        };
        var jsonObj = JSON.parse((this.payMsg + (JSON.stringify(signStr))).replace(/}{/, ','));
        // console.log("#######mixed the json obj", jsonObj);

        wx.navigateToMiniProgram({
            appId: programMsg.appid,
            path: programMsg.path,
            extraData: jsonObj,
            // envVersion: "develop",

            success: (res) => {
                console.log("skip to payment miniprogram success", res);
                var testFunc = function () {
                    var i = 1;
                    self.myIntervar = setInterval(function () {
                        // 这里的 this 指向 component
                        if (i == 3) {
                            clearInterval(self.myIntervar);
                        } else {
                            i++;
                            self.checkPaymentResults(null, 1);
                        }
                    }, 500);

                    wx.offShow(testFunc);
                }
                wx.onShow(testFunc);
            },

            fail: (res) => {
                console.log("skip to payment miniprgrm fail", res);
                //600   跳转失败
                let errorMsg = {
                    data: null,
                    ecode: 600
                }
                self.callBack(errorMsg);
            },
        });
    },

    /**
     * 检查支付结果，要主动调用
     * @param {number} from 调用的位置 1是内部调用
     * @param {function} _callBack 回调函数,成功和失败都会执行，并传递参数进去
     */
    checkPaymentResults: function (_callBack, from) {
        // cc.log("@@@ check payment results @@@@");
        var self = this;
        let url = localUrl + "/recharge/ios_check";
        let param = {
            appid: config.config.appid,
            uid: config.UID
        }

        if (_callBack === undefined) {
            _callBack = (res) => {
                console.log("！！！inner  single output ", res);
            }
        }

        if (self.callBack === undefined) {
            self.callBack = res => {
                console.log("!!!self  global callback output", res);
            }
        }

        util.request({
            url: url,
            data: param,
            method: 'get',

            success: res => {
                console.log("########check payment state success ", res);
                var _tempData = res.data.data;
                console.log("！！！！！！current user balance", global.accountBalance);

                if (from != undefined || from == 1) {
                    if (res.data.ecode === 0 && _tempData.num !== global.accountBalance) {
                        clearInterval(self.myIntervar);
                        global.accountBalance = _tempData.num;
                        console.log("!!!!!!inside update user balance", global.accountBalance);
                        commonNode.getInstance().addText("充值成功，请稍后查询");
                        self.callBack(res.data);
                    } else {
                        let errorMsg = {
                            data: null,
                            ecode: 601 //检查的余额信息返回不对
                        }

                        self.callBack(errorMsg);
                    }
                } else {
                    if (res.data.ecode == 0) {
                        global.accountBalance = _tempData.num;
                        console.log("!!!!!!external update user balance", global.accountBalance);
                        _callBack(res.data);
                    } else {
                        let errorMsg = {
                            data: null,
                            ecode: 601 //检查的余额信息返回不对
                        }

                        _callBack(errorMsg);
                    }
                }
            },

            fail: res => {
                console.log("!!!!!!!!!!check payment state fail", res);
                let errorMsg = {
                    data: "can`t connect the server",
                    ecode: 602 //检查余额通信失败
                }

                self.callBack(errorMsg);
            }
        });
    },

    /**
     * 使用充值的金额
     * @param {number} amount 要花费的金额
     * @param {function} _callBack 回调函数
     */
    expenseAccountAmount: function (amount, _callBack) {
        let url = localUrl + "/recharge/ios_use";
        let param = {
            appid: config.config.appid,
            uid: config.UID,
            num: amount
        }

        if (_callBack === undefined) {
            _callBack = (res) => {
                console.log("!!!!!!!!!!expense single output ", res);
            }
        }

        util.request({
            url: url,
            data: param,
            method: "get",

            success: res => {
                console.log("!!!!!!!!!!use amount info ", res);
                if (res.data.ecode === 0) {
                    global.accountBalance -= amount;
                    _callBack(res.data);
                } else {
                    let errorMsg = {
                        data: "balance is not plenty",
                        ecode: 607 //请求成功但是使用充值金额失败
                    }
                    _callBack(errorMsg);
                }
            },

            fail: res => {
                console.log("！！！！！！ user amount fail", res);
                let errorMsg = {
                    data: "can`t connect the server",
                    ecode: 604 //向服务器请求使用充值失败
                }
                _callBack(errorMsg);
            }
        });
    },
});

module.exports = Payment;