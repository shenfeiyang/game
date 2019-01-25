var config = require('config');
var operate = require('userOperate');
operate = new operate();
let mself = {
    wxBversionLess: (vs) => {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            let bVersion = wx.getSystemInfoSync().SDKVersion;
            var vs2vn = (vs) => {
                return parseInt(vs.split(".").join("").slice(0, 3));
            }
            return vs2vn(bVersion) < vs2vn(vs);
        }
        return true;
    },
    //@func1::()->* success callBack
    //@func2::bool->* fail callBack {@parm} 广告播放是否被打断 
    playAd: (func1, func2, target, pointId = -1) => {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            mself._target = target;
            if (!mself.wxBversionLess("2.0.4")) {
                let videoAd = wx.createRewardedVideoAd({
                    adUnitId: config.adUnitId,
                })
                let callBack = (status) => {
                    if (mself._target) {
                        mself._target._isPlay = false;
                    }
                    videoAd.offClose(callBack);
                    if (status && status.isEnded || status === undefined) {
                        if (typeof func1 == "function") {
                            operate.reportVideo(pointId, 0)
                            func1();
                        }
                    } else {
                        if (typeof func2 == "function") func2(true);
                    }

                }
                videoAd.load()
                    .then(() => { videoAd.onClose(callBack); operate.reportVideo(pointId, 1); return videoAd.show() })
                    .catch(err => { //fail
                        if (typeof func2 == "function") func2();
                        console.log(err.errMsg);
                    })
            } else { //基础库低于2.0.4 fail
                if (mself._target) {
                    mself._target._isPlay = false;
                }
                if (typeof func2 == "function") func2();
            }
        } else { //非微信平台，success
            if (typeof func1 == "function") func1();
        }
    },
}
module.exports = mself;