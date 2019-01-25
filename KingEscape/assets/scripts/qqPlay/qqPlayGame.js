var config = require('config');

if(cc.sys.platform == cc.sys.QQ_PLAY){
    new BK.Game({
        //游戏启动后
        onLoad: function (app) {
            console.log('onLoad Game');
        },
        //进入点击最大化后
        onMaximize: function (app) {
            BK.Script.log(0, 0, "onMaxmize");
        },
        //进入点击最小化后
        onMinimize: function (app) {
            BK.Script.log(0, 0, "onMinmize");
        },
        //进入后台后响应
        onEnterBackground: function (app) {
            BK.Script.log(0, 0, "onEnterbackground");
        },
        //回到前台后响应
        onEnterForeground: function (app) {
            BK.Script.log(0, 0, "onEnterforeground");
        },
        //点击“分享游戏”后响应。（可选）
        onShare: function (app) {

            var _titleIndex = (Math.floor(Math.random() * 10)) % config.shareTitles['1'].length;
            let _title = config.shareTitles['1'][_titleIndex].title;

            let _index = (Math.floor(Math.random() * 10)) % config.qqPlayUrl.length;
            let _urls = config.qqPlayUrl[_index];
            var picUrl = _urls;
            
            var extendInfo = "extendInfomation";

            let savedUrl = [{ url: cc.url.raw('resources/share/share1.jpg') },
            { url: cc.url.raw('resources/share/share2.jpg') }];
            var _saveIndex = (Math.floor(Math.random() * 10)) % savedUrl.length;
            var savedPath = "GameSandBox://" + savedUrl[_saveIndex].url;
            
            var shareInfo = {
                summary: _title,
                picUrl: picUrl,
                extendInfo: extendInfo,
                localPicPath: savedPath
            };
            console.log('onShare' + JSON.stringify(shareInfo));
            return shareInfo;
        },
        //分享成功
        onShareComplete: function (app, retCode, shareDest, isFirstShare) {
            console.log("onShareComplete" + retCode)
            if (retCode == 0) {
                var dest = "";
                if (shareDest == 0 /* QQ */) {
                    dest = "QQ";
                }
                else if (shareDest == 1 /* QZone */) {
                    dest = "空间";
                }
                else if (shareDest == 2 /* WX */) {
                    dest = "微信";
                }
                else if (shareDest == 3 /* WXCircle */) {
                    dest = "朋友圈";
                }
                BK.Script.log(1, 1, "成功分享至" + dest);
            }
            else {
                BK.Script.log(1, 1, "分享失败");
            }
        },
        //进入点击关闭响应
        onClose: function (app) {
            BK.Script.log(0, 0, "onClose");
        },
    });
}

