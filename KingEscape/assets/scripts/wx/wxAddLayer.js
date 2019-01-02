
// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

/**
 * 提示
 * global 保存了从服务器拉下来的用户数据, userOperate.getUserData
 * 
 */
var qqPlay = require('qqPlay');
var userOperate = require('userOperate');
var config = require('config');
var login = require('login');
var urls = require('route').urls;
var rank = require('rank');
var share = require('share');
var match = require('match')
var global = require('global');
var localStorage = require('localStorage');
var globalFunc = require('globalFunc');
var tokenUrl = require('tokenMgr');
var consume = require('consume').getInstance();
//var matchManager = require('matchManager').getInstance();
var MSG = require('messageId');
var shareUtil = require('shareUtil').getInstance();
var preview = require('preview');
var vip = require('vip').getInstance();
var util = require('util');
var fullAdv = require('fullScreenAdv');
// 友助
var myAssist = require('myAssist').getInstance();
var commonNode = require('commonNode');
var wxAd = require('wxAd');
var wxAuthor = require("auth").getInstance();
const adc = require("adc");
const getMoreInfo = adc.getMoreInfo;
//支付
var payment = require("Payment");
var diamondControl = require("DiamondControl");

var shareSpecialTag = null;
var shareSpecialFunc = null;
var shareSpcialNum = -1;
var self = null;
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
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        self = this;
        self._localScore = 0;
        self._isShareWithGold = false;
        self.initData();
        self.loadWidget();
        shareUtil.loadShareGroupInfo();
        if (!!!global.wxAddLayerdownload) {
            self._share.ifDownLoadShareCDN();
        }


        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.onHide(function (res) {
                console.log("onHide", res);
                if (res && res.mode == 'hide' && res['targetPagePath'] && (res.targetPagePath.indexOf('AppBrandProfileUI') != -1 || res.targetPagePath.indexOf('WAProfileViewController') != -1)) {
                    let exitGame = global.getUserDataInfoByName('exitMiniProgram');
                    if (exitGame && parseInt(exitGame)) {
                        wx.exitMiniProgram();
                    }
                }
            });
            wx.onShow(function (res) {
                let launcInfo = res;//wx.getLaunchInfoSync();//wx.getLaunchOptionsSync();
                //console.log('specialInfo', launcInfo);
                //特殊回调函数。
                if (launcInfo && launcInfo.query['shareSpecialTag'] && new Date().toDateString() === new Date(parseInt(launcInfo.query['timestamp'])).toDateString() &&
                    global.IsRepeatRandString(launcInfo.query.randStr)) {
                    this._doShareEvent(launcInfo);
                }
                //公众号拉粉
                if (launcInfo && launcInfo.query['vpnaFlag']) {
                    this._doOfficialAccount(launcInfo);
                }
            }.bind(this))
        }
        //console.log("LLLLLLLLLLLLLLLLLL",self.node.parent);


        //30秒拉取一次比赛活动
        // self.schedule(function() {
        //     console.log("get match info...");
        //     self._match.update(self);
        // }, 30);
        // if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        //     self.scheduleOnce(function() {
        //         console.log("get match info...");
        //         // self._match.update();
        //         matchManager.update();
        //     }, 3);
        // }

        //调用一次，使得第一次进入的时候记录当前时间
        self.getGameStartSeconds();
        //调用粉丝落地和神秘新游、第三个是全屏广告
        if (cc.director.getScene().getName() == config.loginScene) {
            self.rmbHongbaoActive(true);
            self.mysteriousNewGameActive(true);
            self.fullScreenActive(true);
            //首界面弹出授权框(统计授权率)
            //self.startFirstGetAuthView();

            if (config.gamecenter_link && cc.sys.platform == cc.sys.WECHAT_GAME) {

                let launcInfo = wx.getLaunchOptionsSync();
                console.log('loginLaunchInfo', launcInfo);
                //特殊回调函数
                if (launcInfo && launcInfo.query['shareSpecialTag'] && new Date().toDateString() === new Date(parseInt(launcInfo.query['timestamp'])).toDateString() &&
                    global.IsRepeatRandString(launcInfo.query.randStr)) {
                    this._doShareEvent(launcInfo);
                }
                //公众号拉粉
                if (launcInfo && launcInfo.query['vpnaFlag']) {
                    this._doOfficialAccount(launcInfo);
                }
                //好友邀请
                if (global.showAuthLy) {
                    if (launcInfo.query['inviteFriend']) {
                        //群接口进入
                        if (launcInfo.query['inviteGroup']) {
                            if (launcInfo['shareTicket']) {
                                self._inviteFriends(launcInfo);
                            }
                        } else {
                            self._inviteFriends(launcInfo);
                        }

                    }
                }
            } else if (cc.sys.platform == cc.sys.QQ_PLAY) {
                let launcInfo = GameStatusInfo.gameParam;
                console.log("qqPlay" + JSON.stringify(GameStatusInfo));
                if (launcInfo['inviteFriend']) {
                    const qqSvrRequest = require('qqSvrRequest');
                    qqSvrRequest.reportShare(GameStatusInfo);
                }
            }
        }

        /*
		const moreInfo = getMoreInfo(true);
        console.log(moreInfo);
        const adFrame = adc.getAdFrame(true);
        console.log(adFrame);
        */
    },
    /** 
     * 做处理
     * */
    _doShareEvent(launcInfo) {

        if (launcInfo.shareTicket) {
            wx.getShareInfo({
                shareTicket: launcInfo.shareTicket,
                success: res => {

                    util.getGroupDecode(res, function (gopenid) {
                        console.log('get group open id:', gopenid);
                        let isSave = shareUtil.setShareGroupInfo(gopenid);
                        if (isSave === 2) {
                            wx.showModal({
                                title: '提示',
                                content: '同一个群一天只能分享' + config.groupTimes + '次,换个群试试',
                                showCancel: false,
                                // cancelText: '知道了',
                                // confirmText: '重新分享',
                                confirmText: '知道了',
                                success: function (res) {
                                    if (res.confirm) {
                                        self.shareBtnWithGroupSpecialAndTimes(shareSpecialFunc, shareSpecialTag, shareSpcialNum);
                                    } else if (res.cancel) {
                                        console.log('用户点击取消')
                                    }
                                }.bind(this)
                            })
                            return;
                        }
                        console.log('_doShareEvent');
                        let obj = global.getGlobalFunc(launcInfo.query.shareSpecialTag);
                        if (obj) {
                            console.log('_doShareEvent1');
                            obj.func();
                        } else {
                            console.log('_doShareEventsave');
                            global.saveGlobalEvent(launcInfo.query.shareSpecialTag);
                        }
                    }, function () {
                        console.log('getGroupDecode fail', res)
                    })

                },
                fail: res => {
                    console.log('getShareInfo fail', res)
                }
            });
        } else {
            wx.showModal({
                title: '提示',
                content: '请分享到群试试哦',
                showCancel: false,
                // cancelText: '知道了',
                confirmText: '确定',
                success: function (res) {
                    if (res.confirm) {
                        self.shareBtnWithGroupSpecialAndTimes(shareSpecialFunc, shareSpecialTag, shareSpcialNum);
                    } else if (res.cancel) {
                        console.log('用户点击取消')
                    }
                }.bind(this)
            })
        }
    },
    //公众号拉粉
    _doOfficialAccount(launchInfo) {
        let blob = this.getBlob();
        if (blob && blob['vpnaFlag']) {
            return;
        }
        let cfgInfo = global.getLoginCfgByKey('vpnaFlag');
        if (!cfgInfo || !parseInt(cfgInfo.flag)) {
            return;
        }
        this._userOperate.officialAccount(function () {
            let blob = this.getBlob();
            if (!blob) {
                blob = {};
            }
            blob['vpnaFlag'] = 1;
            this._userOperate.setBlob(blob);

            let obj = global.getGlobalFunc('vpnaFlag');
            if (obj) {
                obj.func();
            } else {
                global.saveGlobalEvent('vpnaFlag');
            }
        }.bind(this));
    },
    /**
     * 收藏我的小程序
     * @param (flag) show / hide 
     */
    showCollect(flag = true) {
        if (cc.sys.platform != cc.sys.WECHAT_GAME) {
            return;
        }
        let canvas = cc.find('Canvas');
        let cltNew = canvas.getChildByName('cltNew');
        if (!flag) {
            if (cltNew && cltNew.active) {
                cltNew.active = false;
            }
            return;
        }
        let collect = localStorage.getLocalStorage('collect');
        if (collect) {
            return;
        }
        let launcInfo = wx.getLaunchOptionsSync();

        if (parseInt(launcInfo.scene) == 1104) {
            localStorage.setLocalStorage('collect', 1);
            return;
        }

        if (!cltNew) {
            cc.loader.loadRes('plugIn/colletAwards/cltNew', cc.Prefab, function (err, prefab) {
                if (err) {
                    console.error(err)
                    return;
                }
                let cltNew = cc.instantiate(prefab);
                cltNew.name = 'cltNew';
                let _cltNew = canvas.getChildByName('cltNew');
                if (_cltNew) {
                    return;
                }
                console.log("showCollect", cltNew);
                canvas.addChild(cltNew);
                var screenSize = cc.view.getFrameSize();
                let contentSize = canvas.getContentSize();
                if (screenSize.height / screenSize.width >= 1.78) {
                    cltNew.setPosition(contentSize.width / 2 - 330, contentSize.height / 2 - 45 * (screenSize.height / screenSize.width));
                } else {
                    cltNew.setPosition(contentSize.width / 2 - 330, contentSize.height / 2 - 52);
                }

            })
        } else {
            cltNew.active = true;
        }
    },
    /**
     * 好友邀请
     * @param {*} launcInfo 
     */
    _inviteFriends(launcInfo) {
        console.log("inviteFriends", launcInfo);
        if (launcInfo.query.uid == config.UID) {
            return;
        }
        let setReport = () => {
            login.getUseInfo(function (userInfo) {
                self._userOperate.setUserDataInfo(userInfo);
            });
            self._userOperate.setReportShare(launcInfo.query['inviteFriend'], launcInfo.query['uid'], parseInt(launcInfo.query['newInvite']));
        }
        wx.getSetting({
            success: (res) => {
                console.log("getSetting", res, res.authSetting['scope.userInfo']);
                if (!res.authSetting['scope.userInfo']) {

                    let getTime = new Date();
                    let nowDate = getTime.getDate();
                    let lastDate = cc.sys.localStorage.getItem("showAuthViewLastDate")
                    let timeShow = false;
                    //console.log("****打印输出date：", lastDate + " nowDate:", nowDate)
                    if (!lastDate || lastDate != nowDate) {
                        timeShow = true;
                        cc.sys.localStorage.setItem("showAuthViewLastDate", nowDate);
                    }

                    var dateCount = cc.sys.localStorage.getItem("showAuthViewDataCount");
                    if (!dateCount) {
                        dateCount = 1;
                        cc.sys.localStorage.setItem("showAuthViewDataCount", dateCount)
                    } else if (dateCount != undefined && timeShow == true) {
                        dateCount = parseInt(dateCount);
                        dateCount += 1;
                        cc.sys.localStorage.setItem("showAuthViewDataCount", dateCount)
                    }

                    if ((dateCount == 1 || dateCount == 3) && timeShow == true) {
                        wx.getSetting({
                            success: res => {
                                console.log("wx.getSetting", res);
                                if (!res.authSetting['scope.userInfo']) {
                                    global.getDoAuView = 1;
                                }
                            },
                            fail: res => {
                                console.log("wx getSetting fail");
                            }
                        });
                    }

                    self.callAuthView(() => {
                        setReport();
                    }, setReport)
                } else {
                    setReport();
                }
            },
            fail: (res) => {
                self.callAuthView(() => {
                    setReport();
                }, () => {
                    setReport();
                })
            }

        })

    },
    /**
     * 
     * 初始化data
     */
    initData() {
        self._userOperate = new userOperate();
        self._rank = new rank();
        self._share = new share();
        // self._match = new match();
    },

    /**
     * 加载  prefab(widget)
     */
    loadWidget() {
        // wx 添加match相关widgets
        // matchManager.loadMatchHongbaoIcon(self);
        // matchManager.loadMatchShareWidget(self);
        // matchManager.loadMatchRankWidget(self);
        // matchManager.setTarget(self);

        /*
         vip功能组件 ,需要使用的将其打开 
        */
        /*
        vip.loadVipWidget(self);
        */
    },

    /**
     * 体力定时器
     * @param {*无意义} floats 
     */
    callback(floats) {
        self._userOperate.getVit(function (res) {
            console.log(res);
            if (res.vit) {
                global.setUserDataInfoByName('vit', res.vit)
            }
        })
    },
    start() {
        //   self.setFriendsRankScore(20);  
        //   self.node.runAction(cc.sequence(cc.delayTime(0.5),cc.callFunc(function(){
        //     self.getFriendsRankBtn();
        //   })))
        //////////////////////////////////////////

        //commonNode.getInstance();

        /*
         vip功能组件 ,需要使用的将其打开 
        */
        /*
        self.scheduleOnce(function () {
            vip.checkEnter(self);
        }, 3);
        */
    },

    // update() {

    // },
    /** 
     * 排行榜 customData = true ，表示拉取周排行 无 则表示总排行
     * 
     */
    rankBtn(event, customData) {
        console.log(event, customData)
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            self._rank.getRank(function (res) {
                //console.log(res)
                if (res && res["data"]) {
                    self.rankWidget.active = true
                    var js = self.rankWidget.getComponent('rankLayer');
                    js.init(res.data, function () { })
                }
            }, customData);
        }
    },
    rankQunBtn(event, customData) {
        customData = customData || "true";
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            if (config.groupOpenGID) {
                self._rank.getQunRank(config.groupOpenGID, function (res) {
                    //console.log(res)
                    if (res && res["data"]) {
                        self.qunRankWidget.active = true
                        var js = self.qunRankWidget.getComponent('rankQunLayer');
                        js.init(res.data, function () { })
                    }
                }, customData);
            }
        }
    },

    /** 
     * 分享
     * 炫耀成绩
     * 
     * gold 分享获得金币 数量，
     */
    shareBtnWithScore(event, callback, gold, num = -1) {
        //if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        self._localScore = self._userOperate.getLocalScore();
        //console.log("localScore",self._localScore,self._isShareWithGold)
        if (typeof self._localScore == 'number') {

            //self._isShareWithGold = false;
            self._share.shareAppMessageWithGold(callback, num, self._localScore, gold, self);
        } else {
            self._share.shareAppMessage(callback, num);
        }
    },
    /**
     * 
     * @param {*} event 
     * @param {*} callBack 
     * 友助 复活
     */
    shareBtnWithRevived(event, callBack, num = -1) {
        //if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        let func = function () {
            self.assistLayerTwo.active = true;
            let js = self.assistLayerTwo.getComponent("assistLayerJs");
            js.init(callBack)
        }
        self._share.shareAppMessageWithRevived(func, num);
        //}  
    },
    /**
     * 
     */
    shareBtnWithAssit(event, callBack, num = -1) {
        // if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        self._share.shareAppMessageWithAssit(callBack, num);
        //}
    },
    /**
     * 分享  
     * ****此处分享是带分数分享（分数分享只有这个函数,要提前调用setScore 或 setLocalScore 函数) ******** 
     * 
     */
    shareBtn(event, callBack, num = -1) {
        //if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        self._localScore = self._userOperate.getLocalScore();
        if (self._localScore) {
            self._share.shareAppMessage(callBack, num, self._localScore);
        } else {
            self._share.shareAppMessage(callBack, num);
        }
        //}
    },

    /**
     * 分享 
     * 分享到群，个人 都有回调
     * 
     */
    shareBtnWithUrl(event, callBack, num = -1) {
        //if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        self._share.shareAppMessageWithImgUrl(callBack)
        //this.publicSharingWithSvrcfg(callBack, num);
    },
    /**
     * 分享 
     * 分享群  拥有回调
     * 分享到个人也拥有回调;
     * callback 需要一个参数，callback(param1),
     * param1  true/false, 判断是否为群
     */
    shareBtnWithGroup(event, callBack, num = -1) {
        // var num = 222;
        console.log("group", callBack, num)
        //if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        self._share.shareAppMessageForGroup(callBack, num)
        //}
        //this.publicSharingWithSvrcfg(callBack, num);
    },


    /*
     * 分享 
     * 分享不同群  拥有回调
     * 分享到个人也拥有回调;
     * callback 需要一个参数，callback(param1),
     * 群列表 每天清除
     * （新）param1  默认返回 1；
     * (旧)param1  0,1,2, 同一个群config.groupTimes次 返回1，同一群大于config.groupTimes次过后 返回2 ， 个人或其他返回0  
     */
    // （新） param1  默认返回 1；
    shareBtnWithGroupAndTimes(event, callBack, num = -1) {
        //if (cc.sys.platform == cc.sys.WECHAT_GAME) {

        // common config 中配置了 shareToWatchCfg  分享变成观看视频
        // let shareToWatchCfg = this.getGlobalDataByName('shareToWatchCfg');
        // if (shareToWatchCfg && parseInt(shareToWatchCfg)) {

        //     wxAd.playAd(function () {
        //         if (callBack && typeof callBack == 'function')
        //             callBack(1);
        //     }, null, self);
        //     return;
        // }
        // let cityFlag = global.getLoginCfgByKey('cityFlag');
        // if (cityFlag && (config.isShowyd != 1 && config.isShowyd)) {
        //     this.playAd(func1, function () {
        //         this.playAdToShare(callBack, num);
        //     }.bind(this))
        // } else {
        //     self._share.shareBtnWithGroupAndTimes(callBack, num)
        // }
        //}
        self._share.shareBtnWithGroupAndTimes(callBack, num)
        //this.publicSharingWithSvrcfg(callBack, num);
    },
    /**
     * 通用分享功能，根据配置分享可直接转视频
     * @param {*} callback  参数返回 1 为分享， 0/null/undifine等 视频返回
     * @param {*} num 
     */
    publicSharingWithSvrcfg(callback, num = -1) {
        let cityFlag = global.getLoginCfgByKey('cityFlag');
        if ((!(config.isShowyd == 1 || config.isShowyd == 2) && config.isShowyd)) { //0 、1、2 分享还是分享
            if (cityFlag || config.isShowyd == 5 || config.isShowyd == 6) { //屏蔽用户+ 高安全模式+完全安全模式 、 分享转视频
                this.playAdNew(callback, false, num);
            } else {
                self._share.shareBtnWithGroupAndTimes(callback, num)
            }

        } else {
            self._share.shareBtnWithGroupAndTimes(callback, num)
        }
    },
    /**
     * 视频观看完了转分享
     * @param {*} callback 
     * @param {*} num 
     */
    playAdToShare(callback, num = -1) {
        self._share.shareBtnWithGroupAndTimes(callback, num)
    },

    /**
     * 特殊分享 设置当前页面方法
     * @param {*} func 
     * @param {*} tag 
     */
    setShareSpecialFunc(func, tag) {
        global.setGlobalFunc(func, tag);
    },
    /**
     *  特殊分享 
     * 注：可以判群的分享 2018.11.2；
     * @param {*} callBack  注： 模拟分享回调接口，非全局回调接口
     * @param {*} tag  全局回调的id 注：使用此tag 去判断全局回调
     * @param {*} num  分享点
     */
    shareBtnWithGroupSpecialAndTimes(callBack, tag, num = -1) {
        let func = () => {
            shareSpecialTag = tag;
            shareSpecialFunc = callBack;
            shareSpcialNum = num;
            self._share.shareBtnWithGroupSpecialAndTimes(callBack, tag, num);
        }

        let cityFlag = global.getLoginCfgByKey('cityFlag');
        if ((!(config.isShowyd == 1 || config.isShowyd == 2) && config.isShowyd)) { //0 、1、2 分享还是分享
            if (cityFlag || config.isShowyd == 5 || config.isShowyd == 6) { //屏蔽用户+ 高安全模式+完全安全模式 、 分享转视频
                this.playAd(callBack, function (res) {
                    if (!res)
                        func();
                }.bind(this))
            } else {
                func();
            }
        } else {
            func();
        }



    },
    /**
     * 特殊功能 分享  shareTicket 增加次数的
     * @param {*} event 
     * @param {*} callBack 
     */
    shareBtnWithSpecial(event, callBack, obj, num = -1) {
        //if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        self._share.shareAppMessageWithSpecial(callBack, obj, num)
        // if(self._localScore){
        //     self._share.shareAppMessageWithImgUrl(callBack,self._localScore);
        // }else{
        //     self._share.shareAppMessageWithImgUrl(callBack);
        //}
        // }
        //}
    },
    /**
     * 分享 显示vip分享文案
     */
    shareBtnWithVip(event, callBack, num = -1) {
        // if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        self._share.shareAppMessageWithVip(callBack, num)
        // }
    },

    /**
     *  截屏   （默认 0，0 ，200， 150）
     * @param {*} callBack 
     * @param {* 左上角x偏移} offset_x 
     * @param {*左上角y偏移} offset_y 
     * @param {*截取宽度} width 
     * @param {*截取高度} height 
     */
    shareWithMeasure(callBack, offset_x, offset_y, width, height) {

        //if (cc.sys.platform == cc.sys.WECHAT_GAME) {

        self._share.shareWithMeasure(callBack, offset_x, offset_y, width, height)
        //} 

    },
    /**
     * 分享 图片，
     * @param {*} callBack 
     * @param {*图片地址 (打包为微信小游戏后的图片地址，例如：'cc.url.raw('resources/share/share1.jpg') } url 
     * @param {*文字说明config shareTitles } titleIndex 
     */
    shareWithImageUrl(callBack, url, titleIndex = 1) {

        //if (cc.sys.platform == cc.sys.WECHAT_GAME) {

        self._share.shareWithImageUrl(callBack, url, titleIndex);
        //} 
    },
    /**
     * 邀请好友分享 （点击卡片 通过tag标记，统计好友数量）
     * 注：“新玩家” 好友邀请，邀请的为”新玩家“， 请将newInvite = 1; （默认 0 为常规好友邀请）tag 不能为0
     * inviteGroup = 1 表示从群邀请进入的；
     */
    shareWithInviteFriends(callBack, tag = 1, newInvite = 0, inviteGroup = 0, num = -1) {
        this._share.shareWithInviteFriends(callBack, num, tag, newInvite, inviteGroup);
    },
    /**
     * 邀请好友分享 
     * 点击卡片进入游戏 （注：此接口需要从群卡片进入才会上报）
     * @param {*} tag 
     */
    shareInviteFriendsWithGroup(tag, num = -1) {
        this._share.shareWithInviteFriends(null, num, tag, 0, 1);
    },
    /**
     * 邀请新玩家分享
     * 点击卡片进入游戏 （注：此接口需要从群卡片进入才会上报）
     * @param {*} tag 
     */
    shareInviteNewFriendsWithGroup(tag, num = -1) {
        this._share.shareWithInviteFriends(null, num, tag, 1, 1);
    },
    /**
     * 玩一玩分享 
     * @param {*} callBack 
     */
    shareQQPlay(callBack) {
        self._share.shareQQPlay(callBack);
    },

    /**
     * 获取分享次数
     */
    getShareTicketTime() {
        var times = config.shareGroupTime || 0;
        return times;
    },
    // update (dt) {},
    /**
     * 比赛
     */
    hasMatch() {
        // return self._match.hasMatch();
        return match.hasMatch();
    },
    matchBtn() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            // self._match.getMatchInfo(function(res) {
            // match.getMatchInfo(function(res) {
            //     if (res && res["data"]) {
            //         self.matchWidget.active = true;

            //     }
            // });
            matchManager.showMatchRankView();
        }
    },
    /**
     * 获取真实好友排行榜
     * 
     */
    getFriendsRankBtn() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {

            if (typeof wx.getOpenDataContext != "function") {
                self._flyText("微信版本过低，请升级")
                return
            }

            let openDataContext = wx.getOpenDataContext();
            openDataContext.postMessage({
                id: MSG.MessageID.ON_MSG_GET_FRIEND_RANK_OPEN,
            })
            let func = () => {
                self.friendRank.active = true;
                var js = self.friendRank.getComponent('friendLayer');
                js.initRank();
            }
            if (self['friendRank']) {
                func();
            } else {
                this._rank.loadFriendRankWidget(self, null, func);
            }


        } else if (cc.sys.platform == cc.sys.QQ_PLAY) {
            let customDataList = new Array();
            customDataList.push({ title: "分数排行榜", rankText: '我的分数：', key: 'score' });

            qqPlay.getRankListWithoutRoom(['score'], [1], [0], function (data) {
                if (!self.rankQQRankLayer) {
                    self._rank.loadQQFriendRankMore(self, null, customDataList, data)
                } else {
                    self.rankQQRankLayer.active = true;
                    var js = self.rankQQRankLayer.getComponent('rankLayer');
                    console.log("js");
                    js.initRank(customDataList, data);
                }
            });

        }

        // let customDataList = new Array();
        // customDataList.push({title:"分数排行榜", rankText:'我的分数：', key:'score'});
        // if(!self.rankQQRankLayer){
        //     self._rank.loadQQFriendRankMore(self, null, customDataList, {})
        // }else{
        //     self.rankQQRankLayer.active = true;
        //     var js = self.rankQQRankLayer.getComponent('rankLayer');
        //     console.log("js");
        //     js.initRank(customDataList, {} );  
        // }                
    },
    /**
     * 获取多排行榜
     * @param {* customDataList = new Array()}
     *           customDataList.push({title:"页签排行榜名字", rankText:'我的分数：', key:'score（上传开放域数据的key值）'})
     *  } customDataList 
     */

    getMoreFirendsRank(customDataList = undefined) {
        if (typeof customDataList != 'object') {
            customDataList = new Array();
            customDataList.push({ title: "分数排行榜", rankText: '我的分数：', key: 'score' });
        }
        self._frmCustomData = customDataList;
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {

            if (typeof wx.getOpenDataContext != "function") {
                self._flyText("微信版本过低，请升级")
                return
            }

            let openDataContext = wx.getOpenDataContext();
            openDataContext.postMessage({
                id: MSG.MessageID.ON_MSG_GET_MORE_RANK_OPEN,
                key: customDataList[0].key,
            })

            if (!self['friendRankMore']) {
                self._rank.loadFriendRankMore(self, 'friendRankMore', customDataList)
            } else {
                self.friendRankMore.active = true;
                var js = self.friendRankMore.getComponent('friendMoreRankLayer');
                console.log("js");
                js.initRank(0, customDataList);
            }
        } else if (cc.sys.platform == cc.sys.QQ_PLAY) {
            let _attr = [];
            let _order = [];
            let _rankType = [];
            for (let i = 0; i < customDataList.length; i++) {
                let _qqKey = global.getQQRankeyByCustomKey(customDataList[i].key);
                if (_qqKey) {
                    _attr.push(_qqKey);
                    _order.push(1);
                    _rankType.push(0);
                }
            }

            qqPlay.getRankListWithoutRoom(_attr, _order, _rankType, function (data) {
                if (!self.rankQQRankLayer) {
                    self._rank.loadQQFriendRankMore(self, null, customDataList, data)
                } else {
                    self.rankQQRankLayer.active = true;
                    var js = self.rankQQRankLayer.getComponent('rankLayer');
                    console.log("js");
                    js.initRank(customDataList, data);
                }
            });
        }
    },

    /**
     * 横屏 游戏 双排行榜
     * @param {*} event 
     * @param {* CustomEventData 数据， 模板 [{text1:"我的最高分数：", text2:"我的击败数：", text3:"最大长度排行榜", text4:"最大击败排行榜", text5:"scorePlus", text6:'score' }] 
     *  text1 ~ text2 意义 ：底部排行榜的文字 例如：" 我的最高分数：","我的击败数："；
     *  text3 ~ text4 意义 ：头部排行榜页签名字  例如： 最大长度排行榜 ， 最大击败排行榜；
     *  text5  意义： 自己定义的保存到微信排行榜的数据（setScorePlus） 名字；（方便第二个排行榜微信排序）
     *  } customData 
     */
    getFriendsDoubleRankBtn(event, customData) {
        //console.log(customData);
        //字符串 转对象
        if (typeof customData == 'string') {
            // customData = globalFunc.myEval(customData);
            //console.log(customData);
        } else if (typeof customData == 'object') {

        } else {
            return;
        }
        let func = (type, data) => {
            self.friendRankDouble.active = true;
            var js = self.friendRankDouble.getComponent('friendDoubleLayer');
            if (customData) {
                this._FriendDoubleData = customData
                console.log(customData);
                js.initRank(0, null, this._FriendDoubleData, type, data);
            } else {
                js.initRank(0);
            }
        }
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {

            if (typeof wx.getOpenDataContext != "function") {
                self._flyText("微信版本过低，请升级")
                return
            }

            let openDataContext = wx.getOpenDataContext();
            let _dataName = 'scorePlus';
            let _dataName1 = 'score';
            if (customData && customData[0]["text5"]) {
                _dataName = customData[0]["text5"];
                _dataName1 = customData[0]["text6"]
            }
            openDataContext.postMessage({
                id: MSG.MessageID.ON_MSG_GET_DOUBLE_FRIEND_RANK_OPEN,
                dataName: _dataName,
                dataName1: _dataName1
            })

            if (this['friendRankDouble']) {
                func();
            } else {
                this._rank.loadFriendDoubleRankWidget(self, null, func);
            }



        } else if (cc.sys.platform == cc.sys.QQ_PLAY) {
            let _attr = ['score'];
            let _order = [];
            let _rankType = [];
            let addAttr = (_qqKey) => {
                _attr.push(_qqKey);
                _order.push(1);
                _rankType.push(0);
            };
            for (let i = 0; i < customData.length; i++) {
                let _qqKey
                if (customData[i].text6 != 'score') {
                    _qqKey = global.getQQRankeyByCustomKey(customData[i].text6);
                    addAttr(_qqKey);
                }
                _qqKey = global.getQQRankeyByCustomKey(customData[i].text5);
                addAttr(_qqKey);
            }

            qqPlay.getRankListWithoutRoom(_attr, _order, _rankType, function (data) {
                // self.friendRankDouble.active = true;
                // var js = self.friendRankDouble.getComponent('friendDoubleLayer');
                // if (customData) {
                //     self._FriendDoubleData = customData
                //     console.log(customData);
                //     js.initRank(0, null, self._FriendDoubleData, 1, data);
                // }

                if (this['friendRankDouble']) {
                    func(1, data);
                } else {
                    this._rank.loadFriendDoubleRankWidget(self, null, () => {
                        func(1, data)
                    });
                }
            }.bind(this));

        }

    },
    /**
     * 获取下一个想要超越的好友
     * 
     */
    setNextFriendInfoBtn() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {

            if (typeof wx.getOpenDataContext != "function") {
                self._flyText("微信版本过低，请升级")
                return
            }

            let openDataContext = wx.getOpenDataContext();
            openDataContext.postMessage({
                id: MSG.MessageID.ON_MSG_GET_NEXT_PEOPLE,
                openid: config.UID,
            })
        }
    },
    // /**
    //  * 设置开放域 分数
    //  * @param {*int} score 
    //  */
    setFriendsRankScore(score) {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            if (score == 0) {
                return;
            }
            var date = new Date().getTime() / 1000;
            if (!!!global.friendDate) {
                global.friendDate = 0;

            }
            if (date - global.friendDate > 1) {
                global.friendDate = date;
            } else {
                return;
            }
            global.setFriendScore = true;
            var time = global.getTimestamp();
            //key: 'timestamp';
            var _kvData = new Array();
            score = score + "";
            time = time + "";
            _kvData.push({ key: 'scoreCY', value: score }, { key: 'timestamp', value: time });
            wx.setUserCloudStorage({
                KVDataList: _kvData,
                success: res => {
                    console.log(res);
                },
                fail: res => {
                    console.log("fail", res);
                }
            })
        }
    },

    /**
     * 获取真实群排行榜（微信平台维护）
     * 
     */
    getOpenDataQunRankBtn() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {

            if (typeof wx.getOpenDataContext != "function") {
                self._flyText("微信版本过低，请升级")
                return
            }
            if (config.shareTicket) {
                let openDataContext = wx.getOpenDataContext();
                openDataContext.postMessage({
                    id: MSG.MessageID.ON_MSG_GET_GROUP_RANK_OPEN,
                    shareTicket: config.shareTicket,
                })
                self.friendRank.active = true;
                var js = self.friendRank.getComponent('friendLayer');
                js.initRank("true");
            } else {
                self.shareBtnWithGroup();
            }

        }
    },

    getMoreFirendsRankQun() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {

            if (typeof wx.getOpenDataContext != "function") {
                self._flyText("微信版本过低，请升级")
                return
            }
            let customDataList = self._frmCustomData;
            if (typeof customDataList != 'object') {
                customDataList = new Array();
                customDataList.push({ title: "分数排行榜", rankText: '我的分数：', key: 'score' })
            }
            self._frmCustomData = customDataList;
            if (config.shareTicket) {
                let openDataContext = wx.getOpenDataContext();
                openDataContext.postMessage({
                    id: MSG.MessageID.ON_MSG_GET_GROUP_RANK_OPEN,
                    shareTicket: config.shareTicket,
                    key: customDataList[0].key,
                })
            }
            if (!self['friendRankMore']) {
                self._rank.loadFriendRankMore(self, 'friendRankMore', customDataList)
            } else {
                self.friendRankMore.active = true;
                var js = self.friendRankMore.getComponent('friendMoreRankLayer');
                js.initRank(1, customDataList);
            }
        }
    },

    getOpenDataQunDoubleRankBtn() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {

            if (typeof wx.getOpenDataContext != "function") {
                self._flyText("微信版本过低，请升级")
                return
            }
            if (config.shareTicket) {
                let openDataContext = wx.getOpenDataContext();
                let _dataName = 'scorePlus';
                let _dataName1 = 'score';
                let customData = this._FriendDoubleData;
                if (customData && customData[0]["text5"]) {
                    _dataName = customData[0]["text5"];
                    _dataName1 = customData[0]["text6"]
                }
                openDataContext.postMessage({
                    id: MSG.MessageID.ON_MSG_GET_DOUBLE_GROUP_RANK_OPEN,
                    shareTicket: config.shareTicket,
                    dataName: _dataName,
                    dataName1: _dataName1,
                })
                self.friendRankDouble.active = true;
                var js = self.friendRankDouble.getComponent('friendDoubleLayer');
                if (this._FriendDoubleData) {
                    js.initRank(1, null, this._FriendDoubleData);
                } else {
                    js.initRank(1);
                }
            } else {
                self.shareBtnWithGroup();
            }

        }
    },
    /**
     * 弃用 测试的
     * 获取体力操作 使用下面的getVit(),subVit()
     * 
     */
    getVitBtn() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            self._userOperate.getVit(function (res) {
                console.log(res);
                if (res.vit) {
                    global.setUserDataInfoByName('vit', res.vit)
                }
            });

        }
    },
    subVitBtn() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            self._userOperate.getVit(function (res) {
                console.log(res);
                global.setUserDataInfoByName('vit', res.vit);
                if (parseInt(res.vit) > 0) {
                    self._userOperate.subVit(function (res) {
                        var num = global.getUserDataInfoByName('vit');
                        global.setUserDataInfoByName('vit', num - 1)
                    }, 1);
                } else {
                    self._flyText("您的体力不足");
                }
            });
        }
    },

    /* 
     * 飘字
     */
    _flyText(_text, color, strokeColor, time) {
        var textNode = new cc.Node;
        textNode.addComponent(cc.Label);
        textNode.addComponent(cc.LabelOutline);
        let winSize = self.node.getContentSize();
        textNode.setContentSize(winSize.width - 80, 200);
        var text = textNode.getComponent(cc.Label);
        text.string = _text || ""; //"您的体力不足";
        text.fontSize = 40;
        text.lineHeight = 40;
        text.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        textNode.color = color || cc.color(247, 255, 43, 255);
        var textOutLine = textNode.getComponent(cc.LabelOutline);
        textOutLine.color = strokeColor || cc.color(63, 2, 2, 255);
        textOutLine.width = 2;
        self.node.addChild(textNode);
        var size = self.node.getContentSize();
        //textNode.setPosition(size.width/2,size.height);
        var fadeOut = cc.fadeOut(0.2);
        var move = cc.moveBy(0.2, cc.v2(0, 200));
        time = time || 0.3;
        textNode.runAction(cc.sequence(cc.delayTime(time), cc.spawn(fadeOut, move), cc.callFunc(function () {
            textNode.destroy();
        }, self)))
    },
    /*
     *分数操作
     */
    getScore() {
        //if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        return self._userOperate.getScore() || 0;
        //}
        //return 0;
    },
    setScore(score) {
        //if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        if (typeof score == 'number') {
            // 贵宾积分加成
            if (self.isVip()) {
                let val = self.getVipStableAbilityValue('s_score');
                val = val / 100;
                score = Math.round(score * (1 + val));
            }
            self._isShareWithGold = true;
            self.addGameStartTimes();
            self.setCurLocalScore(score);
            self._userOperate.setScore(score);
            self._userOperate.setHBScore(score);
            return score;
        }
        //     return 0;
        // }
        // return 0;
    },
    getScorePlus(dataName = "scorePlus") {
        //if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        return self._userOperate.getScorePlus(dataName) || 0;
        // }
        // return 0;
    },
    setScorePlus(score, dataName = "scorePlus") {
        //if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        if (typeof score == 'number') {
            // // 贵宾积分加成
            // if (self.isVip()) {
            //     let val = self.getVipStableAbilityValue('s_score');
            //     val = val / 100;
            //     score = Math.round(score * (1 + val));
            // }
            // self._isShareWithGold = true;
            //self.addGameStartTimes();
            console.log("setScorePlus", score, dataName);
            self.setCurLocalScore(score);
            self._userOperate.setScorePlus(score, dataName);
            return score;
        }
        //     return 0;
        // }
        // return 0;
    },

    /**
     * 检查分数 是否超过分享复活的界限 ，（老玩家3次后都返回TRUE）
     */
    checkScore(score) {
        if (global.getLowScoreTimes() >= 2) {
            return true;
        } else {
            global.setLowScoreTimes();
            return false;
        }

        if (config.topScore <= score) {
            if (global.getHeightScoreTimes() >= 2) {
                return true;
            } else {
                global.setHeightScoreTimes()
            }

        } else {
            global.setLowScoreTimes();
        }
        return false;
    },
    /**
     * 设置本次分享分数
     * @param {*} score 
     */
    setCurLocalScore(score) {
        if (typeof score == 'number') {
            self._userOperate.setLocalScore(score);
        }
    },
    /* 
     *体力操作
     */
    getVit() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            global.setUserDataInfoByName('vit', res.vit);
        }
        return 0;
    },
    subVit(callBack) {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            self._userOperate.getVit(function (res) {
                global.setUserDataInfoByName('vit', res.vit);
                if (parseInt(res.vit) > 0) {
                    self._userOperate.subVit(function (res) {
                        var num = global.getUserDataInfoByName('vit');
                        global.setUserDataInfoByName('vit', num - 1);
                        if (callBack && typeof callBack == 'function') {
                            callBack();
                        }

                    }, 1);
                } else {
                    self._flyText("您的体力不足");
                }
            });

        }
    },
    /**
     * 
     * 设置用户自定义数据上传
     * // 已废弃
     */
    setCustomData(blob, callBack) {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            self._userOperate.setBlob(blob, callBack);
        }
    },

    /**
     * 金币/积分 操作
     */
    getGold() {
        let gold = consume.getGold();
        return gold;
    },
    /**
     * 
     * @param {*} _num 
     * @param {*} callBack  带一个参数 (true/false 判断消耗金币 成功/失败);
     */
    subGold(_num, callBack) {
        consume.subGold(_num, callBack);
    },
    addGold(_num) {
        consume.addGold(_num);
    },
    /**
     * 代币操作
     * @param {*} num 
     * @param {*} name 
     */
    setGoldPlus(num, name = 'diamond') {
        consume.setGoldPlus(num, name);
    },
    /**
     * 金币/积分 操作
     * 存储代币 操作 
     * @param {*自定义代币名字 默认 diamond)} name 
     */

    getGoldPlus(name = "diamond") {
        let gold = consume.getGoldPlus(name);
        return gold;
    },
    /**
     * 
     * @param {*} _num 
     * @param {*} callBack  带一个参数 (true/false 判断消耗金币 成功/失败);
     * @param {*自定义代币名字 （默认 diamond） } name 
     */

    subGoldPlus(_num, callBack, name = "diamond") {

        consume.subGoldPlus(_num, callBack, name);
    },
    addGoldPlus(_num, name = "diamond") {
        consume.addGoldPlus(_num, name);
    },
    /*
     *打开 体力定时器 30分钟恢复一次体力；
     */
    openVitTimers() {
        self.schedule(self.callback, 1800);
    },
    onDestroy() {
        self.unschedule(self.callback);
        global.wxAddLayerdownload = true;
        /*
        if(this.waitDel) {
            this.waitDel();
            this.waitDel = null;
        }
        if(typeof this.clearRemoteAdCb == "function") {
            this.clearRemoteAdCb();
            this.clearRemoteAdCb = null;
        }
        */
    },


    //保存公众号;
    saveOfficalAccount() {
        var node = cc.find("Canvas/officalAccount");
        if (node == null) {
            preview.officalAccLoad();
        } else {
            node.active = true;
        }
    },

    //更多预览
    moreGame(event) {
        //preview.previewImage();
        //return;

        //if(getMoreInfo())
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            const moreInfo = getMoreInfo();
            //console.log(moreInfo);
            if (Array.isArray(moreInfo) && moreInfo.length > 0) {

                //随一个出来跳转
                const idx = Math.floor(Math.random() * moreInfo.length);
                if (adc.isForward()) {
                    const info = moreInfo[idx];
                    const appid = info['jmpid'];
                    var parm = info['parm'];
                    parm = parm.indexOf('?') > 0 ? parm : parm + '?';
                    parm = parm.indexOf('gender') > 0 ? parm : parm + '&gender=' + global.getGender();
                    const share = info['url'];
                    if (appid && !wxAd.wxBversionLess("2.2.0")) {
                        //do some thing;
                        wx.navigateToMiniProgram({
                            appId: appid,
                            path: parm,
                            success: (res) => { },
                            fail: (res) => { },
                        });
                        return;
                    } else if (adc.checkLink(share)) {
                        preview.previewUrlImage(share);
                        return;
                    }

                }
                //self.moreGameLayer.getComponent("moreGameLayer").init(() => this.officalAccActive(true));
                this.officalAccActive(false);
                //self.moreGameLayer.active = true;
                //console.log(self.moreGameLayer.active, "active moregameLayer");
            } else if (Array.isArray(moreInfo))
                preview.previewImage();
        }

    },


    //显隐公众号
    officalAccActive(show) {
        var node = cc.find("Canvas/officalBtn");
        if (node == null && show) {
            preview.loadRes();
        } else if (node == null & !show) {
            return;
        } else {
            node.active = show;
        }
    },




    //显隐RMB红包图标
    rmbHongbaoActive(display) {

        if (display == true) {
            var node = cc.find("Canvas/rmbHongbaoBtn");
            var showHongbao = global.showHongbao;
            if (node == null && showHongbao == 1) {
                preview.loadRmbHongbaoRes();

            } else if (node == null && showHongbao == 0) {
                return;
            } else {
                if (node != null) {
                    node.active = true;
                }
            }
        } else {
            var node = cc.find("Canvas/rmbHongbaoBtn")
            if (node != null) {
                node.active = false;
            }
        }

    },




    //显隐神秘新游图标
    mysteriousNewGameActive(display) {

        if (display == true) {
            var node = cc.find("Canvas/mysteriousNewGameBtn");
            var showMysNewGame = global.showMysNewGame;
            if (node == null && showMysNewGame == 1) {
                preview.loadmysteriousNewGameRes();

            } else if (node == null && showMysNewGame == 0) {
                return;
            } else {
                if (node != null) {
                    node.active = true;
                }
            }
        } else {
            var node = cc.find("Canvas/mysteriousNewGameBtn");
            console.log("*******" + node);
            if (node != null) {
                node.active = false;

            }
        }

    },


    //显隐全屏广告
    fullScreenActive(display) {
        if (display == true) {
            var getTime = new Date();
            console.log(getTime.getDate());
            var firstShow = true;
            if (cc.sys.localStorage.getItem("fullScreenAdv") && cc.sys.localStorage.getItem("fullScreenAdv") == getTime.getDate()) {
                firstShow = false; //***这里是调试下的当天显示显隐开关修改 */
            }
            var node = cc.find("Canvas/fullSreenAdv");

            var showFullScreenAdv = global.showFullScreenAdv;
            if (node == null && showFullScreenAdv == 1) {
                if (firstShow == true) {
                    //*****服务器获取全屏广告信息********/
                    util.request({
                        url: config.base_url + "/adc/getFullScreenAdInfo",
                        data: { appid: config.config.appid },
                        success: function (res) {
                            console.log("****全屏广告服务器返回内容：", res);
                            var adlist = res.data.fullScreenAdList;
                            if (adlist.length > 0) {
                                var randomNum = Math.random() * 10;
                                randomNum = Math.floor(randomNum) % adlist.length;
                                var firstAd = adlist[randomNum];
                                console.log("****全屏广告服务器0返回内容：", firstAd.pic);
                                //self.showFullAdv = firstAd[0].pic;
                                if (firstAd.pic && firstAd.jmpid) {
                                    global.fullScreenJumpImage = firstAd.pic;
                                    global.fullScreenJumpId = firstAd.jmpid;
                                }
                                self.path = firstAd.parm;
                                if (self.path) {
                                    let parm = self.path;
                                    parm = parm.indexOf('?') > 0 ? parm : parm + '?';
                                    parm = parm.indexOf('gender') > 0 ? parm : parm + '&gender=' + global.getGender();
                                    self.path = parm;
                                    global.fullScreenJumpPath = self.path;
                                }
                                //***********判断信息完整性，加载广告预制体 */
                                if (firstAd.pic && firstAd.parm && firstAd.jmpid) {
                                    cc.sys.localStorage.setItem("fullScreenAdv", getTime.getDate());
                                    preview.loadFullScreenAdv();
                                }
                            } else {
                                console.log("全屏广告获取成功但数组为空");
                            }

                        },
                        fail: function (er) {
                            console.log("全屏广告请求失败");
                        }
                    });
                }
            } else if (node == null && showFullScreenAdv == 0) {
                return;
            } else {
                if (node != null) {
                    node.active = true;
                }
            }
        } else {
            var node = cc.find("Canvas/fullSreenAdv");
            if (node != null) {
                node.active = false;
            }
        }
    },

    //新用户主界面授权弹窗接口
    startFirstGetAuthView: function (changeToSignIcon = false) {
        if (cc.sys.platform != cc.sys.WECHAT_GAME)
            return;
        let launcInfo = wx.getLaunchOptionsSync();
        if (launcInfo.query['inviteFriend'])
            return;

        let getTime = new Date();
        let nowDate = getTime.getDate();
        let lastDate = cc.sys.localStorage.getItem("showAuthViewLastDate")
        let timeShow = false;
        //console.log("****打印输出date：", lastDate + " nowDate:", nowDate)
        if (!lastDate || lastDate != nowDate) {
            timeShow = true;
            cc.sys.localStorage.setItem("showAuthViewLastDate", nowDate);
        }

        var dateCount = cc.sys.localStorage.getItem("showAuthViewDataCount");
        if (!dateCount) {
            dateCount = 1;
            cc.sys.localStorage.setItem("showAuthViewDataCount", dateCount)
        } else if (dateCount != undefined && timeShow == true) {
            dateCount = parseInt(dateCount);
            dateCount += 1;
            cc.sys.localStorage.setItem("showAuthViewDataCount", dateCount)
        }
        //console.log("****打印输出天数：", dateCount + "  是否是当天第一次显示：", timeShow)
        // (dateCount == 1 || dateCount == 3) && timeShow == true
        if ((dateCount == 1 || dateCount == 3) && timeShow == true) {
            wx.getSetting({
                success: res => {
                    console.log("wx.getSetting", res);
                    if (!res.authSetting['scope.userInfo']) {
                        global.getDoAuView = 1;
                        console.log("****这里是新用户授权函数ChangeBool：", changeToSignIcon);
                        self.callAuthView(function () { }, function () { }, changeToSignIcon);
                    }
                },
                fail: res => {
                    console.log("wx getSetting fail");
                }
            });
        }
    },



    //获取世界排行接口应用例子
    getWorldRankingTest() {
        self.getWorldRanking(function (res) {
            console.log("打印出获取到的排行res", res);
        })
    },

    //获取世界排行接口
    getWorldRanking: function (callback) {
        wx.getSetting({
            success: function (res) {
                var authSetting = res.authSetting;
                // console.log("***打印当前Info授权状态", authSetting['scope.userInfo']);
                if (authSetting['scope.userInfo']) {
                    //已经授权，获取信息上传给服务器
                    self.userInfoToServer(self.getWRFromServer, callback);
                } else if (!authSetting['scope.userInfo']) {
                    //用户拒绝授权
                    self.callAuthView(function () {
                        self.userInfoToServer(self.getWRFromServer, callback)
                    }, function () {
                        wx.showModal({
                            title: "错误",
                            content: "获取授权失败",
                            showCancel: false,
                        })
                    })
                } else { }
            }
        })
    },


    //请求世界排行(部分)
    getWRFromServer: function (callback) {
        var urlNow = config.base_url + "/user/getRank";
        util.request({
            url: urlNow,
            data: {},
            success: function (res) {
                //console.log("获取世界排行成功，数据是：", res);
                callback(res);
            },
            fail: function (er) {
                console.log("获取世界排行请求失败");
            }
        });
    },


    //获取用户信息并且上传给服务器
    userInfoToServer: function (successCallBack, callback) {
        wx.getUserInfo({
            success: res => {
                console.log("***关于用户授权，申请授权，回调信息：", res);
                var url = config.base_url + "/user/wxgameReportInfo";
                var param = {}; //config.getParam();
                //console.log(config.userInfo)
                param["avatarUrl"] = res.userInfo.avatarUrl
                param["name"] = res.userInfo.nickName
                param["gender"] = res.userInfo.gender;
                param["city"] = res.userInfo.city;
                util.request({
                    url: url,
                    data: param,
                    header: { 'content-type': 'application/x-www-form-urlencoded' },
                    method: 'POST',
                    success: res => {
                        //console.log("***上传信息成功：", res);
                        if (successCallBack && typeof successCallBack == "function")
                            successCallBack(callback);
                    },
                    fail: res => {
                        //console.log("***上传信息失败：", res);
                        return false;
                    }
                })
            },
            fail: res => {
                //console.log("***获取用户信息失败：", res);
                return false;
            }
        })
    },
    /**
     *  获取世界排行榜 plus  
     * @param {*} rankName  排行榜名字  setScorePlus 上传或者单独的 setWorldRandPlus(rankName，score)函数上传的.
     * @param {*} callBack 回调函数 callBack (obj) 
     * obj= {ranklist:{
    *       rank:[] //avatarUrl,city,gender,name,rank,score,titleName,
    *       self：{avatarUrl,city,gender,name,rank,score,titleName,}
     * }}
     * @param {*} rankNum 排行榜显示数量 默认100；
     * 
     */
    getWorldRankingPlus(rankName, callBack, rankNum = 100) {
        let self = this;
        wx.getSetting({
            success: function (res) {
                var authSetting = res.authSetting;
                // console.log("***打印当前Info授权状态", authSetting['scope.userInfo']);
                if (authSetting['scope.userInfo']) {
                    //已经授权，获取信息上传给服务器
                    self._userOperate.getCommonWorldRank(rankName, callBack, rankNum);
                } else if (!authSetting['scope.userInfo']) {
                    //用户拒绝授权
                    self.callAuthView(function () {
                        self._userOperate.getCommonWorldRank(rankName, callBack, rankNum);
                    }, function () {
                        wx.showModal({
                            title: "错误",
                            content: "获取授权失败",
                            showCancel: false,
                        })
                    })
                } else { }
            }
        })
    },
    /**
     *  上传全服排行榜
     * @param {*} rankName 排行榜名字
     * @param {*} score  排行榜分数
     */
    setWorldRankingPlus(rankName, score) {
        this._userOperate.setCommonWorldRank(rankName, score);
    },
    //跳转到客服接口
    goCustomerServicePage: function (sss) {
        console.log(sss);
        wx.openCustomerServiceConversation(sss);
    },

    /**
     * 添加 游戏开始次数 
     */
    addGameStartTimes() {
        global.addStartGameTimes();
    },
    /**
     * 获得 游戏开始次数
     */
    getGameStartTimes() {
        return global.getStartGameTimes();
    },
    /**
     * 获取 玩家首次进入到目前经过的秒数
     */
    getGameStartSeconds() {
        let now = global.getTimestamp();
        let start = global.getStartGameSeconds();
        let t = now - start;
        return t > 0 ? t : 0;
    },
    /**
     * 检查广告 版本
     */
    checkWxBversionLess() {
        return wxAd.wxBversionLess();
    },
    /**
     * 游戏 播广告
     * @param {* success } func1 
     * @param {* fail } func2 参数返回 false 为可分享功能。

     */

    playAd(func1, func2) {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {

            // // common config 中配置了 watchToShareCfg  观看视频变成分享
            // let watchToShareCfg = this.getGlobalDataByName('watchToShareCfg');
            // if (watchToShareCfg && parseInt(watchToShareCfg)) {
            //     this._share.shareBtnWithGroupAndTimes(func1)
            //     return;
            // }

            // //common config 中配置了watchTimesCfg 当观看视频次数大于 watchTimesCfg时转为分享
            // let watchTimesCfg = this.getGlobalDataByName('watchTimesCfg');
            // if (watchTimesCfg && parseInt(watchTimesCfg) > 0) {
            //     let globalWatchTimes = this.getGlobalDataByName('globalWatchTimes');
            //     globalWatchTimes = globalWatchTimes ? globalWatchTimes : 0;
            //     if (globalWatchTimes && globalWatchTimes > parseInt(watchTimesCfg)) {
            //         this._share.shareBtnWithGroupAndTimes(func1)
            //         return;
            //     } else {
            //         global.setUserDataInfoByName('globalWatchTimes', globalWatchTimes + 1);
            //     }
            // }


            this._playAd(func1, func2);
        } else if (cc.sys.platform == cc.sys.QQ_PLAY) {
            qqPlay.playVideoAd(3, func1, func2);
        }


    },
    _shareOrPlayAd(func1, func2, flag = false) {
        if (flag) {
            this._playAd(func1, null, flag);
        } else {
            this._share.shareBtnWithGroupAndTimes(func1)
        }
    },
    _playAd(func1, func2, flag = false) {
        if (!!!self._isPlay) {
            self._isPlay = true;
            wxAd.playAd(func1, func2, self);
            self._playAdTimes = 5;
            self.schedule(self._playTime, 1);
        }
    },
    _playTime() {
        if (self._playAdTimes <= 0) {
            self._isPlay = false;
            self.unschedule(self._playTime);
            return;
        }
        self._playAdTimes--;
    },
    /**
     * 新的视频接口
     * @param {*} func1  带参数返回，1 表示分享回调， 0 /null/ undefine等 表示观看视频回调
     * @param {* } flag  特殊视频点功能，不能转换为分享点
     * 
     * 兼容目前：
     * 北上广深：屏蔽用户， 其他：其他用户
        getShowYd返回false:
        0： 诱导关（普通关模式）， 所有视频看完不分享，游戏要处理分享点都屏蔽
        getShowYd返回true:
        1： 诱导开（普通开模式）， 分享点，视频点都在，视频看完拉起分享
        2： 分享全开  针对所有用户，所有视频点变为分享点
        3： 弱安全模式 针对被屏蔽用户，先看视频，视频看不到变分享点 ， 其他用户都是分享
        4： 半安全模式 针对被屏蔽用户，先看视频，视频看不了不能分享，其他用户都是分享
        5： 高安全模式 针对被屏蔽用户，先看视频，视频看不了不能分享，针对其他用户先看视频，视频看不了可以分享
        6： 完全安全模式  针对所有用户看视频，视频看不了不能分享
     */
    playAdNew(func1, flag = false, num = -1) {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            let func2 = function (res) {
                if (!res && !flag) {
                    self.playAdToShare(func1, num);
                }

            }.bind(this)
            let cityFlag = global.getLoginCfgByKey('cityFlag');
            console.log("cityFlag == ", cityFlag)
            if (!config.isShowyd) {
                this._playAd(func1, null, flag);
            } else if (config.isShowyd == 1) {
                this._playAd(func1, func2, flag);
            } else if (config.isShowyd == 2) {
                this._shareOrPlayAd(func1, func2, flag)
            } else if (config.isShowyd == 3) {
                if (!cityFlag) {
                    this._shareOrPlayAd(func1, func2, flag)
                } else {
                    this._playAd(func1, func2, flag);
                }
            } else if (config.isShowyd == 4) {
                if (!cityFlag) {
                    this._shareOrPlayAd(func1, func2, flag)
                } else {
                    this._playAd(func1, null, flag);
                }
            } else if (config.isShowyd == 5) {
                if (!cityFlag) {
                    this._playAd(func1, func2, flag);
                } else {
                    this._playAd(func1, null, flag);
                }
            } else if (config.isShowyd == 6) {
                if (!cityFlag) {
                    this._playAd(func1, null, flag);
                } else {
                    this._playAd(func1, null, flag);
                }
            }
        }
    },

    /**
     * 跑马灯 文字 
     *
     * @param {*} text 
     */
    addDMLDText(text) {
        commonNode.getInstance().addText(text);
    },
    /**
     * true/false 主包 / 马甲包
     */
    getMajor() {
        return config.isMajor;
    },
    /**
     * 打开vip界面
     */
    getVipWidgetBtn() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            // self.vipWidget.active = true;
            self.vipWidget.getComponent('vipLayer').init();
        }
    },
    // 判断是否是贵宾
    isVip() {
        return vip.isVipActive();
    },
    // 设置vip按钮红点及点击事件
    setVipBtnCallback(btnNode) {
        vip.setRedPoint(btnNode);
        btnNode.on('click', this.getVipWidgetBtn, this);
    },
    // 获取固定vip value值 (一般不需要手动调用)
    getVipStableAbilityValue(index) {
        return vip.parseAbility('stable', index);
    },
    // 获取自己配置的vip value值
    getVipConfigAbilityValue(index) {
        return vip.parseAbility('configurable', index);
    },
    // 设置是否开启诱导分享
    setShowYdState(callback) {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            this._userOperate.showYdStatus(callback);
        }
    },

    // 获取诱导分享开启的状态
    getShowYdState() {
        if (cc.sys.platform == cc.sys.QQ_PLAY) {
            return true;
        }
        if (config.isShowyd) {
            return true;
        } else {
            return false;
        }

    },
    /**
     * 获取诱导开关，获取各种状态
     * 兼容目前：
        getShowYd返回false:
        0： 诱导关（普通关模式）， 所有视频看完不分享，游戏要处理分享点都屏蔽
        getShowYd返回true:
        1： 诱导开（普通开模式）， 分享点，视频点都在，视频看完拉起分享
        2： 分享全开
        3： 弱安全模式 
        4： 半安全模式
        5： 高安全模式
        6： 完全安全模式
     */
    getShowYd() {
        if (cc.sys.platform == cc.sys.QQ_PLAY) {
            return 1;
        }
        return config.isShowyd;
    },
    /**
     *  用户自定义数据 对象
     * object 必须是 {}  对象
     * 注: 禁止频繁调用此接口，会与服务器之间频繁交互
     * 
     */

    setBlob(object) {
        if (typeof object == 'object') {
            self._userOperate.setBlob(object);
        }
    },
    /**
     * 获取自定义数据
     */
    getBlob() {
        let blob = cc.sys.localStorage.getItem('blob');
        if (blob) {
            blob = JSON.parse(blob);
        }
        return blob;
    },
    /**
     * 拉取 blobmap数据,通过key
     * 注： 试用于大型 数据存储的游戏
     */
    getBlobMapByKey(key) {
        let info = global.getUserDataInfoByName('blobMap')
        if (!info) {
            let glBlob = cc.sys.localStorage.getItem("blobMap");
            if (glBlob) {
                glBlob = JSON.parse(glBlob);
                global.setUserDataInfoByName('blobMap', glBlob);
                info = glBlob;
            } else {
                info = {};
            }
        }
        return info[key];
    },
    /**
     * 拉取blobMap数据
     * 注： 试用于大型 数据存储的游戏
     */
    getBlobMap() {
        let info = global.getUserDataInfoByName('blobMap')
        if (!info) {
            let glBlob = cc.sys.localStorage.getItem("blobMap");
            if (glBlob) {
                glBlob = JSON.parse(glBlob);
                global.setUserDataInfoByName('blobMap', glBlob);
                info = glBlob;
            }
        }
        return info;
    },
    /**
     * 更新 blobMap数据，暂存在本地，不会上传服务器。
     * @param {*  } object 
     * 注： 可以使用 单个{key:value} 
     */
    updateBlobMapKeyValue(obj) {
        let glBlob = global.getUserDataInfoByName('blobMap');
        let glUpdateBlob = global.getUserDataInfoByName('updateBlobMap');
        if (glBlob) {
            for (let key in obj) {
                glBlob[key] = obj[key];
                if (glUpdateBlob) {
                    glUpdateBlob[key] = obj[key];
                }
            }
            if (glUpdateBlob) {
                global.setUserDataInfoByName('updateBlobMap', glUpdateBlob);
            }
            global.setUserDataInfoByName('blobMap', glBlob);
        } else {
            global.setUserDataInfoByName('blobMap', obj);
        }
        if (!glUpdateBlob) {
            global.setUserDataInfoByName('updateBlobMap', obj);
        }

    },
    /**
     * 设置 blobMap数据
     * @param {*  } object 
     * 注： 可以使用 单个{key:value} 更新服务器object数据
     */
    setBlobMap(object) {
        if (typeof object == 'object') {
            this._userOperate.setBlobMap(object);
        }
    },
    /**
     * 将 updateBlobmap 缓存数据上传服务器
     */
    setUpdateBlobMap() {
        this._userOperate.setUpdateBlobMap();
    },
    /**
     * 获取服务器common 配置, 通过key值
     * @param {* 使用的 key } name 
     */
    getSVRCommomCfgByName(name) {
        return global.getUserDataInfoByName(name);
    },
    /**
     * 微信弹框显示
     * @param {*内容} content 
     * @param {*点击确定回调函数} success 
     * @param {*点击取消回调函数} fail 
     * @param {*是否显示 取消开关，默认 false} showCancel 
     * @param {*标签} title 
     */
    showModal(content, success, fail, showCancel = false, title = '') {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.showModal({
                title: title,
                content: content,
                showCancel: showCancel,
                success: function (res) {
                    if (res.confirm) {
                        if (success && typeof success == 'function') success();
                    } else {
                        if (fail && typeof fail == 'function') fail();
                    }
                },
                fail: function (res) {
                    if (fail && typeof fail == 'function') fail();
                },
            })
        } else {
            if (this._showModalNode) {
                this._showModalNode.getComponent('showModal').init(content, success, fail, showCancel, title)
            } else {
                let modaItem = require('modaItem');
                if (modaItem) {
                    modaItem.loadShowModal(self, function () {
                        self._showModalNode.getComponent('showModal').init(content, success, fail, showCancel, title)
                    });
                }
            }
        }
    },

    /**
     * 下载分享文案图片
     * @param {*文案类型} num1 
     * @param {*对应类型文案的index} num2 
     */
    downloadImgEvent(num1 = 1, num2 = 0) {
        //下载后赋值
        if (typeof global.shareList == "undefined") {
            return;
        }
        if (num1 > 4) {
            console.log("global.shareList", global.shareList);
            return;
        }
        var tempData = global.shareList;
        if (typeof tempData[num1.toString()] == "undefined" || num2 >= tempData[num1.toString()].length) {
            self.downloadImgEvent(num1 + 1, 0);
        } else {
            let a = num1;
            let b = num2;
            self.wxDownloader(tempData[a.toString()][b].cdnurl, function (res) {
                var url = res.tempFilePath;
                global.shareList[a.toString()][b].cdnurl = url;
                self.downloadImgEvent(a, b + 1);
            }, function () {
                self.downloadImgEvent(a, b + 1);
            })
        }
    },
    /**..
     * 
     * @param {*下载链接} url 
     * @param {*下载成功} sucCallback 
     * @param {*下载失败} faiCallback 
     */
    wxDownloader(url, sucCallback = null, faiCallback = null) {
        wx.downloadFile({
            url: url,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            success: res => {
                if (sucCallback) {
                    sucCallback(res);
                }
            },
            fail: res => {
                if (faiCallback) {
                    faiCallback();
                }
            }
        })
    },
    /**
     * 根据tag 获取 邀请好友信息列表
     * @param {*} tag  不带tag 获取所有邀请好友， 带tag 获取tag分享下的好友
     * @param {*} callBack 
     * @param {*} newInvite  注： 新好友邀请设置 newInvite = 1; 获取的好友为“ 新创号 ”的好友信息
     */
    getInviteFriendsData(callBack, tag = 0, newInvite = 0) {
        if (cc.sys.platform == cc.sys.WECHAT_GAME)
            this._userOperate.getReportFriends(tag, callBack, newInvite)
        else if (cc.sys.platform == cc.sys.QQ_PLAY) {
            const qqSvrRequest = require('qqSvrRequest');
            qqSvrRequest.getFriends(tag, callBack);
        }
    },

    /**
     * 设置排行榜 称号/头衔
     * @param {*} titleName 
     */
    setTitleName(titleName) {
        this._userOperate.setTitleName(titleName)
    },

    /**
     * 唤起授权界面
     * @param {Function} success   用户授权成功回调
     * @param {Function} fail      用户不授权/授权失败回调, 如果fail填1: 表示fail回调和success一样
     */
    callAuthView(success, fail, changeBool) {
        let auth = require('auth').getInstance();
        auth.showAuthView(success, fail, changeBool);

    },

    /**
     * 金币礼包,从盒子端进入领取情况(只一次)
     * @param {成功领取回调} callback1
     * @param {领取失败回调} callback2
     */
    getCoinGiftOnlyEvent(callback1 = null, callback2 = null) {
        var coinGift = require("coinGift");
        coinGift.coinGiftOnlyCallback(callback1, callback2);
    },
    /** 
     *获取服务器时间 
     *@param {* callBack 回传服务器时间 参数 } callBack
     */
    getSvrTime(callBack) {
        this._userOperate.getAppSvrTime(callBack);
    },
    /**
     * 邀请红包
     * @param {*} callBack 
     */
    showInviteRedPocket(isTrue) {


        let inviteRedPocket = localStorage.getLocalStorage('inviteRedPocket');

        if (!isTrue) {
            if (!inviteRedPocket) {
                localStorage.setLocalStorage("inviteRedPocket", new Date().getTime());
            } else {
                let _time = new Date().getTime();
                let _t = (_time - inviteRedPocket) / 1000;
                if (_t < 24 * 60 * 60) {
                    return;
                }
                localStorage.setLocalStorage("inviteRedPocket", new Date().getTime());
            }
        }

        if (!this._inviteRedPocket) {
            cc.loader.loadRes('plugIn/inviteRedPocket/inviteRedPocket', cc.Prefab, function (err, prefab) {
                if (err) {
                    console.error(err)
                    return;
                }
                this._inviteRedPocket = cc.instantiate(prefab);
                this.node.addChild(this._inviteRedPocket, 100000);
                this._inviteRedPocket.getComponent('inviteRedPocket').setWxAddLayer(this)
                this._inviteRedPocket.getComponent('inviteRedPocket').showActive();
            }.bind(this))
        } else {
            this._inviteRedPocket.getComponent('inviteRedPocket').setWxAddLayer(this)
            this._inviteRedPocket.getComponent('inviteRedPocket').showActive();
        }
    },
    /**
    * 任务奖励
    * @param {*}  
    */
    showTaskLayer() {
        if (!this._taskLayer) {
            cc.loader.loadRes('plugIn/adtask/adtask', cc.Prefab, function (er, prefab) {
                this._taskLayer = cc.instantiate(prefab);
                this.node.addChild(this._taskLayer, 100000);
                this._taskLayer.getComponent('adtaskLayer').showActive();
            }.bind(this))
        } else {
            // this._taskLayer.getComponent('adtaskLayer').setWxAddLayer(this, callback);
            this._taskLayer.getComponent('adtaskLayer').showActive();
        }
    },
    /**
    * 任务奖励回调
    * @param {*}
    * callback: 奖励回调
    * bannerPath: banner广告节点路径，如果挂Canvas上直接传Canvas
    */
    setTaskCall(callback, bannerPath) {
        global.taskCall = callback;
        global.bannerPath = bannerPath;
    },
    /**
     * 显示 免费红包  （假红包机制）
     * @param {*} callBack 
     */
    showFreeRedPocket(callBack) {
        let gActConf = global.getUserDataInfoByName('globalActConfig');
        if (gActConf && gActConf['freeRedPocket'] == 1) {
            if (!this._freeRedPocket) {
                cc.loader.loadRes('plugin/freeRedPocket/freeRedPocket', cc.Prefab, function (err, prefab) {
                    if (err) {
                        console.error(err)
                        return;
                    }
                    this._freeRedPocket = cc.instantiate(prefab);
                    this.node.addChild(this._freeRedPocket, 100000);
                    this._freeRedPocket.getComponent('freeRedPocket').showActive();
                    this._freeRedPocket.getComponent('freeRedPocket').setWxAddLayer(this, callBack)
                }.bind(this))
            } else {
                this._freeRedPocket.getComponent('freeRedPocket').showActive();
                this._freeRedPocket.getComponent('freeRedPocket').setWxAddLayer(this, callBack)
            }
        }
    },
    /**
     * 获取 global map 配置信息；
     * 注：global map 通常存放从服务器拉取下来的配置信息
     * 
     */
    getGlobalDataByName(name) {
        let gloabalAct = global.getUserDataInfoByName('globalActConfig');
        if (gloabalAct) {
            return gloabalAct[name] || 0;
        }
        return 0;
    },
    /**
     * 获取更多好玩红点（显示/不显示）
     */
    getRedMoreGame() {
        let redMoreGame = localStorage.getLocalStorage('redMoreGame');

        if (!redMoreGame) {
            return true;
        }
        let _time = new Date().getTime();
        let _t = (_time - redMoreGame) / 1000;
        if (_t > 3 * 24 * 60 * 60) {
            return true;
        }
        return false;
    },
    /**
     * 点击更多好玩  记录红点
     */
    setRedMoreGame() {
        if (!this.getRedMoreGame()) {
            return;
        }
        let time = new Date().getTime();
        localStorage.setLocalStorage('redMoreGame', time);
    },

    /**
     * 获取定时开启时间
     * @param {*} name 
     * @param {*} time 
     */
    getOrderOpenTime(name = 'orderOpenTime', time = 3 * 24 * 3600) {
        if (typeof name != 'string') {
            return false;
        }
        let orderTime = localStorage.getLocalStorage(name);

        if (!orderTime) {
            return true;
        }
        let _time = new Date().getTime();
        let _t = (_time - orderTime) / 1000;
        if (_t > time) {
            return true;
        }
        return false;
    },
    /**
     * 点击设置 ，记录点击时间；
     */
    setOrderOpenTime(name = 'orderOpenTime', time = 3 * 24 * 3600) {
        if (!this.getOrderOpenTime(name, time)) {
            return;
        }
        let _time = new Date().getTime();
        localStorage.setLocalStorage(name, _time);
    },
    /**
     * 试玩复活 开关
     */
    getGameReviedFlag() {
        let info = adc.getAdRebornInfo();
        const appid = info['jmpid'];
        if (!appid) {
            return false;
        }
        return this.getOrderOpenTime('goTrialReviedFlag', 3 * 24 * 3600);
    },
    setGameReviedFlag() {
        this.setOrderOpenTime('goTrialReviedFlag', 3 * 24 * 3600)
    },
    /**
     * 试玩按钮
     * @param {*} callBack 
     */
    goTrialRevied(callBack) {
        if (cc.sys.platform != cc.sys.WECHAT_GAME) {
            return;
        }
        let info = adc.getAdRebornInfo();
        const appid = info['jmpid'] || "wx845a2f34af2f4235";
        if (!appid) {
            return;
        }
        var parm = info['parm'] || "pages/main/main?";
        parm = parm.indexOf('?') > 0 ? parm : parm + '?';
        parm = parm.indexOf('gender') > 0 ? parm : parm + '&gender=' + global.getGender();
        parm += '&gameRevied=1';
        const _share = info['url'];
        if (!wxAd.wxBversionLess("2.2.0")) {
            //do some thing;
            console.log("满足2.2.0");
            wx.navigateToMiniProgram({
                appId: appid,
                path: parm,
                envVersion: 'trial',
                success: (res) => {
                    console.log(res);
                },
                fail: (res) => {
                    if (adc.checkLink(_share) && res.errMsg.indexOf(appid) > 0)
                        preview.previewUrlImage(_share);
                }
            });
        }
        self.func = (res) => {
            console.log("goTrialRevied", res);
            if (res.query['gameRevied_1']) {
                wx.offShow(self.func);
                if (callBack && typeof callBack == 'function') callBack();
                self.setGameReviedFlag();
                callBack = null;

            }
        }
        wx.onShow(self.func)
    },

    /**
     * 获取进入游戏携带的参数
     * @param {*} key 
     */
    getPathParam(key) {
        if (cc.sys.platform != cc.sys.WECHAT_GAME) {
            return;
        }
        let launcInfo = wx.getLaunchOptionsSync();
        return launcInfo.query[key];
    },


    /**
     * 支付现金  
     * @param {JSON} payInfo 
     * amount金额的最小单位为分 值为整数 最低为 1代表 1 分钱 100代表 1 元
     * productName 购买的物品描述
     * extdata 充值的额外说明
     * payid 当前游戏的支付id 问服务器要，每个游戏固定
     * @param {function} callback 会在成功支付后，且检查用户余额成功后调用, 这个回调函数可能会回调三次
     * 回调函数会传入 ecode 和 data
     */
    payCash(payInfo, callback) {
        payment.iosPayment(payInfo, callback);
    },

    /**
     * 检查余额  
     * 检查成功后会设置global 中的accountBalance字段
     * @param {function} callback 回调函数  
     * 会在回调函数中传递余额的参数  ecode 和 data(data:{num: 1})
     */
    checkBalance(callback) {
        payment.checkPaymentResults(callback);
    },

    /**
     * 使用用户余额
     * @param {number} amount 要花费的金额
     * @param {function} _callBack 回调函数
     * 回调函数会传递 ecode 和 data
     */
    spendMoney(amount, callback) {
        this.checkBalance(function (res) {
            if (res.ecode == 0) {
                if (res.data.num >= amount) {
                    payment.expenseAccountAmount(amount, callback);
                } else {
                    let errorMsg = {
                        data: "user balance is not planty",
                        ecode: 608
                    }
                    callback(errorMsg);
                }
            } else {
                let errorMsg = {
                    data: "can`t get blance info ",
                    ecode: 607
                }
                callback(errorMsg);
            }

        }.bind(this));
        this.checkBalance();
    },

    /**
     * 获取用户的余额
     */
    getBalance() {
        return global.accountBalance;
    },

    /**
     * 增加钻石
     * @param {number} num 钻石数量
     * @param {string}  addReason 加钻石的原因 如果存在没有列出的情况，请做标记，依次加
     * 默认2001 分享加钻石
     * 2002 看视频加钻石
     * 2003 做任务加钻石
     * @param {function} callback  
     * 成功和失败都会调用callback  
     * 如果ecode 为 0 表示加钻石成功
     * 同时会返回 data 表示总的钻石数
     */
    addDiamond(num, callback, addReason) {
        this.checkBalance(function (res) {
            if (res.ecode == 0) {
                diamondControl.AddTheDiamond(num, callback, addReason);
            }
        }.bind(this));
        this.checkBalance();
    },

    /**
     * 公众号拉粉 回调函数
     * @param {*} func 
     */
    setOfficialAccountsFunc(func) {
        this.setShareSpecialFunc(func, 'vpnaFlag');
    },

    /************************************************************
     * *****************************玩一玩功能********************
     * **********************************************************
     */

    /**
     * 检查是否关注公众号
     * callback  返回 1 / 0;
     */
    checkPubAccountState(callback) {
        qqPlay.checkPubAccountState(config['qqPUIN'], callback);
    },
    /**
     * 进入公众号
     */
    enterPubAccountCard() {
        qqPlay.enterPubAccountCard(config['qqPUIN']);
    },

    /**
     * 跳转其他游戏
     */
    skipGame(gameId, extendInfo) {
        qqPlay.skipGame(gameId, extendInfo)
    },
    /**
     * 运维数据上报
     * @param {*} infoList 
     * @param {*} baseInfo 
     * @param {*} playerAttr 
     * @param {*} passInfo 
     *  //     "infoList": [              //通用数据上报列表
        //         {
        //             "type": 1,         //必选。数据类型。
        //             "op": 1,           //必选。运营类型。1表示增量，2表示存量。
        //             "num": 1,          //必选。数目。不超过32位有符号数。
        //             "extId": 1         //可选。扩展Id。用于特殊数据的上报，如果要填，不能是0。
        //         }
        //     ],

        //     //以下字段为兼容历史，优先使用上面的“通用数据上报”。
        //     "baseInfo": {              //基本信息
        //         "score": 80,           //分数
        //         "gameMode": 1,         //游戏模式。1：普通，2：挑战
        //         "playWay": 1,          //互动方式。1：单人，2：邀请好友，3：被好友邀请，4：匹配赛
        //     },
        //     "playerAttr": {            //玩家属性（可选）
        //         "level": 3,            //玩家的经验等级（时间积累）
        //         "danLevel": 6,         //玩家的战力等级（游戏技能）
        //         "power": 300           //玩家战斗力
        //     },
        //     "passInfo": {              //过关信息（可选）
        //         "passNum": 3,          //本局游戏通过的最高关卡数，比如本局游戏通过了8,9,10关，上报10（不关注以前是否通过第10关）
        //         "passList": [{         //本局游戏通过的关卡列表
        //             "index": 1,        //第几关
        //         }],
        //         "upPassNum": 1         //本局游戏新通过关卡数，比如通过了8,9,10关,9,10是以前没有通过的，上报2
        //     }
     */
    reportGameResult(infoList, baseInfo, playerAttr = null, passInfo = null) {
        qqPlay.reportGameResult(infoList, baseInfo, playerAttr, passInfo);
    },
    /**
     * andriod 发送游戏快捷方式到桌面
     * @param {*} extendInfo 
     */
    createShortCut(extendInfo = null) {
        qqPlay.createShortCut(extendInfo);
    }
});