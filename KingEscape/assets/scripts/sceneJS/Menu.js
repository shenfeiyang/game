//角色信息数据
import roleData from '../data/roletbl';
//全局设置数据
import globaltbl from '../data/globaltbl';
//buff设置
import bufftbl from '../data/bufftbl';

//场景传值
import sessionData from "./sessionData";

//登录天数js
import globalJS from '../wx/global/global';

cc.Class({
    extends: cc.Component,

    properties: {

        goalWindowPrefab: {
            default: null,
            type: cc.Prefab,
            displayName: '每日目标弹窗预制体'
        },

        wealWindowPrefab: {
            default: null,
            type: cc.Prefab,
            displayName: '每日福利弹窗预制体'
        },

        handbookWindowPrefab: {
            default: null,
            type: cc.Prefab,
            displayName: '进化图鉴弹窗预制体'
        },

        rankWindowPrefab: {
            default: null,
            type: cc.Prefab,
            displayName: '排行榜窗口预制体'
        },

        advanceWindowPrefab: {
            default: null,
            type: cc.Prefab,
            displayName: '能力强化界面预制体'
        },

        wheelWindowPrefab: {
            default: null,
            type: cc.Prefab,
            displayName: '转盘界面预制体'
        },

        audioBtn: {
            default: null,
            type: cc.Node,
            displayName: '声音开关按钮'
        },

        rankBtn: {
            default: null,
            type: cc.Node,
            displayName: '排行榜按钮'
        },

        title: {
            default: null,
            type: cc.Node,
            displayName: '游戏名字'
        },

        rect: {
            default: null,
            type: cc.Node,
            displayName: '历史战绩'
        },

        audioBtnSpriteFrame: {
            default: [],
            type: [cc.SpriteFrame],
            displayName: '声音开关图片'
        },

        btnGoal: {
            default: null,
            type: cc.Node,
            displayName: '每日目标'
        },

        btnWeal: {
            default: null,
            type: cc.Node,
            displayName: '每日福利'
        },

        btnWheel: {
            default: null,
            type: cc.Node,
            displayName: '幸运转盘'
        },

        lastKillNumLabel: cc.Label,
        lastScoreLabel: cc.Label,
        lastTimeLabel: cc.Label,
        mostKillNumLabel: cc.Label,
        mostScoreLabel: cc.Label,
        mostTimeLabel: cc.Label,
        reviveNumLabel: cc.Label,

        //角色图片
        roleAllSp: cc.SpriteAtlas,
        //武器图片
        weaponAllSp: cc.SpriteAtlas,

        //精品推荐
        goodGame: cc.Node,

        //历史记录
        oldScore: cc.Node,

        //开始按钮
        btnStart: cc.Node,
        //更多游戏按钮
        btnMore: cc.Node,

        //banner
        banner: cc.Node,

        //小红点
        redPoint1: cc.Node,
        redPoint2: cc.Node,
        redPoint3: cc.Node,

        //每日福利界面领取提示
        wealTip: cc.Prefab,
    },

    onLoad() {

    },

    start() {
        //角色信息表
        this.roleData = roleData;
        //buff信息表
        this.bufftbl = bufftbl;
        //配置表
        this.globaltbl = globaltbl;

        //场景传值
        this.sessionData = sessionData;

        //角色图集
        this.roleAllSpArr = this.roleAllSp.getSpriteFrames();
        //武器图集
        this.weaponAllSpArr = this.weaponAllSp.getSpriteFrames();

        //初始拥有复活币的数量
        this.reviveCoinInit = parseInt(this.globaltbl.get(16).value);
        //每日福利增加复活币数
        this.wealOnceReviveCoinNum = parseInt(this.globaltbl.get(1).value);
        //每次福利每日最多可获得次数
        this.wealReviveCoinMaxNum = parseInt(this.globaltbl.get(2).value);

        //首页所需数值
        this.mostLevel = 1;
        this.lastKillNum = 0;
        this.lastScore = 0;
        this.lastLiveTime = 0;
        this.mostKillNum = 0;
        this.mostScore = 0;
        this.mostLiveTime = 0;

        //复活币
        this.reviveCoinNum = this.reviveCoinInit;
        //飞镖
        this.dartNum = 0;
        //护盾
        this.shieldNum = 0;
        //幸运转盘开局10级
        this.wheelMostBuff = '0';

        //gc后台接口文件
        this.gc = this.node.getComponent('wxAddLayer');
        //最高得分
        this.mostScore = this.gc.getScorePlus('mostScore') ? this.gc.getScorePlus('mostScore') : 0;
        //最高击杀数
        this.mostKillNum = this.gc.getScorePlus('mostKillNum') ? this.gc.getScorePlus('mostKillNum') : 0;

        this.gc.setScore(this.mostScore);

        //其他数据
        let otherData = this.gc.getBlobMap();
        if (otherData) {
            //最高等级
            this.mostLevel = otherData['mostLevel'] ? otherData['mostLevel'] : 1;
            //最长存活时间
            this.mostLiveTime = otherData['mostLiveTime'] ? otherData['mostLiveTime'] : 0;

            //上一局最高击杀数
            this.lastKillNum = otherData['lastKillNum'] ? otherData['lastKillNum'] : 0;
            //上一局最高得分
            this.lastScore = otherData['lastScore'] ? otherData['lastScore'] : 0;
            //上一局存活时间
            this.lastLiveTime = otherData['lastLiveTime'] ? otherData['lastLiveTime'] : 0;

            //复活币
            if (otherData['reviveCoin'] === undefined) {
                this.reviveCoinNum = this.reviveCoinInit;
                this.gc.setBlobMap({
                    reviveCoin: this.reviveCoinNum
                });
            } else {
                if (otherData['reviveCoin'] < 0) {
                    this.reviveCoinNum = 0;
                    this.gc.setBlobMap({
                        reviveCoin: this.reviveCoinNum
                    });
                } else {
                    this.reviveCoinNum = otherData['reviveCoin'];
                }
            }

            //飞镖
            this.dartNum = otherData['dartNum'] ? otherData['dartNum'] : 0;
            //护盾
            this.shieldNum = otherData['shieldNum'] ? otherData['shieldNum'] : 0;
            //幸运转盘开局10级
            this.wheelMostBuff = otherData['wheelMostBuff'] ? otherData['wheelMostBuff'] : '0';
        } else {
            this.gc.setBlobMap({
                reviveCoin: this.reviveCoinNum
            });
        }

        this.lastKillNumLabel.string = this.lastKillNum.toString();
        this.lastScoreLabel.string = this.lastScore.toString();
        this.lastTimeLabel.string = this.timeConvert(this.lastLiveTime);
        this.mostKillNumLabel.string = this.mostKillNum.toString();
        this.mostScoreLabel.string = this.mostScore.toString();
        this.mostTimeLabel.string = this.timeConvert(this.mostLiveTime);
        this.reviveNumLabel.string = this.reviveCoinNum.toString();

        //刘海屏适配
        this.screenAdaptive();

        //音效管理
        this.audio = this.node.getComponent('audioControll');
        this.audio.updateIsOpen();

        if (this.sessionData.isOpen) {
            this.audioBtn.getComponent(cc.Sprite).spriteFrame = this.audioBtnSpriteFrame[0];
        } else {
            this.audioBtn.getComponent(cc.Sprite).spriteFrame = this.audioBtnSpriteFrame[1];
        }

        //banner
        this.bannerAd = this.banner.getComponent('BannerAd');
        this.bannerAd.startLoop();

        //开始游戏和更多游戏的呼吸动画
        this.btnHuxi();
        this.unschedule(this.btnHuxi);
        this.schedule(this.btnHuxi, 4);

        //showYD
        this.isAllowShare = this.gc.getShowYd();
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            if (!this.isAllowShare) {
                this.btnWeal.active = false;
                this.btnGoal.active = false;
                this.btnWheel.active = false;
            } else {
                this.btnWeal.active = true;
                this.btnGoal.active = true;
                this.btnWheel.active = true;

                //每日目标窗口主动弹出策略
                if (globalJS.getLoginDays() > 1) {
                    this.openGoalWindow();
                } else if (globalJS.getLoginDays() == 1) {
                    let firstGameTime = cc.sys.localStorage.getItem('firstGameTime');
                    if (firstGameTime) {
                        this.openGoalWindow();
                    } else {
                        cc.sys.localStorage.setItem('firstGameTime', new Date().getTime());
                    }
                }
            }
        }

        //红点提示
        this.redPointTip1(otherData);
        this.redPointTip2();
        this.redPointTip3();
        //感叹号动态效果
        this.schedule(this.tipPointEffect, 3)
    },

    //感叹号动态效果
    tipPointEffect() {
        if (this.redPoint1.active) {
            let action1 = cc.scaleTo(0.3, 1.5, 1.5);
            let action2 = cc.rotateTo(0.1, -30);
            let action3 = cc.rotateTo(0.1, 30);
            let action4 = cc.rotateTo(0.1, -30);
            let action5 = cc.rotateTo(0.1, 30);
            let action6 = cc.rotateTo(0.1, 0);
            let action7 = cc.scaleTo(0.3, 1, 1);
            this.redPoint1.runAction(cc.sequence(action1, action2, action3, action4, action5, action6, action7));
        }
        if (this.redPoint2.active) {
            let action1 = cc.scaleTo(0.3, 1.5, 1.5);
            let action2 = cc.rotateTo(0.1, -30);
            let action3 = cc.rotateTo(0.1, 30);
            let action4 = cc.rotateTo(0.1, -30);
            let action5 = cc.rotateTo(0.1, 30);
            let action6 = cc.rotateTo(0.1, 0);
            let action7 = cc.scaleTo(0.3, 1, 1);
            this.redPoint2.runAction(cc.sequence(action1, action2, action3, action4, action5, action6, action7));
        }
        if (this.redPoint3.active) {
            let action1 = cc.scaleTo(0.3, 1.5, 1.5);
            let action2 = cc.rotateTo(0.1, -30);
            let action3 = cc.rotateTo(0.1, 30);
            let action4 = cc.rotateTo(0.1, -30);
            let action5 = cc.rotateTo(0.1, 30);
            let action6 = cc.rotateTo(0.1, 0);
            let action7 = cc.scaleTo(0.3, 1, 1);
            this.redPoint3.runAction(cc.sequence(action1, action2, action3, action4, action5, action6, action7));
        }
    },

    //红点提示1
    redPointTip1(data) {
        let self = this;
        this.gc.getInviteFriendsData((res) => {
            if (res.length === 0) {
                self.redPoint1.active = false;
            } else if (res.length > 0) {
                if (res.length === 1) {
                    if (data['inviteBuff1']) {
                        if (self.isSameDay(parseInt(data['inviteBuff1']), new Date().getTime())) {
                            self.redPoint1.active = false;
                        } else {
                            self.redPoint1.active = true;
                        }
                    }
                } else if (res.length === 2) {
                    if (data['inviteBuff2']) {
                        if (self.isSameDay(parseInt(data['inviteBuff2']), new Date().getTime())) {
                            self.redPoint1.active = false;
                        } else {
                            self.redPoint1.active = true;
                        }
                    }
                } else if (res.length >= 3) {
                    if (data['inviteBuff3']) {
                        if (self.isSameDay(parseInt(data['inviteBuff3']), new Date().getTime())) {
                            self.redPoint1.active = false;
                        } else {
                            self.redPoint1.active = true;
                        }
                    }
                }
            }
        })
    },

    //红点提示2
    redPointTip2() {
        let wealData = this.gc.getBlobMapByKey('wealGetTimes');
        let times = wealData ? wealData.split('_') : '0_0'.split('_');
        if (!this.isSameDay(parseInt(times[0]), new Date().getTime()) || parseInt(times[1]) < this.wealReviveCoinMaxNum) {
            this.redPoint2.active = true;
        } else {
            this.redPoint2.active = false;
        }
    },

    //红点提示3
    redPointTip3() {
        let shareData = cc.sys.localStorage.getItem('wheelShare') ? cc.sys.localStorage.getItem('wheelShare').split('_') : '0_0'.split('_');
        let videoData = cc.sys.localStorage.getItem('wheelVideo') ? cc.sys.localStorage.getItem('wheelVideo').split('_') : '0_0'.split('_');
        //分享抽取初始次数
        let shareNumInit = parseInt(this.globaltbl.get(27).value);
        //视频抽取初始次数
        let videoNumInit = parseInt(this.globaltbl.get(28).value);
        if (shareData[0] == new Date().toLocaleDateString() && parseInt(shareData[1]) >= shareNumInit && videoData[0] == new Date().toLocaleDateString() && parseInt(videoData[1]) >= videoNumInit) {
            this.redPoint3.active = false;
        } else {
            this.redPoint3.active = true;
        }
    },

    //判断是否是同一天
    isSameDay(oldTime, nowTime) {
        let oldDate = new Date(oldTime);
        let nowDate = new Date(nowTime);

        let old = oldDate.getFullYear() + '' + oldDate.getMonth() + '' + oldDate.getDate();
        let now = nowDate.getFullYear() + '' + nowDate.getMonth() + '' + nowDate.getDate();

        if (old === now) {
            return true;
        } else {
            return false;
        }
    },

    //刘海屏适配
    screenAdaptive() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            let self = this;
            wx.getSystemInfo({
                success(res) {
                    if (res.windowWidth / res.windowHeight > 2) {
                        self.audioBtn.getComponent(cc.Widget).left = 85;
                        self.rankBtn.getComponent(cc.Widget).left = 85;
                        self.oldScore.getComponent(cc.Widget).left = 65;
                        self.title.getComponent(cc.Widget).left = 180;
                        self.goodGame.getComponent(cc.Widget).left = 312;
                    } else {
                        self.audioBtn.getComponent(cc.Widget).left = 40;
                        self.rankBtn.getComponent(cc.Widget).left = 40;
                        self.oldScore.getComponent(cc.Widget).left = 18;
                        self.title.getComponent(cc.Widget).left = 135;
                        self.goodGame.getComponent(cc.Widget).left = 257;
                    }
                }
            });
        }
    },

    //开始游戏和更多游戏的呼吸动画
    btnHuxi() {
        let action1 = cc.scaleTo(2, 1.1);
        let action2 = cc.scaleTo(2, 1);
        this.btnMore.runAction(cc.sequence(action1, action2));
        let action3 = cc.scaleTo(2, 1.1);
        let action4 = cc.scaleTo(2, 1);
        this.btnStart.runAction(cc.sequence(action3, action4));
    },

    update(dt) {

    },

    //时间转换
    timeConvert(time) {
        let hour = parseInt(time / (60 * 60 * 1000));
        let minute = parseInt((time % (60 * 60 * 1000)) / (60 * 1000));
        let second = parseInt((time % (60 * 1000)) / 1000);
        let finalTime = '';
        if (hour < 10) {
            finalTime += '0' + hour.toString() + ':';
        } else {
            finalTime += hour.toString() + ':';
        }
        if (minute < 10) {
            finalTime += '0' + minute.toString() + ':';
        } else {
            finalTime += minute.toString() + ':';
        }
        if (second < 10) {
            finalTime += '0' + second.toString();
        } else {
            finalTime += second.toString();
        }
        return finalTime;
    },

    onBtnStart() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            if (!this.isAllowShare) {
                cc.director.loadScene('GameScene');
            } else {
                this.openAdvanceWindow();
            }
        } else {
            this.openAdvanceWindow();
        }


        //按钮音效
        this.audio.onGameStartAudio();
    },

    onBtnAudio() {
        if (this.audioBtn.getComponent(cc.Sprite).spriteFrame === this.audioBtnSpriteFrame[0]) {
            //声音关
            this.audioBtn.getComponent(cc.Sprite).spriteFrame = this.audioBtnSpriteFrame[1];
            this.sessionData.isOpen = false;
        } else {
            //声音开
            this.audioBtn.getComponent(cc.Sprite).spriteFrame = this.audioBtnSpriteFrame[0];
            this.sessionData.isOpen = true;
        }

        this.audio.updateIsOpen();
        //按钮音效
        this.audio.onButtonAudio();
    },

    //打开强化界面
    openAdvanceWindow() {
        this.advanceWindow = cc.instantiate(this.advanceWindowPrefab);
        this.node.addChild(this.advanceWindow);
        this.advanceWindow.getComponent('advanceWindow').init(this);
        this.advanceWindow.getComponent('advanceWindow').openAdvanceWindow();
    },

    //打开进化图鉴弹窗
    openHandbookWindow() {
        let handbookWindow = cc.instantiate(this.handbookWindowPrefab);
        this.node.addChild(handbookWindow);
        handbookWindow.getComponent('handbookWindow').init(this.mostLevel, this.roleData, this);

        //按钮音效
        this.audio.onButtonAudio();
    },

    //寻找角色图片
    findRoleSp(name) {
        for (let value of this.roleAllSpArr) {
            if (value.name === name) {
                return value;
            }
        }
        return this.roleAllSpArr[1];
    },

    //寻找武器图片
    findWeaponSp(name) {
        for (let value of this.weaponAllSpArr) {
            if (value.name === name) {
                return value;
            }
        }
        return this.weaponAllSpArr[0];
    },

    //打开每日目标弹窗
    openGoalWindow() {
        let goalWindow = cc.instantiate(this.goalWindowPrefab);
        this.node.addChild(goalWindow);
        goalWindow.getComponent('goalWindow').init(this);

        //按钮音效
        this.audio.onButtonAudio();
    },

    //打开每日福利弹窗
    openWealWindow() {
        let wealWindow = cc.instantiate(this.wealWindowPrefab);
        this.node.addChild(wealWindow);
        wealWindow.getComponent('wealWindow').init(this);

        //按钮音效
        this.audio.onButtonAudio();
    },

    //打开排行榜窗口
    openRankWindow() {
        let rankWindow = cc.instantiate(this.rankWindowPrefab);
        this.node.addChild(rankWindow);
        rankWindow.getComponent('rankWindow').init(this);
        rankWindow.getComponent('rankWindow').onBtnFriendRank();
    },

    //每日福利界面领取提示
    wealWindowTip() {
        //领取提示
        this.getTip = cc.instantiate(this.wealTip);
        this.getTip.opacity = 0;
        this.getTip.runAction(cc.fadeTo(0.2, 255));
        this.node.addChild(this.getTip);
        this.scheduleOnce(() => {
            this.getTip.runAction(cc.sequence(cc.fadeTo(0.2, 0), cc.callFunc(this.removeTip, this)));
        }, 2);
    },

    //移除提示窗
    removeTip() {
        this.node.removeChild(this.getTip)
    },

    //更多游戏按钮
    onBtnMore() {
        //按钮音效
        this.audio.onButtonAudio();
    },

    //打开转盘界面
    openWheelWindow() {
        let wheelWindow = cc.instantiate(this.wheelWindowPrefab);
        this.node.addChild(wheelWindow);
        wheelWindow.getComponent('wheelWindow').init(this);
    }
});
