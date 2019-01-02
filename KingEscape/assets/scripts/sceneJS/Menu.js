//角色信息数据
import roleData from '../data/roletbl';
//全局设置数据
import globaltbl from '../data/globaltbl';
//buff设置
import bufftbl from '../data/bufftbl';

//场景传值
import sessionData from "./sessionData";

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

        //开始按钮
        btnStart: cc.Node,
        //更多游戏按钮
        btnMore: cc.Node,

        //banner
        banner: cc.Node
    },

    onLoad() {

    },

    start() {
        //角色信息表
        this.roleData = roleData;
        //buff信息表
        this.bufftbl = bufftbl;

        //场景传值
        this.sessionData = sessionData;

        //角色图集
        this.roleAllSpArr = this.roleAllSp.getSpriteFrames();
        //武器图集
        this.weaponAllSpArr = this.weaponAllSp.getSpriteFrames();

        //初始拥有复活币的数量
        this.reviveCoinInit = parseInt(globaltbl.get(16).value);
        //每日福利增加复活币数
        this.wealOnceReviveCoinNum = parseInt(globaltbl.get(1).value);
        //每次福利每日最多可获得次数
        this.wealReviveCoinMaxNum = parseInt(globaltbl.get(2).value);

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
        this.banner.getComponent('BannerAd').startLoop();

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
            }else{
                this.btnWeal.active = true;
                this.btnGoal.active = true;
            }
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
                        self.title.getComponent(cc.Widget).left = 180;
                        self.goodGame.getComponent(cc.Widget).left = 302;
                    } else {
                        self.audioBtn.getComponent(cc.Widget).left = 40;
                        self.rankBtn.getComponent(cc.Widget).left = 40;
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

    //更多游戏按钮
    onBtnMore() {
        //按钮音效
        this.audio.onButtonAudio();
    }
});
