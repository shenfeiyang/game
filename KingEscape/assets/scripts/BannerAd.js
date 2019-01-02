// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

//const bannerId = "adunit-a2084675990f9b29";//广告id，自定义
const bannerId = require("config").bannerId;

var qqPlay = require('qqPlay');
var global = require('global');
const myAssist = require('myAssist').getInstance();
const adc = require("adc");
const config = require("config");
const preview = require("preview");
const wxAd = require("wxAd");

let bannerErr = 0;
let adTime = global.getUserDataInfoByName('adTime') ? global.getUserDataInfoByName('adTime') / 1000 : 60;     //loop 周期
let replace = !!global.getUserDataInfoByName('adTime');
//const replace = true;
let bannerWidth = config.bannerWidth;
const bannerTop = config.bannerTop;
const bannerScale = config.bannerScale;
let bannerType = 0;

const border = 5;
const space = 5;
const dsgSize = config.officalAccount ? config.officalAccount : { width: 1136   , height: 640 };
const dp = 3.51;
const fullWidth = 450;//顶宽宽度

let BannerSize = cc.size(0, 0);

var wxBversionLess = (vs) => {
    if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        let bVersion = wx.getSystemInfoSync().SDKVersion;
        var vs2vn = (vs) => {
            return parseInt(vs.split(".").join("").slice(0, 3));
        }
        return vs2vn(bVersion) < vs2vn(vs);
    }
    return true;
};

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        bgNode: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._reSize = cc.size(0, 0);
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            this.createBannerNode();
            const screenSize = cc.view.getFrameSize();
            if (screenSize.height / screenSize.width > 2.0) this._fullScreen = true;
            console.log(screenSize.height / screenSize.width);
            adTime = global.getUserDataInfoByName('adTime') ? global.getUserDataInfoByName('adTime') / 1000 : 60;     //loop 周期
            replace = !!global.getUserDataInfoByName('adTime');
        }

    },

    createBannerNode() {
        bannerType = adc.getBannerAdType();
        console.log('createBannerNode', bannerType);
        if (bannerType == 1) {
            myAssist.loadBannerLayerNew(this, "banner_1", () => {
                const bannerNode = this['bannerNode'];
                //bannerNode.on("click", this.onClicked, this);
                //this.replace();
                this.setbannerPos();
            });
        } else if (bannerType == 2) {
            myAssist.loadBannerLayerNew(this, "banner_2", () => {
                const bannerNode = this['bannerNode'];
                //bannerNode.on("click", this.onClicked, this);
                //this.replace();
                this.setbannerPos();
            });
        } else {
            // myAssist.loadBannerLayer(this, "bannerNodeBase", () => {
            //     const bannerNode = this['bannerNodeBase'];
            //     bannerNode.on("click", this.onClicked, this);
            //     this.replace();
            // });
        }
        myAssist.loadBannerLayer(this, "bannerNodeBase", () => {
            const bannerNodeBase = this['bannerNodeBase'];
            bannerNodeBase.on("click", this.onClicked, this);
            bannerNodeBase.active = false;
            if (!bannerType) {
                //this.replace();
            }
            this.setbannerPos();
        });

    },
    replace: function () {
        this.destroyIt();
        bannerErr = 0;
        const bannerAd = this.create();
        const screen = wx.getSystemInfoSync();
        const _fullScreen = this._fullScreen;
        if (!(bannerWidth <= 0 || this._fullWidth) && config.bannerLowest)
            bannerAd.onResize(function (res) {
                bannerAd.style.left = (screen.screenWidth - res.width) / 2;
                bannerAd.style.top = screen.screenHeight - res.height - (!!_fullScreen ? 30 : 0);
                //console.log(_fullScreen, "%%%%%%%%%%%%%%%replace%%%%%%%%%%%%%%%%")
            })
        this._bannerAd = bannerAd;
        this.refresh();
        bannerAd.onError(err => {
            console.log("%%%%%%%%%%%%%%%%%%%%%%%%%banner err");
            bannerErr = 1;
        })
    },
    //创建广告
    //创建广告
    create: function () {
        //if (cc.sys.platform == cc.sys.WECHAT_GAME ) {
        let self = this;
        if (!wxBversionLess("2.0.4")) {


            let myWidth = 0; //屏幕宽度
            let myHeight = 0;//屏幕高度
            let adHeight = 0; //广告高度

            //得到屏幕尺

            let res = wx.getSystemInfoSync()
            myWidth = res.screenWidth;
            myHeight = res.screenHeight;
            console.log(res)
            if (res.platform == 'ios') {
                if (typeof config.iosBannerWidth == 'number') {
                    bannerWidth = config['iosBannerWidth'];
                }
                if (bannerWidth <= 0 || this._fullWidth) {
                    if (typeof config.iosBannerScale == 'number') {
                        bannerWidth = myWidth * config.iosBannerScale;
                        if (bannerWidth < 300) {
                            bannerWidth = 300;
                        }
                    }
                }
            } else {
                if (bannerWidth <= 0 || this._fullWidth) {
                    if (typeof config.androidBannerScale == 'number') {
                        bannerWidth = myWidth * config.androidBannerScale;
                        if (bannerWidth < 300) {
                            bannerWidth = 300;
                        }
                    }
                }
            }
            let dh = myHeight - bannerTop;

            let dw = (myWidth - bannerWidth) / 2;
            let width = bannerWidth;
            if (bannerWidth <= 0 || this._fullWidth) {
                dh = myHeight - myWidth / 3.0;
                dw = 0;
                width = myWidth;
            }
            else {
                //dh = myHeight - bannerTop * Math.min(bannerWidth / myWidth, 1.0);
                //dw = Math.max(0.0, dw)
            }
            console.log('self._reSize.w', self._reSize, self._reSize.width, self._reSize.h)
            const top = dh - (this._fullScreen ? 30 : 0);

            BannerSize.height = top;
            BannerSize.width = dw;
            if (cc.director.getScene().getName() == config.loginScene) {
                dw = 0;
            }
            const bannerAd = wx.createBannerAd({
                adUnitId: bannerId,
                style: {
                    left: dw + self._reSize.width,
                    top: top + self._reSize.height,
                    width: width,
                    //height: 50,
                }
            })
            const w = width / myWidth * dsgSize.width + border * 2;
            const h = w / dp + space * 2;
            const x = 0;    //居中
            //const y = h / 2 - dsgSize.height / 2;
            const realHeight = myHeight / myWidth * dsgSize.width;
            const y = -(top / myHeight * realHeight - realHeight / 2) + space;
            console.log("%%%%%%%%%%%%%%", dw, top, width, myWidth, myHeight);
            console.log("%%%%%%%%%%%%%%real", w, h, x, y);
            this.gdtData = { w: w, h: h, pos: cc.v2(x, y) };
            return bannerAd;
        }
    },
    //重新设置bannerAd 的偏移量，向上，向左；
    setAdResize(offTop = 0, offLeft = 0) {
        this._reSize.height = - offTop;
        this._reSize.width = offLeft;
        if (this._bannerAd) {
            this._bannerAd.style.top += this._reSize.height;
            this._bannerAd.style.left += this._reSize.width;
        }

    },

    setbannerPos() {
        if (cc.director.getScene().getName() == config.loginScene) {
            if (this['bannerNode']) {
                let x = -(dsgSize.width - this.bannerNode.getContentSize().width) / 2;
                let dy = -0.5 * dsgSize.height;
                dy += this['bannerNode'].height / 2;
                this['bannerNode'].setPosition(cc.v2(x, dy));;
            }
            if (this['bannerNodeBase']) {
                this['bannerNodeBase'].setPosition(cc.v2());
                let x = -(dsgSize.width - this.bannerNodeBase.getContentSize().width) / 2;
                let dy = -0.5 * dsgSize.height;
                dy += this['bannerNodeBase'].height / 2;
                this['bannerNodeBase'].setPosition(cc.v2(x, dy));;
            }
        }
    },

    // 恢复为默认位置;
    resumeAdResize() {
        this._reSize.width = 0;
        this._reSize.height = 0;
        if (this._bannerAd) {
            this._bannerAd.style.top = BannerSize.height;
            this._bannerAd.style.left = BannerSize.width;
        }
    },
    //显示开关
    show: function () {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            //if (this._bannerAd) this._bannerAd.show();
            this._showBannerAd = true;
            this.refresh();
        }
        else if (cc.sys.platform == cc.sys.QQ_PLAY) {
            if (!this._showBannerAd) {
                this._showBannerAd = true;
                qqPlay.showBannerAd();
            }
        }
    },
    hide: function () {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            //if (this._bannerAd) this._bannerAd.hide();
            this._showBannerAd = false;
            this.refresh();
        }
        else if (cc.sys.platform == cc.sys.QQ_PLAY) {
            if (this._showBannerAd) {
                this._showBannerAd = false;
                qqPlay.hideBannerAd();
            }
        }
    },
    timer: function () {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            console.log("~~~~~~~~~~adTime is ~~~~~~~~~~", global.getUserDataInfoByName('adTime'), adTime);
            replace ? this.replace() : this.refresh();
        } else if (cc.sys.platform == cc.sys.QQ_PLAY) {
            console.log("~~~~~~~~~~adTime is ~~~~~~~~~~" + this._showBannerAd);
            //if (this._showBannerAd) {
            qqPlay._playBannerAD();
            //}

        }

    },
    //设置默认底部banner为第一种模式: true/false
    setBaseBannerAd(flag) {
        this._baseBannerAd = flag;
        if (!flag) {
            if (this['bannerNodeBase']) {
                this['bannerNodeBase'].active = false;
            }
        } else if (this['bannerNode']) {
            this['bannerNode'].active = false;
        }
        this.replace();
    },
    //轮询开关
    startLoop: function () {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            this.replace();
            this.show();
            this.schedule(this.timer, adTime);
            if (!bannerId) this.scheduleOnce(() => this.timer(), 3);
        }
        else if (cc.sys.platform == cc.sys.QQ_PLAY) {
            this.schedule(this.timer, adTime);
            this._showBannerAd = true;
            console.log("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD" + qqPlay._bannerAd + adTime);
            qqPlay._bannerAd = true;
            qqPlay._playBannerAD();
        }
    },
    stopLoop() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME)
            this.unschedule(this.timer, this);
        //this.hide();
        else if (cc.sys.platform == cc.sys.QQ_PLAY)
            this.unschedule(this.timer, this);
    },

    fullWidth(full) {
        this._fullWidth = !!full;
        this.replace();
    },
    /*
    refresh:function(){
        if(this._bannerAd) this._showBannerAd ? this._bannerAd.show() : this._bannerAd.hide();
    },*/
    //{@force::广点通广告是否加载失败}
    refresh: function (_, force) {
        
        //if(this._bannerAd) this._showBannerAd ? this._bannerAd.show() : this._bannerAd.hide();
        const bannerAd = force ? null : this._bannerAd;

        const bannerNode = this['bannerNode'];//this._baseBannerAd ? this['bannerNodeBase'] : (bannerType ? this['bannerNode'] : this['bannerNodeBase']);
        
        //console.log("refresh bannerAd:", bannerAd, "|bannerNode:", bannerNode);
        if (this._bannerAd) this._bannerAd.hide();
        if (bannerNode) bannerNode.active = false;
        if (this.bgNode) this.bgNode.active = false;

        const fail = (err) => {
            console.log('fail showBannerAd');
            this.refresh(_, true)
        }
        this._fail = true;
        if (!force) this.scheduleOnce(() => this._fail ? fail() : null, 3);
        if (this._showBannerAd) {
            const list = this._baseBannerAd ? adc.getBannerAdInfo() : (bannerType == 1 ? adc.getFarvorPlayInfo() : (bannerType == 2 ? adc.getLoopBannerInfo() : adc.getBannerAdInfo()));
            const just = adc.justgdt();
            console.log("bannerAdInfo <><><><><><><", list.length, !!bannerAd, !!this._bannerAd, force, just, !!bannerNode, bannerErr);
            if (!bannerErr || list.length <= 0 || !bannerNode || (just && !force)) {
                console.log("banner show", bannerAd);
                let self = this;
                if (bannerAd) {
                    bannerAd.show().then(() => {
                        this._fail = false;
                        //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%, banner show success%%%%%%%%%%%%%%%")
                        if (this.bgNode) {
                            this.bgNode.setContentSize(this.gdtData.w, this.gdtData.h);
                            this.bgNode.setPosition(this.gdtData.pos);
                            this.bgNode.active = this._showBannerAd;
                        }
                    }).catch((err) => {
                        console.log("bannerAd.showFail2");
                        self._fail = false;
                        fail();
                    }
                        );
                }

            }
            else if (list.length > 0 && bannerNode) {
                this._fail = false;
                //reduce
                if (!this._baseBannerAd) {
                    if (bannerType == 1) {
                        bannerNode.getComponent('banner_1').init(list, this.gdtData);
                        bannerNode.active = true;
                        return;
                    } else if (bannerType == 2) {
                        bannerNode.getComponent('banner_2').init(list, this.gdtData);
                        bannerNode.active = true;
                        return;
                    }
                }

                console.log("not show showBanner next");
                let total = 0;
                const list2 = force ? list.map(info => adc.getSpriteFrame(info.url) ? info : { wt: 0 }) : list;
                list2.map((info) => {
                    total += Number(info['wt']);
                });
                let r = null;
                let p = Math.random();
                //console.log("random is ", p);
                list2.map((info) => {
                    p -= Number(info['wt']) / total;
                    if (p <= 0 && !r) r = info;
                })
                console.log(r, bannerNode);
                const spriteFrame = r ? adc.getSpriteFrame(r.url) : null;
                if (spriteFrame) {
                    bannerNode.setScale(this._fullScreen ? 1.0 : bannerScale);
                    if (!bannerNode.getComponent(cc.Sprite)) {
                        bannerNode.addComponent(cc.Sprite);
                    }
                    bannerNode.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    bannerNode.active = true;
                }
                else if (bannerAd) {
                    bannerAd.show().then(() => {
                        this._fail = false;
                        //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%, banner show success%%%%%%%%%%%%%%%")
                        if (this.bgNode) {
                            this.bgNode.setContentSize(this.gdtData.w, this.gdtData.h);
                            this.bgNode.setPosition(this.gdtData.pos);
                            this.bgNode.active = this._showBannerAd;
                        }
                    }).catch(fail);
                }

                this._info = r;
                //console.log(r, adc.getSpriteFrame(list2));
            }
        }
    },
    onClicked: function (event) {
        console.log("clicked ", event)
        const data = this._info ? this._info : {};
        const resid = data['id'];
        const jmpid = data['jmpid'];
        var parm = data['parm'];
        parm = parm.indexOf('?') > 0 ? parm : parm + '?';
        parm = parm.indexOf('gender') > 0 ? parm : parm + '&gender=' + global.getGender();
        const share = data['share'];
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            if (jmpid && !wxAd.wxBversionLess("2.2.0"))
                //do some thing;
                wx.navigateToMiniProgram({
                    appId: jmpid,
                    path: parm,
                    success: (res) => {
                        console.log(res);
                    },
                    fail: (res) => {
                        if (adc.checkLink(share) && res.errMsg.indexOf(jmpid) > 0)
                            preview.previewUrlImage(share);
                    }
                });
            else if (adc.checkLink(share))
                preview.previewUrlImage(share);
        }
        this.refresh();

    },

    destroyIt: function () {
        if (this._bannerAd) {
            let old = this._bannerAd;
            this._bannerAd = null;
            old.hide();
            old.destroy();
        }
    },
    onDestroy: function () {
        this.unscheduleAllCallbacks();
        this.destroyIt();
        const bannerNode = this['bannerNodeBase'];
        if (bannerNode) bannerNode.off("click", this.onClicked, this)
        if (cc.sys.platform == cc.sys.QQ_PLAY) {
            qqPlay.hideBannerAd();
        }
    },
    start() {

    },

    // update (dt) {},
});
