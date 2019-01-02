var config = require('config');
var userOperate = require('userOperate');
var util = require("util");
var global = require("global");
userOperate = new userOperate();

cc.Class({
    extends: cc.Component,

    properties: {
        tex: [cc.SpriteFrame]
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.btnPos = cc.find('view', this.node);
        this.closeBtn = cc.find('view/close', this.node);
        this.closeBtn.on('click', this.onClose, this);

        setTimeout(function () {
            this.closeBtn.active = true;
        }.bind(this), 3000);

        this.gameIcon = cc.find('view/avatar/mask/img', this.node).getComponent(cc.Sprite);
        cc.loader.loadRes("share/gameIcon", (err, texture) => {
            if (err) {
                console.error('load game icon fail ...', err);
                return;
            }
            let spriteFrame = new cc.SpriteFrame();
            spriteFrame.setTexture(texture);
            this.gameIcon.spriteFrame = spriteFrame;
        });

        let screenSize = cc.view.getFrameSize();
        let yScale = config.officalAccount.height / screenSize.height;
        let xScale = config.officalAccount.width / screenSize.width;

        let width = 320 / xScale;
        let height = 110 / yScale;

        // let x = -width / 2 + screenSize.width / 2;
        // let y = yScale - height / 2 + screenSize.height / 2 - 40;

        let x = -width / 2 + screenSize.width / 2 - 15;
        let y = yScale - height / 2 + screenSize.height / 2 - 40;
        console.log("****输出XY：", x + " ", y);
        // console.log('auth btn x, y:', x, y);

        this.x = x;
        this.y = y;
        this.width = 220 //width;
        this.height = 80 //height;

        // this.authBtn = wx.createUserInfoButton({
        //     type: 'image',
        //     // text: '微信授权',
        //     image: 'res/raw-assets/resources/wx/auth/res/auth_btn.png',
        //     style: {
        //         left: x,
        //         top: y,
        //         width: width,
        //         height: height,
        //         lineHeight: height,
        //     }
        // });
        // this.authBtn.onTap(res => {
        //     console.log('auth btn callback:', res);
        //     if (res.userInfo) {
        //         config.userInfo = res.userInfo;
        //         userOperate.setUserInfo();
        //         this.onClose();
        //     }
        // });
        // this.authBtn.show();

        // this._callback = null;
        this._success = null;
        this._fail = null;
    },

    createAuthBtn() {
        let self = this;
        let _img = cc.url.raw('resources/wx/auth/res/noColor.png');
        if (cc.loader.md5Pipe) {
            _img = cc.loader.md5Pipe.transformURL(_img);
        }
        //console.log(_img);
        let authBtn = wx.createUserInfoButton({
            type: 'image',
            // text: '微信授权',
            image: _img, //'res/raw-assets/resources/wx/auth/res/auth_btn.png',
            style: {
                left: self.x,
                top: self.y,
                width: self.width,
                height: self.height,
                lineHeight: self.height,
            }
        });
        authBtn.onTap(res => {
            console.log('auth btn callback:', res);
            self.onClose(true);
            if (res.userInfo) {
                config.userInfo = res.userInfo;
                userOperate.setUserDataInfo(res.userInfo);
                self.onClose(true);
                if (global.getDoAuView == 2) {
                    //上传统计用户授权率分子
                    util.request({
                        url: config.base_url + "/stat/authorizeStat",
                        header: { 'content-type': 'application/x-www-form-urlencoded' },
                        method: 'POST',
                        data: {
                            appid: config.config.appid,
                            type: 2,
                        },
                        success: function (res) {
                            console.log("成功发送收集授权的分子", res);

                        },
                        fail: function (er) {
                            console.log("发送收集授权的分子失败");
                        }
                    });
                    global.getDoAuView = 3;
                }
            }
        });
        return authBtn;
    },

    start() {
        if (this.changeBool) {
            this.signTipsIcon = cc.find('btnPos', this.node).getComponent(cc.Sprite);
            this.signTipsIcon.spriteFrame = this.tex[1];
        }

        this.show();
    },

    init(success, fail, changeBool) {
        // this._callback = callback;
        this._success = success;
        this._fail = fail;
        this.changeBool = changeBool;
    },

    show() {
        // this.authBtn.show();
        this.node.active = true;
        this.authBtn = this.createAuthBtn();
    },

    onClose(authFlag) {
        this.authBtn.hide();
        if (this.authBtn != null) this.authBtn.destroy();
        global.showAuthLy = 0;
        if (authFlag === true) {
            console.log('auth view success callback!');
            if (this._success && typeof this._success == 'function') {
                this._success();
            }
        } else {
            console.log('auth view fail callback!');
            if (this._fail && typeof this._fail == 'function') {
                this._fail();
            }
        }
        this.node.active = false;
    }

    // update (dt) {},
});