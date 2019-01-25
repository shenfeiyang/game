var tokenMgr = require('tokenMgr');
var urls = require('route').urls;
var md5 = require('md5');
var config = require('config');
var global = require('global');
//var WXBizDataCrypt = require('WXBizDataCrypt');

const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

const randomStr = n => {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyz".split('');
    var res = "";
    for (var i = 0; i < n; i++) {
        res = res + chars[(Math.random() * 1e3 | 0) % chars.length];
    }
    return res;
}

// 获取本次登录的会话密钥
const getSession = function (callback) {
    wx.login({
        success: res => {
            console.log('wx login success:', res);
            let code = res.code;
            wx.request({
                url: 'https://api.weixin.qq.com/sns/jscode2session',
                data: {
                    appid: config.config.appid,
                    secret: config.config.appsecret,
                    js_code: code,
                    grant_type: 'authorization_code'
                },
                success: res => {
                    console.log('get session key success:', res);
                    // self.session_key = res.data.session_key;
                    config.sessionkey = res.data.session_key;
                    if (callback && typeof callback == 'function') {
                        callback();
                    }
                },
                fail: res => {
                    console.log('get session key fail:', res);
                }
            });
        },
        fail: res => {
            console.log('wx login fail:', res);
        }
    });
}

const decodeOpenId = function (res, callback) {
    checkSession(function () {
        console.log('config.sessionkey:', config.sessionkey);
        if (config.sessionkey && config.sessionkey != '') {
            // let pc = new WXBizDataCrypt(config.config.appid, config.sessionkey);
            // let data = pc.decryptData(res.encryptedData, res.iv);
            // console.log('解密后openid: ', data);
            // if(data && data["openGId"]){
            //     // return data;
            //     if (callback && typeof callback == 'function') {
            //         callback(data.openGId);
            //     }
            // }
        }
    });
}

const checkSession = function (callback) {
    wx.checkSession({
        success: res => {
            console.log('check session success', res);
            if (config.sessionkey == '') {
                getSession(callback);
            } else {
                if (callback && typeof callback == 'function') {
                    callback();
                }
            }
            // if (res.errMsg != 'checkSession:ok') {
            //     getSession(callback);
            // } else if (res.errMsg == 'checkSession:ok') {

            // }
        },
        fail: res => {
            console.log('check session fail', res);
            getSession(callback);
        }
    });
}
/**
 * 不联网 本地获取OpenID 
 * @param {*} code 
 */
const getLocalOpenID = function (code) {
    wx.request({
        url: 'https://api.weixin.qq.com/sns/jscode2session',
        data: {
            appid: config.config.appid,
            secret: config.config.appsecret,
            js_code: code,
            grant_type: 'authorization_code'
        },
        success: res => {
            console.log('get session key success:', res);
            // self.session_key = res.data.session_key;
            config.sessionkey = res.data.session_key;
            config.UID = res.data.openid;

        },
        fail: res => {
            console.log('get session key fail:', res);
        }
    });
}

const reLogin = function () {
    wx.login({
        success: res => {
            var param = config.getParam();
            param["appsign"] = sign(param);
            param["js_code"] = res.code;
            request({
                url: urls.login,
                data: param,
                success: function (res) {
                    console.log("relogin +", res);
                    if (res.data["uid"]) {
                        let auth = require('auth').getInstance();
                        auth.showAuthView(function () {
                            var d = res.data;
                            if (d && (d.ecode == 0 || d.ecode == 2)) {
                                console.log("relogin +", res)
                                if (res.data["uid"]) {
                                    config.UID = res.data["uid"];
                                }
                                if (res.data['sessionkey']) {
                                    config.sessionkey = res.data.sessionkey;
                                }
                                reloginGetUserInfo();
                            }
                        });
                    }
                },
            })
        },
        fail: res => {
            console.log(res)
        }
    })
};

const reloginGetUserInfo = function () {
    var url = urls.user + "/get_user";
    var param = {};//config.getParam();
    request({
        url: url,
        data: param,
        method: 'GET',
        success: res => {
            //服务器存储的用户数据
            console.log("getUserData", res)
            global.setUserDataInfo(res.data.data)
        },
    })
};

const requestWithCheck = function (p) {
    if (!!!config.gamecenter_link) {
        let fail = p.fail || function (err) { };
        fail();
        return;
    }

    // 未登录
    if (!tokenMgr.checkToken()) {
        console.log('go to first login ...');
        let login = require('login');
        login.firstLogin(function () {
            console.log('first login succeed ...');
            request(p);
        }, function () {
            console.log('first login failed ...');
            let fail = p.fail || function (err) { };
            fail();
        });
    } else {
        console.log('has already login ...');
        request(p);
    }
};

const request = p => {
    if (cc.sys.platform != cc.sys.WECHAT_GAME) {
        return;
    }

    if (!!!config.gamecenter_link) {
        var fail = p.fail || function (err) { };
        fail();
        return;
    }
    var url = p.url;
    var data = p.data || {};
    var header = p.header || {};
    var method = p.method || 'GET';
    var dataType = p.dataType || "";
    var success = p.success || function (res) { };
    var fail = p.fail || function (err) { };
    var complete = p.complete || function () { };
    if (tokenMgr.checkToken()) {
        header.token = tokenMgr.getToken();
    } else {
        // //非登录接口
        // if(!data["js_code"]){
        //     console.log("js_code fails")
        //     fail();
        //     reLogin();
        //     return;
        // }
    }
    console.log(url, p, header.token)
    wx.request({
        url: url,
        data: data,
        header: header,
        method: method,
        dataType: dataType,
        success: function (res) {
            if (res.data["token"]) {
                tokenMgr.setToken(res.data.token);
            }

            if (res.statusCode != 200) {
                console.error('response error:', res.statusCode);
                fail(res);
                return;
            }

            success(res);
        },
        fail: function (res) {
            console.log("fail", res)
            fail(res);
            tokenMgr.setToken(null);
        },
        complete: complete
    })
};
/**
 * 走服务器 获取 sessionKey, 解析私密信息；
 * @param {*} p 
 */
const requestSpecial = p => {
    if (cc.sys.platform != cc.sys.WECHAT_GAME) {
        return;
    }
    var url = p.url;
    var data = p.data || {};
    var header = p.header || {};
    var method = p.method || 'GET';
    var dataType = p.dataType || "";
    var success = p.success || function (res) { };
    var fail = p.fail || function (err) { };
    var complete = p.complete || function () { };
    if (tokenMgr.checkToken()) {
        header.token = tokenMgr.getToken();
    }
    console.log(url, p, header.token)
    wx.request({
        url: url,
        data: data,
        header: header,
        method: method,
        //dataType: dataType,
        success: function (res) {
            if (res.data["token"]) {
                tokenMgr.setToken(res.data.token);
            }

            if (res.statusCode != 200) {
                console.error('response error:', res.statusCode);
                fail(res);
                return;
            }

            success(res);
        },
        fail: function (res) {
            console.log("wx.request fail", res)
            fail(res);
            tokenMgr.setToken(null);
        },
        complete: complete
    })
};
/**
 *向服务器请求 获得 seeSionKey 
 * @param {*} code 
 * @param {*} callBack 
 */
const getGameSeesionkey = function (code, callBack, failCallBack) {
    if (cc.sys.platform != cc.sys.WECHAT_GAME) {
        return;
    }
    var param = config.getParam();
    param["appsign"] = sign(param);
    param["js_code"] = code;
    requestSpecial({
        url: urls.decodeGroup + "/getSeesionkey",
        data: param,
        success: function (res) {
            console.log(res);
            var d = res.data;
            if (d && (d.ecode == 0 || d.ecode == 2)) {
                console.log("login +", res)
                if (res.data["uid"]) {
                    config.UID = res.data["uid"];
                }
                if (res.data['sessionkey']) {
                    config.sessionkey = res.data.sessionkey;
                } else {
                    console.fail("getGameSeesionkey", res);
                    if (failCallBack && typeof failCallBack == 'function') failCallBack();
                }
                if (res.data["openid"]) {
                    config.openGId = res.data["openid"];
                }
            }
        },
        fail: function (er) {
            console.error("getGameSeesionkey", er);
            if (failCallBack && typeof failCallBack == 'function') failCallBack();
            //if (fail && typeof fail == 'function') fail();
        }
    });
};
/**
 *  服务器解密；
 * @param {*} data 
 * @param {*} callBack 
 */
const getGroupDecode = function (data, callBack, failCallBack) {

    wx.checkSession({
        success: function (res) {
            var param = config.getParam();
            param["appsign"] = sign(param);
            param["sessionKey"] = config.sessionkey;
            param["encryptedData"] = data.encryptedData;
            param["iv"] = data.iv;
            requestSpecial({
                url: urls.decodeGroup + "/groupDecode",
                data: param,
                success: function (res) {
                    console.log("getGroupDecode", res);
                    if (res.data["openGId"]) {
                        config.groupOpenGID = res.data.openGId
                    }
                    if (callBack && typeof callBack == 'function' && res.data["openGId"]) {
                        callBack(res.data.openGId);
                    } else {
                        if (failCallBack && typeof failCallBack == 'function') failCallBack();
                    }
                },
                fail: function (er) {
                    console.error("getGroupDecode 1", er);
                    if (failCallBack && typeof failCallBack == 'function') failCallBack();
                }
            });
        },
        fail: function (res) {
            console.log("sessionKey fail")
            wx.login({
                success: res => {
                    getGameSeesionkey(res.code, function () {
                        getGroupDecode(data, callBack, failCallBack)
                    }, failCallBack)
                }
            })

        }
    })


};
// 请求服务器配置
const requestSvrCfg = p => {
    if (cc.sys.platform != cc.sys.WECHAT_GAME) {
        return;
    }
    var url = p.url;
    var data = p.data || {};
    var header = p.header || {};
    var method = p.method || 'GET';
    var dataType = p.dataType || "";
    var success = p.success || function (res) { };
    var fail = p.fail || function (err) { };
    var complete = p.complete || function () { };

    wx.request({
        url: url,
        data: data,
        header: header,
        method: method,
        dataType: dataType,
        success: function (res) {
            console.log("requestSvrCfg", res)
            if (res.statusCode != 200) {
                console.error('response error:', res.statusCode);
                fail(res);
                return;
            }

            success(res);
        },
        fail: function (res) {
            console.log("requestSvrCfg fail", res)
            fail(res);
        },
        complete: complete
    })
};


const key = config.config.appsecret;
const appId = config.config.appid;

/**
 * 微信支付签名
 * @param {*代签名object} p
 */
const sign = p => {
    var list = new Array();
    for (var item in p) {
        var type = typeof p[item];
        if (type == "string" || type == "number") {
            var tmp = item + "=" + p[item];
            list.push(tmp);
        }
    }
    list.sort(function (o0, o1) {
        return o0 > o1;
    });
    list.push("key=" + key);
    var res = list.join("&");
    console.log("sign_source:" + res);
    return md5.md5(res);
}

const getXMLNodeValue = function (node_name, xml) {
    console.log("xml:" + xml);
    var tmp = xml.split("<" + node_name + ">")
    var _tmp = tmp[1].split("</" + node_name + ">")
    return _tmp[0]
};

const randomString = function () {
    var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = chars.length;
    var pwd = '';
    for (var i = 0; i < 32; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
};

const createTimeStamp = function () {
    return parseInt(new Date().getTime() / 1000) + ''
};

/**
 * 微信支付
 * @param {*} fee 支付额度，单位分
 * @param {*} success 支付成功
 * @param {*} fail 支付失败
 * @param {*} complete 支付完成
 */
const _pay = function (fee, success, fail, complete) {
    fee = fee || 1;
    success = success || function (res) { };
    fail = fail || function () { };
    complete = complete || function () { };

    const url_unifiedOrder = urls.unifiedOrder;
    const wx_unifiedOrder = "https://api.mch.weixin.qq.com/pay/unifiedorder";
    request({
        url: url_unifiedOrder,
        data: {
            fee: fee
        },
        success: function (res) {
            console.log("UNIFIEDORDER:" + JSON.stringify(res));
            request({
                url: wx_unifiedOrder,
                data: res.data,
                method: "POST",
                success: function (res) {
                    var xml = res.data;
                    var return_code = getXMLNodeValue('return_code', xml.toString("utf-8"));
                    var returnCode = return_code.split('[')[2].split(']')[0];
                    if (returnCode == 'FAIL') {
                        var err_code_des = getXMLNodeValue('err_code_des', res.data.toString("utf-8"))
                        var errDes = err_code_des.split('[')[2].split(']')[0]
                        fail();
                    } else {
                        var prepay_id = getXMLNodeValue('prepay_id', res.data.toString("utf-8"));
                        var tmp = prepay_id.split('[');
                        var tmp1 = tmp[2].split(']');
                        var timeStamp = createTimeStamp(); //时间戳
                        var nonceStr = randomString(); //随机数
                        var dat = {
                            appId: appId,
                            nonceStr: nonceStr,
                            package: "prepay_id=" + tmp1[0],
                            signType: "MD5",
                            timeStamp: timeStamp,
                        };
                        dat.paySign = sign(dat).toUpperCase();
                        wx.requestPayment({
                            timeStamp: dat.timeStamp,
                            nonceStr: dat.nonceStr,
                            package: dat.package,
                            signType: dat.signType,
                            paySign: dat.paySign,
                            success: success,
                            fail: fail,
                            complete: complete
                        });
                    }
                },
                fail: function () { },
                complete: function () { }
            });
        },
        fail: function () { },
        complete: function () { }
    });
}

/**
 * 微信支付
 * @param {*} fee 支付额度，单位分
 * @param {*} success 支付成功
 * @param {*} fail 支付失败
 * @param {*} complete 支付完成
 */
const pay = function (fee, success, fail, complete) {
    fee = fee || 1;
    success = success || function (res) { };
    fail = fail || function () { };
    complete = complete || function () { };

    request({
        url: urls.pay,
        method: "POST",
        data: {
            fee: fee
        },
        success: function (res) {
            var d = res.data;
            console.log("pay response:" + JSON.stringify(d));
            if (d && d.ecode == 0) {
                var dat = d.data.args;
                console.log(dat)
                wx.requestPayment({
                    timeStamp: dat.timeStamp,
                    nonceStr: dat.nonceStr,
                    package: dat.package,
                    signType: dat.signType,
                    paySign: dat.paySign,
                    success: success,
                    fail: fail,
                    complete: complete
                });
            }
        },
        fail: function () { },
        complete: function () { }
    });
}

/**
 * 向服务器请求数据
 * @param {*} p 不依靠登录进行服务器请求
 */
const wxRequest = p => {
    if (cc.sys.platform != cc.sys.WECHAT_GAME) {
        return;
    }
    var url = p.url;
    var data = p.data || {};
    var header = p.header || {};
    var method = p.method || 'GET';
    var dataType = p.dataType || "";
    var success = p.success || function (res) { };
    var fail = p.fail || function (err) { };
    var complete = p.complete || function () { };
    wx.request({
        url: url,
        data: data,
        header: header,
        method: method,
        dataType: dataType,
        success: function (res) {
            success(res);
        },
        fail: function (res) {
            console.log("fail", res)
            fail(res);
        },
        complete: complete
    })
}


module.exports = {
    formatTime: formatTime,
    randomStr: randomStr,
    randomString: randomString,
    request: request,
    requestSvrCfg: requestSvrCfg,
    requestWithCheck: requestWithCheck,
    sign: sign,
    pay: pay,
    reLogin: reLogin,
    reloginGetUserInfo: reloginGetUserInfo,
    getSession: getSession,
    checkSession: checkSession,
    decodeOpenId: decodeOpenId,
    getLocalOpenID: getLocalOpenID,
    requestSpecial: requestSpecial,
    getGameSeesionkey: getGameSeesionkey,
    getGroupDecode: getGroupDecode,
    wxRequest: wxRequest,
}