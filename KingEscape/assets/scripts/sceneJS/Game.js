import Stage from '../windowJS/Stage';
//角色信息数据
import roleData from '../data/roletbl';
//全局设置数据
import globaltbl from '../data/globaltbl';
//食物经验设置
import exp_balltbl from '../data/exp_balltbl';
//buff设置
import bufftbl from '../data/bufftbl';

//场景传值
import sessionData from "./sessionData";

//宝箱道具界面
import treasure from '../data/treasure';

cc.Class({
    extends: cc.Component,

    properties: {
        //舞台控制类
        stage: {
            default: null,
            type: Stage
        },

        //攻击按钮
        btnSlash: {
            default: null,
            type: cc.Node
        },

        //加速按钮
        btnSpeet: {
            default: null,
            type: cc.Node
        },

        //护盾按钮
        btnDun: {
            default: null,
            type: cc.Node
        },

        //飞镖按钮
        btnFeibiao: {
            default: null,
            type: cc.Node
        },

        //等级文本
        levelLabel: {
            default: null,
            type: cc.Label
        },

        //击败文本
        killLabel: {
            default: null,
            type: cc.Label
        },

        //复活界面预制体
        reviveWindowPrefab: {
            default: null,
            type: cc.Prefab
        },

        //击败奖励界面预制体
        awardWindowPrefab: {
            default: null,
            type: cc.Prefab
        },

        //能力强化界面预制体
        advanceWindowPrefab: {
            default: null,
            type: cc.Prefab
        },

        //游戏结束界面预制体
        overWindowPrefab: {
            default: null,
            type: cc.Prefab
        },

        //排行榜预制体
        rankWindowPrefab: {
            default: null,
            type: cc.Prefab
        },

        //宝箱界面预制体
        boxWindowPrefab: {
            default: null,
            type: cc.Prefab
        },

        //游戏背景
        gameBg: {
            default: null,
            type: cc.Node
        },

        //游戏界面排行
        rank: {
            default: null,
            type: cc.Node
        },

        killTip: cc.Node,

        buff1Tip: cc.Node,
        buff2Tip: cc.Node,
        buff3Tip: cc.Node,

        //特效
        spine: cc.Prefab,
        dragonBone: cc.Prefab,

        //弹窗节点
        window: cc.Node,

        //banner广告节点
        banner: cc.Node,

        //精品推荐
        goodGame: cc.Node,

        //护盾个数
        shieldNumLabel: cc.Label,
        //护盾倒计时时间
        shieldTime: cc.Node,
        //护盾倒计时时间背景
        shieldTimeBg: cc.Node,

        //飞镖个数
        dartNumLabel: cc.Label,
        //飞镖倒计时时间
        dartTime: cc.Node,
        //飞镖倒计时时间背景
        dartTimeBg: cc.Node,
    },

    onLoad() {

    },

    start() {
        //角色信息表
        this.roleData = roleData;
        //经验球数值表
        this.exp_ball = exp_balltbl;
        //buff信息表
        this.bufftbl = bufftbl;

        //场景传值
        this.sessionData = sessionData;

        //宝箱道具表
        this.treasure = treasure;

        //设置场景大小
        let size = globaltbl.get(3).value.split(',');
        this.gameBg.setContentSize(parseInt(size[0]), parseInt(size[1]));

        //设置经验球最大数量
        this.foodMax = parseInt(globaltbl.get(5).value);

        //经验怪最大数量
        this.expEnemyMax = parseInt(globaltbl.get(7).value);

        //设置智能AI最大数量
        this.enemyMax = parseInt(globaltbl.get(8).value);

        //随机最大等级差
        this.levelMaxGap = parseInt(globaltbl.get(9).value);

        //随机最小等级差
        this.levelMinGap = parseInt(globaltbl.get(11).value);

        //设置连击时间(秒)
        this.killMultiTime = parseInt(globaltbl.get(10).value);

        //加速倍率
        this.speedRate = parseFloat(globaltbl.get(12).value);

        //Ai追击触发后持续时长（秒）
        this.AIchaseTime = parseInt(globaltbl.get(13).value);

        //Ai加速触发后持续时长（秒）
        this.AIquickTime = parseInt(globaltbl.get(14).value);

        //Ai吃球触发后持续时长（秒）
        this.AIeatTime = parseInt(globaltbl.get(15).value);

        //Ai逃跑触发后持续时长（秒）
        this.AIescapeTime = parseInt(globaltbl.get(17).value);

        //飞镖速度
        this.dartSpeed = parseFloat(globaltbl.get(20).value);

        //护盾持续时间
        this.dartShowTime =  parseInt(globaltbl.get(21).value);

        //宝箱出现时间间隔
        this.boxTime = parseInt(globaltbl.get(24).value);
        //宝箱额外奖励
        this.boxOtherGift = parseInt(globaltbl.get(25).value);

        //gc后台接口
        this.gc = this.node.getComponent('wxAddLayer');

        //首页所需数值
        this.mostLevel = 1;
        this.lastKillNum = 0;
        this.lastScore = 0;
        this.lastLiveTime = 0;
        this.mostKillNum = 0;
        this.mostScore = 0;
        this.mostLiveTime = 0;
        //复活币
        this.reviveCoinNum = 0;
        //开局10级
        this.inviteBuff3 = 1;

        //飞镖
        this.dartNum = 0;
        //护盾
        this.shieldNum = 0;

        //当前游戏金币
        this.totalMoney = this.gc.getGold();

        //最高击杀数
        this.mostKillNum = this.gc.getScorePlus('mostKillNum') ? this.gc.getScorePlus('mostKillNum') : 0;
        //最高得分
        this.mostScore = this.gc.getScorePlus('mostScore') ? this.gc.getScorePlus('mostScore') : 0;

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
            this.reviveCoinNum = otherData['reviveCoin'];

            //飞镖
            this.dartNum = otherData['dartNum'] ? otherData['dartNum'] : 0;
            //护盾
            this.shieldNum = otherData['shieldNum'] ? otherData['shieldNum'] : 0;

            //开局10级buff
            if (otherData['inviteBuff3']) {
                if (this.isSameDay(parseInt(otherData['inviteBuff3']), new Date().getTime())) {
                    this.inviteBuff3 = 10;
                }
            } else if (otherData['wheelMostBuff']) {
                if (otherData['wheelMostBuff'] == new Date().toLocaleDateString()) {
                    this.inviteBuff3 = 10;
                }
            }
        }

        //四种buff加成情况
        //武器长度
        this.buff1 = 0;
        //移动速度
        this.buff2 = 0;
        //挥刀速度
        this.buff3 = 0;
        //初始等级
        this.buff4 = 0;

        let wheelBuff1Data = cc.sys.localStorage.getItem('wheelBuff1') ? cc.sys.localStorage.getItem('wheelBuff1').split('_') : '0_0'.split('_');
        if (wheelBuff1Data[0] == new Date().toLocaleDateString()) {
            this.wheelBuff1 = parseFloat(wheelBuff1Data[1]);
        } else {
            this.wheelBuff1 = 0;
        }
        let wheelBuff2Data = cc.sys.localStorage.getItem('wheelBuff2') ? cc.sys.localStorage.getItem('wheelBuff2').split('_') : '0_0'.split('_');
        if (wheelBuff2Data[0] == new Date().toLocaleDateString()) {
            this.wheelBuff2 = parseFloat(wheelBuff2Data[1]);
        } else {
            this.wheelBuff2 = 0;
        }
        let wheelBuff3Data = cc.sys.localStorage.getItem('wheelBuff3') ? cc.sys.localStorage.getItem('wheelBuff3').split('_') : '0_0'.split('_');
        if (wheelBuff3Data[0] == new Date().toLocaleDateString()) {
            this.wheelBuff3 = parseFloat(wheelBuff3Data[1]);
        } else {
            this.wheelBuff3 = 0;
        }

        //宝箱限时buff
        this.boxBuff1 = 0;
        this.boxBuff2 = 0;
        this.boxBuff3 = 0;

        //初始化舞台控制类
        this.stage.init(this);
        this.onBtnSlash();
        this.onBtnSpeet();
        this.onBtnDartEvent();
        this.onBtnShieldEvent();

        this.startGame();

        //刘海屏适配
        this.screenAdaptive();

        //音效管理
        this.audio = this.node.getComponent('audioControll');
        this.audio.updateIsOpen();

        //游戏背景音乐
        this.audio.onPlayBgAudio();

        //banner
        this.bannerAd = this.banner.getComponent('BannerAd');
        this.bannerAd.startLoop();
        this.bannerAd.hide();

        //showYD
        this.isAllowShare = this.gc.getShowYd();

        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.onHide(this.wxOnHide);
            wx.onShow(this.wxOnShow);
        }

        //宝箱界面是否打开
        this.boxIsOpen = false;
    },

    wxOnHide() {
        //保存复活前的游戏时长
        this.gameTime += new Date().getTime() - this.gameStartTime;
        //记录时间戳
        this.gameStartTime = new Date().getTime();
    },

    wxOnShow() {
        //记录时间戳
        this.gameStartTime = new Date().getTime();
    },

    //刘海屏适配
    screenAdaptive() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            let self = this;
            wx.getSystemInfo({
                success(res) {
                    if (res.windowWidth / res.windowHeight > 2) {
                        self.rank.getComponent(cc.Widget).left = 70;
                        self.killTip.getComponent(cc.Widget).left = 70;
                        self.buff1Tip.getComponent(cc.Widget).left = 85;
                        self.buff2Tip.getComponent(cc.Widget).left = 85;
                        self.buff3Tip.getComponent(cc.Widget).left = 85;
                        self.goodGame.getComponent(cc.Widget).left = 302;
                    } else {
                        self.rank.getComponent(cc.Widget).left = 10;
                        self.killTip.getComponent(cc.Widget).left = 10;
                        self.buff1Tip.getComponent(cc.Widget).left = 25;
                        self.buff2Tip.getComponent(cc.Widget).left = 25;
                        self.buff3Tip.getComponent(cc.Widget).left = 25;
                        self.goodGame.getComponent(cc.Widget).left = 257;
                    }
                }
            });
        }
    },

    update(dt) {
        if (this.btnDunIsUse || this.btnFeibiaoIsUse || this.buff1Tip.getChildByName('time').active || this.buff2Tip.getChildByName('time').active || this.buff3Tip.getChildByName('time').active) {
            this._updateProgressBar(dt);
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

    //初始化技能状态
    initSkill() {
        this.btnDunIsUse = false;
        this.btnFeibiaoIsUse = false;
        this.btnDun.getChildByName('yuan').getComponent(cc.ProgressBar).progress = 0;
        this.btnFeibiao.getChildByName('yuan').getComponent(cc.ProgressBar).progress = 0;

        this.dartNumLabel.string = this.dartNum + '';
        this.shieldNumLabel.string = this.shieldNum + '';

        if (this.dartNum == 0) {
            this.btnFeibiao.getComponent(cc.Button).interactable = false;
        } else if (this.dartNum > 0) {
            this.btnFeibiao.getComponent(cc.Button).interactable = true;
        }
        if (this.shieldNum == 0) {
            this.btnDun.getComponent(cc.Button).interactable = false;
        } else if (this.shieldNum > 0) {
            this.btnDun.getComponent(cc.Button).interactable = true;
        }

        if (this.dartTime.active) {
            this.dartTime.active = false;
        }
        if (this.dartTimeBg.active) {
            this.dartTimeBg.active = false;
        }
        if (this.shieldTime.active) {
            this.shieldTime.active = false;
        }
        if (this.shieldTimeBg.active) {
            this.shieldTimeBg.active = false;
        }
    },

    //开始游戏
    startGame() {
        this.level = 1;
        this.killNum = 0;
        this.addLevel(this.level);
        this.addKill(this.killNum);

        //初始化游戏状态
        this.gameState = 'game';

        //当前允许复活次数
        this.reviveNum = parseInt(globaltbl.get(4).value);

        //游戏时间
        this.gameTime = 0;
        //记录时间戳
        this.gameStartTime = new Date().getTime();

        this.buff1 = this.sessionData.buff[0];
        this.buff2 = this.sessionData.buff[1];
        this.buff3 = this.sessionData.buff[2];
        this.buff4 = this.sessionData.buff[3];

        this.boxBuff1 = 0;
        this.boxBuff2 = 0;
        this.boxBuff3 = 0;

        //重新加载玩家状态
        this.stage.player.initAllPosAndSize(this.inviteBuff3 + this.buff4);

        this.flashBuffTip();

        this.buff1Tip.getChildByName('bar').getComponent(cc.ProgressBar).progress = 0;
        if (this.buff1Tip.getChildByName('time').active) {
            this.buff1Tip.getChildByName('time').active = false;
        }
        this.buff2Tip.getChildByName('bar').getComponent(cc.ProgressBar).progress = 0;
        if (this.buff2Tip.getChildByName('time').active) {
            this.buff2Tip.getChildByName('time').active = false;
        }
        this.buff2Tip.getChildByName('bar').getComponent(cc.ProgressBar).progress = 0;
        if (this.buff3Tip.getChildByName('time').active) {
            this.buff3Tip.getChildByName('time').active = false;
        }

        //玩家无敌时间
        this.playerGodTime = parseInt(globaltbl.get(18).value);

        this.playerIsGod = true;
        this.stage.player.node.active = true;

        //开始游戏特效
        let spine = cc.instantiate(this.spine);
        spine.group = 'UI';
        this.node.addChild(spine);
        spine.y = -this.stage.player.playerBody.height / 2 - 20;
        spine.getComponent('spineControll').startGame();

        //初始化技能状态
        this.initSkill();
    },

    //结束游戏
    overGame(killTip) {
        //四种buff加成情况
        //武器长度
        this.buff1 = 0;
        //移动速度
        this.buff2 = 0;
        //挥刀速度
        this.buff3 = 0;
        //初始等级
        this.buff4 = 0;

        this.gameState = 'over';

        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            if (!this.isAllowShare) {
                this.openOverWindow();
            } else {
                if (this.reviveNum > 0) {
                    this.openReviveWindow(killTip);
                } else {
                    this.openAwardWindow();
                }
            }

            //打开banner广告
            this.bannerAd.show();
        } else {
            if (this.reviveNum > 0) {
                this.openReviveWindow(killTip);
            } else {
                this.openAwardWindow();
            }
        }

        //保存游戏时长
        this.gameTime += new Date().getTime() - this.gameStartTime;

        //保存最高击杀数和最高分数
        if (this.stage.player.exp > this.mostScore) this.gc.setScorePlus(this.stage.player.exp, 'mostScore');
        if (this.killNum > this.mostKillNum) this.gc.setScorePlus(this.killNum, 'mostKillNum');
        if (this.stage.player.level > this.mostLevel) {
            this.gc.setBlobMap({
                mostLevel: this.stage.player.level
            });
        }
        if (this.gameTime > this.mostLiveTime) {
            this.gc.setBlobMap({
                mostLiveTime: this.gameTime
            });
        }

        this.gc.setBlobMap({
            lastKillNum: this.killNum,
            lastScore: this.stage.player.exp,
            lastLiveTime: this.gameTime
        });
    },

    //重新开始
    restartGame() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            if (!this.isAllowShare) {
                this.overWindow.getComponent('overWindow').closeOverWindow();

                this.stage.restart();

                this.startGame();
            } else {
                this.overWindow.getComponent('overWindow').closeOverWindow();
                this.openAdvanceWindow();
            }
        } else {
            this.overWindow.getComponent('overWindow').closeOverWindow();
            this.openAdvanceWindow();
        }

    },

    //复活
    reviveGame() {
        if (this.reviveCoinNum > 0) {
            this.reviveCoinNum--;
            this.gc.setBlobMap({
                reviveCoin: this.reviveCoinNum
            });
            this.gameState = 'game';
            this.reviveWindow.getComponent('reviveWindow').closeReviveWindow();
            this.reviveNum--;

            //玩家位置随机
            this.stage.player.randPos();
            this.stage.player.node.active = true;

            //玩家无敌
            this.stage.playerIsGod = true;
            //玩家无敌时间
            this.playerGodTime = parseInt(globaltbl.get(19).value);

            //保存复活前的游戏时长
            this.gameTime += new Date().getTime() - this.gameStartTime;
            //记录时间戳
            this.gameStartTime = new Date().getTime();

            //关闭banner广告
            this.bannerAd.hide();

            //隐藏抽屉广告
            this.goodGame.active = false;
        } else if (this.reviveCoinNum <= 0) {
            let self = this;
            if (cc.sys.localStorage.getItem('reviveAdChange')) {
                this.gc.playAdNew((res) => {
                    self.gameState = 'game';
                    self.reviveWindow.getComponent('reviveWindow').closeReviveWindow();
                    self.reviveNum--;

                    //玩家位置随机
                    self.stage.player.randPos();
                    self.stage.player.node.active = true;

                    //玩家无敌
                    self.stage.playerIsGod = true;
                    //玩家无敌时间
                    self.playerGodTime = parseInt(globaltbl.get(19).value);

                    //保存复活前的游戏时长
                    self.gameTime += new Date().getTime() - self.gameStartTime;
                    //记录时间戳
                    self.gameStartTime = new Date().getTime();

                    //关闭banner广告
                    self.bannerAd.hide();

                    //隐藏抽屉广告
                    self.goodGame.active = false;

                    cc.sys.localStorage.setItem('reviveAdChange', false);
                }, 108);
            } else {
                this.gc.publicSharingWithSvrcfg((res) => {
                    self.gameState = 'game';
                    self.reviveWindow.getComponent('reviveWindow').closeReviveWindow();
                    self.reviveNum--;

                    //玩家位置随机
                    self.stage.player.randPos();
                    self.stage.player.node.active = true;

                    //玩家无敌
                    self.stage.playerIsGod = true;
                    //玩家无敌时间
                    self.playerGodTime = parseInt(globaltbl.get(19).value);

                    //保存复活前的游戏时长
                    self.gameTime += new Date().getTime() - self.gameStartTime;
                    //记录时间戳
                    self.gameStartTime = new Date().getTime();

                    //关闭banner广告
                    self.bannerAd.hide();

                    //隐藏抽屉广告
                    self.goodGame.active = false;

                    cc.sys.localStorage.setItem('reviveAdChange', true);
                }, 108)
            }
        }
    },

    //刷新三种buff状态
    flashBuffTip() {
        if (this.buff1 + this.wheelBuff1 + this.boxBuff1 > 0) {
            if (!this.buff1Tip.getChildByName('buff_kuang').active) {
                this.buff1Tip.getChildByName('buff_kuang').active = true;
            }
        } else {
            if (this.buff1Tip.getChildByName('buff_kuang').active) {
                this.buff1Tip.getChildByName('buff_kuang').active = false;
            }
        }
        this.buff1Tip.getChildByName('buffNum').getComponent(cc.Label).string = parseInt((this.buff1 + this.wheelBuff1 + this.boxBuff1) * 100) + '%';

        if (this.buff2 + this.wheelBuff2 + this.boxBuff2 > 0) {
            if (!this.buff2Tip.getChildByName('buff_kuang').active) {
                this.buff2Tip.getChildByName('buff_kuang').active = true;
            }
        } else {
            if (this.buff2Tip.getChildByName('buff_kuang').active) {
                this.buff2Tip.getChildByName('buff_kuang').active = false;
            }
        }
        this.buff2Tip.getChildByName('buffNum').getComponent(cc.Label).string = parseInt((this.buff2 + this.wheelBuff2 + this.boxBuff2) * 100) + '%';

        if (this.buff3 + this.wheelBuff3 + this.boxBuff3 > 0) {
            if (!this.buff3Tip.getChildByName('buff_kuang').active) {
                this.buff3Tip.getChildByName('buff_kuang').active = true;
            }
        } else {
            if (this.buff3Tip.getChildByName('buff_kuang').active) {
                this.buff3Tip.getChildByName('buff_kuang').active = false;
            }
        }
        this.buff3Tip.getChildByName('buffNum').getComponent(cc.Label).string = parseInt((this.buff3 + this.wheelBuff3 + this.boxBuff3) * 100) + '%';

        this.stage.player.flashProperty();
    },

    addLevel(level) {
        this.level = level;
        this.levelLabel.string = this.level + '';
    },

    addKill(num) {
        this.killNum += num;
        this.killLabel.string = this.killNum + '';
    },

    onBtnSlash() {
        let self = this;
        this.btnSlash.on(cc.Node.EventType.TOUCH_START, function () {
            if (self.stage.player.canSlash) {
                self.btnSlash.getChildByName('attack_kuang').active = true;
                self.stage.playerSlash();
                //攻击音效
                self.audio.onAttackAudio();
            }
        });
        this.btnSlash.on(cc.Node.EventType.TOUCH_END, function () {
            self.btnSlash.getChildByName('attack_kuang').active = false;
        });
        this.btnSlash.on(cc.Node.EventType.TOUCH_CANCEL, function () {
            self.btnSlash.getChildByName('attack_kuang').active = false;
        });
    },

    onBtnSpeet() {
        let self = this;
        this.btnSpeet.on(cc.Node.EventType.TOUCH_START, function () {
            self.btnSpeet.getChildByName('quicken_kuang').active = true;
            self.stage.isPlayerQuick = true;

            //加速特效
            if (!self.stage.player.yanwu.active) {
                self.stage.player.yanwu.active = true;
            }
        });
        this.btnSpeet.on(cc.Node.EventType.TOUCH_END, function () {
            self.btnSpeet.getChildByName('quicken_kuang').active = false;
            self.stage.isPlayerQuick = false;

            //删除加速特效
            if (self.stage.player.yanwu.active) {
                self.stage.player.yanwu.active = false;
            }
        });
        this.btnSpeet.on(cc.Node.EventType.TOUCH_CANCEL, function () {
            self.btnSpeet.getChildByName('quicken_kuang').active = false;
            self.stage.isPlayerQuick = false;

            //删除加速特效
            if (self.stage.player.yanwu.active) {
                self.stage.player.yanwu.active = false;
            }
        });
    },

    //护盾按钮监听
    onBtnDartEvent() {
        let self = this;
        this.btnFeibiao.on(cc.Node.EventType.TOUCH_START, function () {
            if (self.btnFeibiao.getComponent(cc.Button).interactable) {
                self.btnFeibiao.getChildByName('quicken_kuang').active = true;
            }
        });
        this.btnFeibiao.on(cc.Node.EventType.TOUCH_END, function () {
            self.btnFeibiao.getChildByName('quicken_kuang').active = false;
        });
        this.btnFeibiao.on(cc.Node.EventType.TOUCH_CANCEL, function () {
            self.btnFeibiao.getChildByName('quicken_kuang').active = false;
        });
    },

    //护盾技能
    onBtnDun(event) {
        if (this.stage.player.node.active) {
            this.stage.player.dun.active = true;

            this.shieldTime.active = true;
            this.shieldTimeBg.active = true;

            this.btnDun.getComponent(cc.Button).interactable = false;
            this.btnDun.getChildByName('yuan').getComponent(cc.ProgressBar).progress = 1;
            this.btnDunIsUse = true;
            this.btnDunCount = 0;

            //刷新护盾个数
            this.shieldNum -= 1;
            this.gc.setBlobMap({
                shieldNum: this.shieldNum
            });
            this.shieldNumLabel.string = this.shieldNum + '';
        }
    },

    //护盾被破或者护盾到时间
    btnDunClear() {
        this.stage.player.dun.active = false;
    },

    //飞镖按钮监听
    onBtnShieldEvent() {
        let self = this;
        this.btnDun.on(cc.Node.EventType.TOUCH_START, function () {
            if (self.btnDun.getComponent(cc.Button).interactable) {
                self.btnDun.getChildByName('quicken_kuang').active = true;
            }
        });
        this.btnDun.on(cc.Node.EventType.TOUCH_END, function () {
            self.btnDun.getChildByName('quicken_kuang').active = false;
        });
        this.btnDun.on(cc.Node.EventType.TOUCH_CANCEL, function () {
            self.btnDun.getChildByName('quicken_kuang').active = false;
        });
    },

    //飞镖技能
    onBtnFeibiao() {
        if (this.stage.player.node.active) {
            this.dartTime.active = true;
            this.dartTimeBg.active = true;

            let nowX = this.stage.player.node.x;
            let nowY = this.stage.player.node.y;
            let direction = this.stage.player.player.angle;
            let scale = 0.6 + 0.025 * (this.stage.player.level - 1);
            let range = this.roleData.get(this.stage.player.level).dart_range;
            let speed = this.dartSpeed;

            this.stage.darts.addPlayerDart(nowX, nowY, direction, scale, range, speed);

            this.btnFeibiao.getComponent(cc.Button).interactable = false;
            this.btnFeibiao.getChildByName('yuan').getComponent(cc.ProgressBar).progress = 1;
            this.btnFeibiaoIsUse = true;
            this.btnFeibiaoCount = 0;

            //刷新飞镖个数
            this.dartNum -= 1;
            this.gc.setBlobMap({
                dartNum: this.dartNum
            });
            this.dartNumLabel.string = this.dartNum + '';
        }
    },

    //限时buff
    limitTimeBuff(type) {
        switch (type) {
            case 1:
                this.buff1Tip.getChildByName('bar').getComponent(cc.ProgressBar).progress = 1;
                this.buff1Tip.getChildByName('time').active = true;
                this.boxBuff1Count = 0;
                break;
            case 2:
                this.buff2Tip.getChildByName('bar').getComponent(cc.ProgressBar).progress = 1;
                this.buff2Tip.getChildByName('time').active = true;
                this.boxBuff2Count = 0;
                break;
            case 3:
                this.buff3Tip.getChildByName('bar').getComponent(cc.ProgressBar).progress = 1;
                this.buff3Tip.getChildByName('time').active = true;
                this.boxBuff3Count = 0;
                break;
        }
        this.flashBuffTip();
    },

    _updateProgressBar(dt) {
        if (this.btnDunIsUse) {
            this.btnDunCount += dt;
            if (parseInt(this.btnDunCount) === parseInt(globaltbl.get(21).value)) {
                this.btnDunClear();
            }
            if (parseInt(this.btnDunCount) === parseInt(globaltbl.get(22).value)) {
                if (this.shieldNum > 0) {
                    this.btnDun.getComponent(cc.Button).interactable = true;
                }
                this.btnDunIsUse = false;
                this.shieldTime.active = false;
                this.shieldTimeBg.active = false;
            }
            this.btnDun.getChildByName('yuan').getComponent(cc.ProgressBar).progress -= dt / parseInt(globaltbl.get(22).value);
            if (this.shieldTime.getComponent(cc.RichText).string != '<color=#ffff05><b>' + Math.ceil(parseInt(globaltbl.get(22).value) - this.btnDunCount) + '</b></c>') {
                this.shieldTime.getComponent(cc.RichText).string = '<color=#ffff05><b>' + Math.ceil(parseInt(globaltbl.get(22).value) - this.btnDunCount) + '</b></c>';
            }
        }

        if (this.btnFeibiaoIsUse) {
            this.btnFeibiaoCount += dt;
            if (parseInt(this.btnFeibiaoCount) === parseInt(globaltbl.get(23).value)) {
                if (this.dartNum > 0) {
                    this.btnFeibiao.getComponent(cc.Button).interactable = true;
                }
                this.btnFeibiaoIsUse = false;
                this.dartTime.active = false;
                this.dartTimeBg.active = false;
            }
            this.btnFeibiao.getChildByName('yuan').getComponent(cc.ProgressBar).progress -= dt / parseInt(globaltbl.get(23).value);
            if (this.dartTime.getComponent(cc.RichText).string != '<color=#ffff05><b>' + Math.ceil(parseInt(globaltbl.get(23).value) - this.btnFeibiaoCount) + '</b></c>') {
                this.dartTime.getComponent(cc.RichText).string = '<color=#ffff05><b>' + Math.ceil(parseInt(globaltbl.get(23).value) - this.btnFeibiaoCount) + '</b></c>';
            }
        }

        if (this.buff1Tip.getChildByName('time').active) {
            this.boxBuff1Count += dt;
            if (parseInt(this.boxBuff1Count) === this.treasure.get(5).duration) {
                this.buff1Tip.getChildByName('time').active = false;
                this.boxBuff1 = 0;
                this.flashBuffTip();
            }
            this.buff1Tip.getChildByName('bar').getComponent(cc.ProgressBar).progress -= dt / this.treasure.get(5).duration;
            if (this.buff1Tip.getChildByName('time').getComponent(cc.Label).string != Math.ceil(this.treasure.get(5).duration - this.boxBuff1Count)) {
                this.buff1Tip.getChildByName('time').getComponent(cc.Label).string = Math.ceil(this.treasure.get(5).duration - this.boxBuff1Count);
            }
        }

        if (this.buff2Tip.getChildByName('time').active) {
            this.boxBuff2Count += dt;
            if (parseInt(this.boxBuff2Count) === this.treasure.get(6).duration) {
                this.buff2Tip.getChildByName('time').active = false;
                this.boxBuff2 = 0;
                this.flashBuffTip();
            }
            this.buff2Tip.getChildByName('bar').getComponent(cc.ProgressBar).progress -= dt / this.treasure.get(6).duration;
            if (this.buff2Tip.getChildByName('time').getComponent(cc.Label).string != Math.ceil(this.treasure.get(6).duration - this.boxBuff2Count)) {
                this.buff2Tip.getChildByName('time').getComponent(cc.Label).string = Math.ceil(this.treasure.get(6).duration - this.boxBuff2Count);
            }
        }

        if (this.buff3Tip.getChildByName('time').active) {
            this.boxBuff3Count += dt;
            if (parseInt(this.boxBuff3Count) === this.treasure.get(7).duration) {
                this.buff3Tip.getChildByName('time').active = false;
                this.boxBuff3 = 0;
                this.flashBuffTip();
            }
            this.buff3Tip.getChildByName('bar').getComponent(cc.ProgressBar).progress -= dt / this.treasure.get(7).duration;
            if (this.buff3Tip.getChildByName('time').getComponent(cc.Label).string != Math.ceil(this.treasure.get(7).duration - this.boxBuff3Count)) {
                this.buff3Tip.getChildByName('time').getComponent(cc.Label).string = Math.ceil(this.treasure.get(7).duration - this.boxBuff3Count);
            }
        }
    },

    //打开强化界面
    openAdvanceWindow() {
        this.advanceWindow = cc.instantiate(this.advanceWindowPrefab);
        this.window.addChild(this.advanceWindow);
        this.advanceWindow.getComponent('advanceWindow').init(this);
        this.advanceWindow.getComponent('advanceWindow').openAdvanceWindow();

        //关闭banner广告
        //this.bannerAd.hide();
    },

    //打开游戏复活界面
    openReviveWindow(killTip) {
        this.reviveWindow = cc.instantiate(this.reviveWindowPrefab);
        this.window.addChild(this.reviveWindow);
        this.reviveWindow.getComponent('reviveWindow').openReviveWindow(killTip, this);
    },

    //打开击败奖励界面
    openAwardWindow() {
        this.awardWindow = cc.instantiate(this.awardWindowPrefab);
        this.window.addChild(this.awardWindow);
        this.awardWindow.getComponent('awardWindow').openAwardWindow(this.gc, this);
    },

    //打开游戏结算界面
    openOverWindow() {
        this.overWindow = cc.instantiate(this.overWindowPrefab);
        this.window.addChild(this.overWindow);
        this.overWindow.getComponent('overWindow').openOverWindow(this.stage, this)
    },

    //打开排行榜窗口
    openRankWindow() {
        let rankWindow = cc.instantiate(this.rankWindowPrefab);
        this.window.addChild(rankWindow);
        rankWindow.group = 'UI';
        rankWindow.getComponent('rankWindow').init(this);
        rankWindow.getComponent('rankWindow').onBtnFriendRank();
        //关闭banner广告
        //this.bannerAd.hide();

        if (this.overWindow) {
            this.overWindow.getComponent('overWindow').closeOverWindow();
        }
    },

    //打开宝箱界面
    openBoxWindow() {
        this.boxWindow = cc.instantiate(this.boxWindowPrefab);
        this.window.addChild(this.boxWindow);
        this.boxWindow.getComponent('congraWindow2').init(this);
    }
});
