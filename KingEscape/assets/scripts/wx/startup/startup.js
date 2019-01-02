// import vconsole from 'vconsole.min';
// if (cc.sys.platform != cc.sys.WECHAT_GAME){
//     window.vConsole = new vconsole({
//         defaultPlugins: ['system', 'network', 'storage'], // 可以在此设定要默认加载的面板
//         maxLogNumber: 1000
//         });
// }
var login = require('login');
var util = require('util');
var tokenMgr = require('tokenMgr');
var config = require('config');
var qqPlay = require('qqPlay');
var global = require("global");
var consume = require('consume').getInstance();
var ad = require('ad');
var adtask = require("adtask");
var MSG = require('messageId');
// var auth = require('auth').getInstance();
var userOperate = require('userOperate');
userOperate = new userOperate();
var share = require("share");
var localStorage = require('localStorage');

var qqSvrRequest = require('qqSvrRequest');
const adc = require("adc");

var payment = require("Payment");

var self = null;
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        self = this;
        this.startupImage = cc.find('startup', this.node);
        this.toLoadScene = config.loginScene;
        //玩一玩 排行榜key
        global.loadQQRankey();
        // 预加载场景
        // if(cc.sys.platform == cc.sys.WECHAT_GAME){
        //     if (config.gamecenter_open) {
        //         this.toLoadScene = 'gameWxLoading';
        //     } else {
        //         this.toLoadScene = config.loginScene;
        //     }
        // } else {
        //     this.toLoadScene = config.loginScene;
        // }
        cc.director.preloadScene(this.toLoadScene, function () {
        });
    },

    start() {
        //var self = this;
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            //self._rank = new rank();
            //self._share = new share();
            //self._rank.loadFriendRankWidget(self);

            userOperate.getAppSvrCfg();
            //拉取配置信息
            userOperate.getGlobalActConfig();
            if (tokenMgr.checkToken) {
                wx.checkSession({
                    success: res => {
                        self.wxSmallLoading();
                    },
                    fail: res => {
                        self.wxLoading();
                    }
                })
            } else {
                self.wxLoading();
            }
            //self.wxLoading();
            this.getUserInfo();
            self._share = new share();
            self._share.getShareText();
            var launcInfo = wx.getLaunchOptionsSync(); var query = launcInfo.query;
            if (query.srcid && query.tskid && query.suid) {
                adtask.completeTask(query.suid, launcInfo.query.srcid, launcInfo.query.tskid);
            }
            console.log(">>>" + query.srcid + query.tskid + query.suid);
            console.log(query);
            console.log(">>>")
            // self._share.reportShareText(launcInfo);

        } else if (cc.sys.platform == cc.sys.QQ_PLAY) {
            self.qqLoading();
        } else {
            self.loginScene();
        }
        self.pullAdcData();

    },
    loginScene() {
        var finished = cc.callFunc(function () {
            cc.director.loadScene(self.toLoadScene);
        });

        var seq = cc.sequence(
            cc.delayTime(1.5),
            cc.fadeOut(0.5),
            finished
        );

        this.startupImage.runAction(seq);
    },
    qqLoading() {
        qqPlay.loadGameData(function (data) {
            if (data) {
                //分数
                if (data.maxScore) {
                    // let score = userOperate.getScore();
                    // if (score < data.maxScore) {
                    //     cc.sys.localStorage.setItem('weekScore', data.maxScore);
                    // }
                    cc.sys.localStorage.setItem('weekScore', data.maxScore);
                }
                // blob 数据
                if (data.modeDatas) {
                    cc.sys.localStorage.setItem('blob', JSON.stringify(data.modeDatas));
                }
                // 金币
                if (data.modeDatas && data.modeDatas['Gold']) {
                    consume.setGold(data.modeDatas['Gold']);
                }
            }
            console.log("GameStatusInfo" + JSON.stringify(GameStatusInfo));
            let isFirstPlay = localStorage.getLocalStorage('qqFirstPlay');
            if (!isFirstPlay) {
                qqSvrRequest.createRole({
                    info: GameStatusInfo,
                    success: res => {
                        localStorage.setLocalStorage('qqFirstPlay', 1);
                        self.loginScene();
                    },
                    fail: res => {
                        self.loginScene();
                    }
                })
            } else {
                qqSvrRequest.login({
                    info: GameStatusInfo,
                    success: res => {
                        self.loginScene();
                    },
                    fail: res => {
                        self.loginScene();
                    }
                });
            }

        })
    },
    wxLoading() {

        wx.login({
            success: res => {
                var launcInfo = wx.getLaunchOptionsSync();
                console.log("wx.getLaunchOptionsSync::", launcInfo);
                if (!!!config.gamecenter_link) {
                    util.getGameSeesionkey(res.code);
                    //util.getLocalOpenID(res.code);
                    let randStr = launcInfo.query.randStr
                    if (randStr) {
                        let flag = global.IsRepeatRandString(randStr)
                        if (!!!flag) {
                            global.addRandString(randStr);
                            consume.addGold(config.myAssist);
                            global.setEnterGameRandStr(true);
                        }
                    }
                    if (launcInfo.shareTicket) {
                        //保存 进来的群的shareTicket
                        config.shareTicket = launcInfo.shareTicket;
                        //self.showGroupRank();
                        self.loginScene();
                    } else {
                        self.loginScene();
                    }

                    return;
                };
                login.login(res.code, function (res) {
                    // login.getUseInfo();
                    // ad.postAdvert();
                    //// 从群进入游戏 (现在不需要了)
                    // if (launcInfo && launcInfo["query"] && launcInfo.query["uid"]){
                    //     self._share.addFriend(launcInfo.query["uid"]);                        
                    //     if (launcInfo.shareTicket){
                    //         self.loginScene();
                    //         //self.showGroupRank();

                    //         // //通过shareTicket 获得群号，显示群排行信息
                    //         // self._share.getShareInfo(launcInfo.shareTicket,function(openGId){
                    //         //     //console.log("openGId",openGId,self._rank)
                    //         //     config.groupOpenGID = openGId;
                    //         //     self._share.shareGroup(openGId);
                    //         //     self._rank.getQunRank( openGId,function(res){
                    //         //         if(res && res["data"]){
                    //         //             self.qunRankWidget.active = true
                    //         //             var js = self.qunRankWidget.getComponent('rankQunLayer');
                    //         //             js.init(res.data,function(){
                    //         //                 cc.director.loadScene(config.loginScene, null);
                    //         //             })
                    //         //         }
                    //         //     },"true");                   
                    //         // })
                    //         return;
                    //     }                     
                    // }                
                    //self.loginScene();
                    self.sycsData();
                }, function () {
                    self.loginScene();
                    console.log("failLoign show")
                    //self.failLogin();
                })
                //self.loginScene();
            },
            fail: res => {
                //self.failLogin();
                self.loginScene();
            },
        })
    },
    wxSmallLoading() {
        login.loginSmall((res) => {
            console.log("smallLogining true")
            self.sycsData();
        }, (res) => {
            self.wxLoading();
        })
    },
    getUserInfo() {
        if (typeof wx.getSetting != 'function') return;
        wx.getSetting({
            success: (res) => {
                if (res.authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success: res => {
                            global.setGender(res.userInfo.gender);
                            //self.pullAdcData();
                        },
                        //fail: res => self.pullAdcData(),
                    })
                } else {
                    //self.pullAdcData();
                }
            },
            //fail: res => self.pullAdcData(),

        })
    },
    pullAdcData: () => {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            const cfg = config.adc ? config.adc : {};
            const moreInfo = adc.getMoreInfo(cfg.moreGame);
            console.log("pull moreGame Info", moreInfo);
            const adFrame = adc.getAdFrame(cfg.adFrame);
            console.log("pull adFrame", adFrame);
            const adBanner = adc.getBannerAdInfo(cfg.adBanner);
            console.log("pull adBannerInfo", adBanner);
            const adEdge = adc.getAdEdge();
            console.log("pull adEdge", adEdge);
            adc.getAdText();

            const adexp = adc.getAdexpInfo(cfg.adexp);
            console.log("pull adexpInfo Info", adexp);
            adc.getSvrAd4Reborn();
        }
        else if (cc.sys.platform == cc.sys.QQ_PLAY) {

            const cfg = config.adc ? config.adc : {};
            const adexp = adc.getAdexpInfo(cfg.adexp);
            console.log("pull adexp Info", adexp);
        }
    },
    // 登录与服务器数据（分数跟自定义数据）进行同步
    sycsData() {
        //拉取服务器blobMap
        userOperate.getBlobMap();
        //payment.checkPaymentResults();
        userOperate.showYdStatus();

        let self = this;
        userOperate.getSeverScore(function (data) {
            self._severScoreInfo = data;
            if (!self._isFirst) {
                self._isFirst = true;
            } else {
                self._sycsData();
            }

        });
        userOperate.getBlob(function (data) {
            self._blobInfo = data;
            if (!self._isFirst) {
                self._isFirst = true;
            } else {
                self._sycsData();
            }
        })

    },
    _sycsData() {
        //分数存储
        let localTiemStamp = cc.sys.localStorage.getItem('timetamp');
        let localScore = cc.sys.localStorage.getItem('weekScore');
        console.log("++++++++++++++++++++++localTimeStamp:", localTiemStamp, localScore, this._severScoreInfo);
        if (!localTiemStamp || !localScore) {
            if (this._severScoreInfo && this._severScoreInfo.score_timestamp) {
                //本地数据被清空，服务器有数据，同步
                cc.sys.localStorage.setItem('timetamp', this._severScoreInfo.score_timestamp);
                cc.sys.localStorage.setItem('weekScore', this._severScoreInfo.score);
                consume._getGold();
            } else {
                //最初状态 上传设置初始化的金币数
                consume._setGold(consume.getGold());
            }
        } else {

            if (this._severScoreInfo && this._severScoreInfo.score_timestamp) {
                // 本地/服务器都有数据，按照时间戳，同步数据
                if (parseInt(localTiemStamp) <= parseInt(this._severScoreInfo.score_timestamp)) {
                    //向下同步
                    cc.sys.localStorage.setItem('weekScore', this._severScoreInfo.score);
                    cc.sys.localStorage.setItem('timetamp', this._severScoreInfo.score_timestamp);
                    consume._getGold();
                } else {
                    //向上同步
                    userOperate._setScore(parseInt(localScore));
                    consume._setGold(consume.getGold());
                }
            } else {
                // 本地有数据，服务器无数据，向上同步
                console.log("_________")
                userOperate._setScore(parseInt(localScore));
                consume._setGold(consume.getGold());
            }
        }
        //blob 存储
        let localBlob = cc.sys.localStorage.getItem('blob');
        console.log("++++++++++++++++++++++localBlob:", localBlob);
        if (!localBlob) {
            if (this._blobInfo && this._blobInfo.blob_timestamp) {
                cc.sys.localStorage.setItem('blob', JSON.stringify(this._blobInfo));
            }
        } else {
            localBlob = JSON.parse(localBlob);
            if (this._blobInfo && this._blobInfo.blob_timestamp) {
                if (parseInt(localBlob.blob_timestamp) <= parseInt(this._blobInfo.blob_timestamp)) {
                    cc.sys.localStorage.setItem('blob', JSON.stringify(this._blobInfo));
                } else {
                    userOperate.setBlob(localBlob);
                }
            } else {
                userOperate.setBlob(localBlob);
            }
        }

        self.loginScene();
    },
    showGroupRank() {
        if (typeof wx.getOpenDataContext != "function") {
            // self._flyText("微信版本过低，请升级")
            self.loginScene();
            return
        }

        let openDataContext = wx.getOpenDataContext();
        openDataContext.postMessage({
            id: MSG.MessageID.ON_MSG_GET_GROUP_RANK_OPEN,
            shareTicket: config.shareTicket,
        })
        self.node.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(function () {
            self.friendRank.active = true;
            var js = self.friendRank.getComponent('friendLayer');
            js.initRank("true", function () {
                self.loginScene();
            });
        })))
    },


    // update (dt) {},
});
