import Player from '../basicJS/Player';
import Joystick from '../basicJS/Joystick';
import Food from '../basicJS/Food';
import Enemy from '../basicJS/Enemy';
import ExpEnemy from '../basicJS/ExpEnemy';
import Darts from '../basicJS/Darts';
//角色信息数据
import roleData from '../data/roletbl';

//首页
import menu from '../sceneJS/Menu';

cc.Class({
    extends: cc.Component,

    properties: {
        //背景图
        bg: {
            default: null,
            type: cc.Sprite,
            displayName: '背景图'
        },
        //玩家节点
        player: {
            default: null,
            type: Player,
            displayName: '当前玩家节点'
        },
        //虚拟摇杆节点
        joystick: {
            default: null,
            type: Joystick,
            displayName: '虚拟摇杆节点'
        },
        //食物节点
        food: {
            default: null,
            type: Food,
            displayName: '食物节点'
        },
        //敌人节点
        enemy: {
            default: null,
            type: Enemy,
            displayName: 'AI节点'
        },
        //经验怪节点
        expEnemy: {
            default: null,
            type: ExpEnemy,
            displayName: '经验怪节点'
        },
        //飞镖节点
        darts: {
            default: null,
            type: Darts,
            displayName: '飞镖节点'
        },
        //排行节点数组
        rank: {
            default: null,
            type: cc.Node,
            displayName: '当前排行榜'
        },

        //击杀提示
        killTip: {
            default: null,
            type: cc.Node,
            displayName: '击杀提示'
        },

        //连杀提示
        killMultiTip: {
            default: null,
            type: cc.Node,
            displayName: '连杀提示'
        },

        //进化提示
        handbookTip: {
            default: null,
            type: cc.Node,
            displayName: '进化提示'
        },

        //特效
        spine: cc.Prefab,

        //角色图片
        roleAllSp: cc.SpriteAtlas,

        //武器图片
        weaponAllSp: cc.SpriteAtlas,

        //宝箱
        box: cc.Node,

        //宝箱图片
        boxSp: [cc.SpriteFrame],

        //宝箱出现提示
        boxTip: cc.Node
    },

    onLoad() {

    },

    start() {

    },

    update(dt) {
        for (let value of this.enemy.enemyList) {
            if (value.state !== 'attack') {
                let leftX = -this.game.gameBg.width / 2 + value.getChildByName('enemy').getChildByName('enemyBody').width / 2;
                let rightX = this.game.gameBg.width / 2 - value.getChildByName('enemy').getChildByName('enemyBody').width / 2;
                let topY = -this.game.gameBg.height / 2 + value.getChildByName('enemy').getChildByName('enemyBody').width / 2;
                let bottomY = this.game.gameBg.height / 2 - value.getChildByName('enemy').getChildByName('enemyBody').width / 2
                if (value.x < leftX) {
                    value.x = leftX;
                }
                if (value.x > rightX) {
                    value.x = rightX;
                }
                if (value.y < topY) {
                    value.y = topY;
                }
                if (value.y > bottomY) {
                    value.y = bottomY;
                }
                if (value.getChildByName('dunMax').active && this.box.active) {

                } else {
                    if (value.isQuick) {
                        let moveX = Math.cos((value.getChildByName('enemy').angle + 90) * Math.PI / 180) * value.speed * this.game.speedRate;
                        let moveY = Math.sin((value.getChildByName('enemy').angle + 90) * Math.PI / 180) * value.speed * this.game.speedRate;
                        value.x += moveX;
                        value.y += moveY;
                    } else {
                        let moveX = Math.cos((value.getChildByName('enemy').angle + 90) * Math.PI / 180) * value.speed;
                        let moveY = Math.sin((value.getChildByName('enemy').angle + 90) * Math.PI / 180) * value.speed;
                        value.x += moveX;
                        value.y += moveY;
                    }
                }
            }
        }
    },

    //初始化
    init(game) {
        this.menu = menu;
        this.game = game;
        //角色信息表
        this.roleData = roleData;
        //角色图集
        this.roleAllSpArr = this.roleAllSp.getSpriteFrames();
        //武器图集
        this.weaponAllSpArr = this.weaponAllSp.getSpriteFrames();

        //能够移动
        this.moveAllow = true;
        //移动速度
        this.moveSpeed = 2;
        //是否加速
        this.isPlayerQuick = false;
        //是否无敌
        this.playerIsGod = true;

        this.boxTip.active = false;
        this.unschedule(this.showBoxTip);

        //添加宝箱
        this.boxSchedule();

        this.player.playerInit(this);
        this.joystick.joystickInit(this);
        this.food.foodInit(this);
        this.enemy.enemyInit(this);
        this.expEnemy.expEnemyInit(this);

        this.unschedule(this.gameFlash);
        this.schedule(this.gameFlash, 0.05);


        this.updateRankings();
    },

    //宝箱计时器
    boxSchedule() {
        this.box.active = false;
        this.unschedule(this.showBox);
        this.scheduleOnce(this.showBox, 40);
        this.box.getComponent(cc.Sprite).spriteFrame = this.boxSp[0];
    },

    //显示宝箱
    showBox() {
        if (this.game.isAllowShare) {
            if (!this.box.active) {
                this.box.position = cc.v2(Math.random() * (this.bg.node.width - this.box.width - 50) - (this.bg.node.width / 2 - this.box.width / 2 - 25), Math.random() * (this.bg.node.height - this.box.height - 100) - (this.bg.node.height / 2 - this.box.height / 2 - 50));
                this.box.active = true;
                this.boxTip.active = true;
                this.unschedule(this.showBoxTip);
                this.scheduleOnce(this.showBoxTip, 3);
            }
        }
    },

    //显示宝箱提示
    showBoxTip() {
        this.boxTip.active = false;
    },

    //游戏内容刷新
    gameFlash() {
        if (this.game.gameState === 'game') {
            if (this.playerIsGod) {
                if (new Date().getTime() - this.game.gameStartTime >= this.game.playerGodTime * 1000) {
                    //玩家无敌时间结束
                    this.playerIsGod = false;
                }
            }

            if (this.player.isCheckKill && this.player.node.active) {
                this.checkKill();
            }
            if (this.player.canSlash) {
                if (this.player.expAddTotal > 0) {
                    this.player.addExp();
                }
            }
        }

        if (this.expEnemy.expEnemyList > 0) {
            for (let value of this.expEnemy.expEnemyList) {
                value.liveTime++;
                this.expEnemy.walk(value);
                if (value.liveTime > 2 * 20) {
                    value.liveTime = 0;
                    this.expEnemy.randDir(value);
                }
            }
        }

        for (let value of this.enemy.enemyList) {
            if (value.getChildByName('dunMax').active && this.box.active) {

            } else {
                //攻击范围检测
                if (this.enemy.attackRangeCheck(value) && value.state === 'await') {
                    //返回最近的敌人
                    let player = this.enemy.getNearPlayer(value);
                    //获得基础逃跑概率
                    let escapeNum = parseFloat(this.roleData.get(value.level).escape_pro);
                    //增加等级差概率
                    if (player.level === undefined) {
                        escapeNum -= (value.level - player.getComponent(Player).level) * parseFloat(this.roleData.get(value.level).escape_pro_adjust);
                    } else {
                        escapeNum -= (value.level - player.level) * parseFloat(this.roleData.get(value.level).escape_pro_adjust);
                    }

                    //计算逃跑概率
                    if (Math.random() <= escapeNum) {//逃跑
                        value.state = 'escape';
                    } else {//攻击
                        value.state = 'attack';
                    }
                    this.enemy.enemyState(value);
                } else if (!this.enemy.attackRangeCheck(value) && value.state === 'await') {
                    //飞镖攻击范围检测
                    if (value.isCanDart && this.enemy.dartRangeCheck(value)) {
                        if (Math.random() < parseFloat(this.roleData.get(value.level).dart_pro)) {//parseFloat(this.roleData.get(value.level).dart_pro
                            //发射飞镖
                            value.state = 'dartAttack';
                        } else {
                            //警戒范围检测
                            if (this.enemy.warnRangeCheck(value)) {
                                //计算追击概率
                                if (Math.random() < parseFloat(this.roleData.get(value.level).pursue_pro)) {//追击
                                    value.state = 'chase';
                                } else {//捡球
                                    value.state = 'eat';
                                }
                            } else if (!this.enemy.warnRangeCheck(value)) {
                                //捡经验球
                                value.state = 'eat';
                            }
                        }
                    } else {
                        //警戒范围检测
                        if (this.enemy.warnRangeCheck(value)) {
                            //计算追击概率
                            if (Math.random() < parseFloat(this.roleData.get(value.level).pursue_pro)) {//追击
                                value.state = 'chase';
                            } else {//捡球
                                value.state = 'eat';
                            }
                        } else if (!this.enemy.warnRangeCheck(value)) {
                            //捡经验球
                            value.state = 'eat';
                        }

                    }

                    this.enemy.enemyState(value);
                }

                if (value.state === 'chase') {
                    if (value.chaseTarget.active) {
                        let pos1 = value.chaseTarget.parent.convertToWorldSpaceAR(value.chaseTarget.getPosition());
                        let pos2 = value.parent.convertToWorldSpaceAR(value.getPosition());
                        if (pos1.sub(pos2).mag() < parseInt(this.roleData.get(value.level).max_check_range)) {
                            let angle = Math.atan2(pos1.y - pos2.y, pos1.x - pos2.x) * (180 / Math.PI);
                            value.getChildByName('enemy').angle = angle - 90;

                            let pos3 = this.enemy.getNearPlayer(value).parent.convertToWorldSpaceAR(this.enemy.getNearPlayer(value).getPosition());
                            if (pos2.sub(pos3).mag() < parseInt(this.roleData.get(value.level).min_check_range)) {
                                value.state = 'attack';
                                this.enemy.enemyState(value);
                            }
                        } else {
                            value.isQuick = false;
                            value.state = 'await';
                            this.enemy.enemyState(value);

                            //攻击状态持续时间
                            value.attackTime = 0;
                            //捡球状态持续时间
                            value.eatTime = 0;
                            //逃跑状态持续时间
                            value.escapeTime = 0;
                            //追击状态持续时间
                            value.chaseTime = 0;
                            //飞镖攻击状态持续时间
                            value.dartTime = 0;
                        }
                    } else {
                        value.isQuick = false;
                        value.state = 'await';
                        this.enemy.enemyState(value);

                        //攻击状态持续时间
                        value.attackTime = 0;
                        //捡球状态持续时间
                        value.eatTime = 0;
                        //逃跑状态持续时间
                        value.escapeTime = 0;
                        //追击状态持续时间
                        value.chaseTime = 0;
                        //飞镖攻击状态持续时间
                        value.dartTime = 0;
                    }

                }

                if (value.state === 'eat') {
                    if (this.enemy.attackRangeCheck(value)) {
                        //返回最近的敌人
                        let player = this.enemy.getNearPlayer(value);
                        let pos1 = value.parent.convertToWorldSpaceAR(value.getPosition());
                        let pos2 = player.parent.convertToWorldSpaceAR(player.getPosition());
                        if (pos1.sub(pos2).mag() < parseInt(this.roleData.get(value.level).min_check_range)) {
                            //获得基础逃跑概率
                            let escapeNum = parseFloat(this.roleData.get(value.level).escape_pro);
                            //增加等级差概率
                            if (player.level === undefined) {
                                escapeNum -= (value.level - player.getComponent(Player).level) * parseFloat(this.roleData.get(value.level).escape_pro_adjust);
                            } else {
                                escapeNum -= (value.level - player.level) * parseFloat(this.roleData.get(value.level).escape_pro_adjust);
                            }
                            //计算逃跑概率
                            if (Math.random() <= escapeNum) {//逃跑
                                value.state = 'escape';
                            } else {//攻击
                                value.state = 'attack';
                            }
                            this.enemy.enemyState(value);
                        }
                    }
                }

                if (value.getChildByName('dun').active) {
                    value.dartShowTime++;
                    if (value.dartShowTime > this.game.dartShowTime * 20) {
                        value.getChildByName('dun').active = false;
                        value.dartShowTime = 0;
                    }
                }
            }

            switch (value.state) {
                case 'attack':
                    value.attackTime++;
                    //攻击反应时间
                    let attack_time1 = parseFloat(this.roleData.get(value.level).attack_time);
                    //攻击速度
                    let attack_speed1 = parseFloat(this.roleData.get(value.level).attack_speed);
                    if (value.attackTime > (attack_time1 + attack_speed1) * 2 * 20) {
                        value.state = 'await';
                        value.isQuick = false;
                        this.enemy.enemyState(value);
                    }
                    break;
                case 'eat':
                    value.eatTime++;
                    if (value.eatTime > this.game.AIeatTime * 20) {
                        value.state = 'await';
                        value.isQuick = false;
                        this.enemy.enemyState(value);
                    }
                    break;
                case 'escape':
                    value.escapeTime++;
                    if (value.escapeTime > this.game.AIescapeTime * 20) {
                        value.state = 'await';
                        value.isQuick = false;
                        this.enemy.enemyState(value);
                    }
                    break;
                case 'chase':
                    value.chaseTime++;
                    if (value.chaseTime > this.game.AIchaseTime * 20) {
                        value.state = 'await';
                        value.isQuick = false;
                        this.enemy.enemyState(value);
                    }
                    break;
                case 'dartAttack':
                    value.dartTime++;
                    if (value.dartTime > parseFloat(this.roleData.get(value.level).turn_time) * 20) {
                        value.state = 'await';
                        value.isQuick = false;
                        this.enemy.enemyState(value);
                    }
                    break;
            }

            if (value.canSlash) {
                if (value.expAddTotal > 0) {
                    this.enemy.addExp(value);
                }
            }
            if (value.state === 'attack') {
                if (value.isCheckKill) {
                    this.enemyCheckKill(value);
                }
            } else if (value.state !== 'attack') {
                if (value.speed > 0) {
                    //检测食物碰撞
                    this.enemyEatFoodCheck(value);
                }
            }

            this.playerDartCheck(value);
            this.enemyDartCheck(value);
        }
    },

    //重新开始
    restart() {
        //能够移动
        this.moveAllow = true;
        //移动速度
        this.moveSpeed = 2;
        //是否加速
        this.isPlayerQuick = false;
        //是否无敌
        this.playerIsGod = true;

        this.boxTip.active = false;
        this.unschedule(this.showBoxTip);

        this.player.playerRestart();
        this.enemy.enemyRestart();

        //宝箱初始化
        this.box.active = false;
        this.unschedule(this.showBox);
        this.scheduleOnce(this.showBox, 40);
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

    //改变当前玩家的x位置
    changePlayerPosX(num) {
        if (this.moveAllow) {
            this.player.setPosX(num);
        }
    },

    //改变当前玩家的y位置
    changePlayerPosY(num) {
        if (this.moveAllow) {
            this.player.setPosY(num);
        }
    },

    //改变当前玩家朝向
    changePlayerDirection(angle) {
        if (this.moveAllow) {
            this.player.setDirection(angle);
        }
    },

    //玩家挥砍动作
    playerSlash() {
        if (this.player.canSlash) {
            this.moveAllow = false;
            this.player.slashAction();
        }
    },

    //玩家挥砍碰撞
    checkKill() {
        let rectSize = this.player.sword.getContentSize();
        let rectPos = this.player.sword.parent.convertToWorldSpaceAR(this.player.sword.getPosition());
        let angle = this.player.player.angle + this.player.sword.angle;

        for (let value of this.enemy.enemyList) {
            if (this.player.node.getPosition().sub(value.getPosition()).mag() < parseInt(this.roleData.get(this.player.level).min_check_range) + 50) {
                let body = value.getChildByName('enemy').getChildByName('enemyBody');

                let circleSize = body.getContentSize();
                let circlePos = body.parent.convertToWorldSpaceAR(body.getPosition());
                let json = this.getNewRx_Ry(rectPos, circlePos, angle);
                if (this.ComputeCollision(rectSize.width, rectSize.height, circleSize.width / 2, json.newRx, json.newRy)) {
                    if (!value.getChildByName('dun').active) {
                        if (!value.getChildByName('dunMax').active) {
                            //击杀提示
                            this.killTipShow('你击败了玩家 ' + value.nick);

                            //敌人死亡
                            this.enemy.enemyDead(value);
                            //清除加速特效
                            if (value.getChildByName('enemy').getChildByName('speet').active) {
                                value.getChildByName('enemy').getChildByName('speet').active = false;
                            }

                            //击败数增加
                            this.game.addKill(1);

                            //增加累计经验
                            let addScore = parseInt(this.roleData.get(value.level).be_killed_exp);
                            this.player.expAddTotal += addScore;

                            //连杀提示
                            this.killMultiTipShow();

                            //振动效果
                            if (cc.sys.platform == cc.sys.WECHAT_GAME) {
                                wx.vibrateShort();
                            }

                            //击杀特效
                            let spine = cc.instantiate(this.spine);
                            this.node.addChild(spine);
                            spine.setPosition(this.node.convertToNodeSpaceAR(circlePos));
                            spine.getComponent('spineControll').die();

                            //击杀音效
                            this.game.audio.onDeathAudio();
                        }
                    } else {
                        this.scheduleOnce(() => {
                            value.getChildByName('dun').active = false;
                            value.dartShowTime = 0;
                        }, this.roleData.get(value.level).attack_speed);
                    }
                }
            }
        }
        // if (this.expEnemy.expEnemyList > 0) {
        //     for (let value of this.expEnemy.expEnemyList) {
        //         if (this.player.node.getPosition().sub(value.getPosition()).mag() < parseInt(this.roleData.get(this.player.level).min_check_range) + 50) {
        //             let circleSize = value.getContentSize();
        //             let circlePos = value.parent.convertToWorldSpaceAR(value.getPosition());
        //             let json = this.getNewRx_Ry(rectPos, circlePos, angle);
        //             if (this.ComputeCollision(rectSize.width, rectSize.height, circleSize.width / 2, json.newRx, json.newRy)) {
        //                 //经验怪死亡
        //                 this.expEnemy.expEnemyDead(value);
        //                 //补充经验怪
        //                 if (this.food.getFoodNum() <= 150) {
        //                     let self = this;
        //                     this.scheduleOnce(function () {
        //                         self.expEnemy.addExpEnemy();
        //                     }, 2);
        //                 }

        //                 //击杀提示
        //                 this.killTipShow('你击败了 史莱姆王');

        //                 //增加经验球
        //                 for (let i = 0; i < 6; i++) {
        //                     if (i < 5) {
        //                         this.food.addFood(true, value.getPosition(), 20);
        //                     } else {
        //                         this.food.addFood(true, value.getPosition(), 15);
        //                     }
        //                 }

        //                 //振动效果
        //                 if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        //                     wx.vibrateShort();
        //                 }

        //                 //击杀特效
        //                 let spine = cc.instantiate(this.spine);
        //                 this.node.addChild(spine);
        //                 spine.setPosition(value.x, value.y);
        //                 spine.getComponent('spineControll').die();

        //                 //击杀音效
        //                 this.game.audio.onDeathAudio();
        //             }
        //         }
        //     }
        // }
    },

    //连杀提示
    killMultiTipShow() {
        //记录击杀时间
        let nowTime = Date.now();
        if (this.player.killTime === 0) {
            this.player.killTime = nowTime;
            this.player.killMulti++;
        } else {
            if (nowTime - this.player.killTime < this.game.killMultiTime * 1000) {
                this.player.killMulti++;
            } else {
                this.player.killMulti = 0;
            }
            this.player.killTime = nowTime;
        }

        if (this.player.killMulti >= 2) {
            this.killMultiTip.getChildByName('num').getComponent(cc.Label).string = this.player.killMulti + '';
            if (!this.killMultiTip.active) {
                this.killMultiTip.active = true;
            }

            this.unschedule(this.killMultiTipShowTimer);
            this.schedule(this.killMultiTipShowTimer, 3);
        }
    },

    //连杀提示计时器
    killMultiTipShowTimer() {
        this.killMultiTip.active = false;
        this.unschedule(this.killMultiTipShowTimer);
    },

    //击杀提示
    killTipShow(str) {
        this.killTip.getComponent(cc.Label).string = str;
        if (!this.killTip.active) {
            this.killTip.active = true;
        }

        this.unschedule(this.killTipShowTimer);
        this.schedule(this.killTipShowTimer, 3);
    },

    //击杀提示计时器
    killTipShowTimer() {
        this.killTip.active = false;
        this.unschedule(this.killTipShowTimer);
    },

    //AI挥砍碰撞
    enemyCheckKill(enemy) {
        let sword = enemy.getChildByName('enemy').getChildByName('enemySword');
        let rectSize = sword.getContentSize();
        let rectPos = sword.parent.convertToWorldSpaceAR(sword.getPosition());

        let circleSize = this.player.playerBody.getContentSize();
        let circlePos = this.player.playerBody.parent.convertToWorldSpaceAR(this.player.playerBody.getPosition());
        let angle = enemy.getChildByName('enemy').angle + sword.angle;
        let json = this.getNewRx_Ry(rectPos, circlePos, angle);

        if (!this.playerIsGod && this.player.node.active && this.ComputeCollision(rectSize.width, rectSize.height, circleSize.width / 2, json.newRx, json.newRy)) {
            if (!this.player.dun.active) {
                //if (!this.player.dunMax.active) {
                // this.player.node.active = false;
                // this.joystick._touchEndEvent();
                // this.joystick.node.getChildByName('ring').getComponent('JoystickBg')._touchEndEvent();
                // this.player.stopSlashAction();

                // //击杀音效
                // this.game.audio.onDeathAudio();

                // //击杀特效
                // let spine = cc.instantiate(this.spine);
                // this.node.addChild(spine);
                // spine.setPosition(this.node.convertToNodeSpaceAR(circlePos));
                // spine.getComponent('spineControll').die();

                // this.scheduleOnce(() => {
                //     this.game.overGame(enemy.nick);
                // }, 1);
                //}
            } else {
                this.scheduleOnce(() => {
                    this.game.btnDunClear();
                }, this.roleData.get(enemy.level).attack_speed);
            }

        }

        for (let value of this.enemy.enemyList) {
            if (enemy !== value) {
                if (enemy.getPosition().sub(value.getPosition()).mag() < parseInt(this.roleData.get(enemy.level).min_check_range) + 50) {
                    let body = value.getChildByName('enemy').getChildByName('enemyBody');

                    circleSize = body.getContentSize();
                    circlePos = body.parent.convertToWorldSpaceAR(body.getPosition());
                    angle = enemy.getChildByName('enemy').angle + sword.angle;
                    json = this.getNewRx_Ry(rectPos, circlePos, angle);
                    if (this.ComputeCollision(rectSize.width, rectSize.height, circleSize.width / 2, json.newRx, json.newRy)) {
                        if (!value.getChildByName('dun').active) {
                            if (!value.getChildByName('dunMax').active) {
                                //敌人死亡
                                this.enemy.enemyDead(value);
                                //清除加速特效
                                if (value.getChildByName('enemy').getChildByName('speet').active) {
                                    value.getChildByName('enemy').getChildByName('speet').active = false;
                                }

                                //增加经验
                                let addScore = parseInt(this.roleData.get(value.level).be_killed_exp);
                                enemy.expAddTotal += addScore;

                                //击杀特效
                                let spine = cc.instantiate(this.spine);
                                this.node.addChild(spine);
                                spine.setPosition(this.node.convertToNodeSpaceAR(circlePos));
                                spine.getComponent('spineControll').die();
                            }
                        } else {
                            this.scheduleOnce(() => {
                                value.getChildByName('dun').active = false;
                                value.dartShowTime = 0;
                            }, this.roleData.get(enemy.level).attack_speed);
                        }
                    }
                }
            }
        }

        // if (this.expEnemy.expEnemyList > 0) {
        //     for (let value of this.expEnemy.expEnemyList) {
        //         if (enemy.getPosition().sub(value.getPosition()).mag() < parseInt(this.roleData.get(enemy.level).min_check_range) + 50) {
        //             circleSize = value.getContentSize();
        //             circlePos = value.parent.convertToWorldSpaceAR(value.getPosition());
        //             angle = enemy.getChildByName('enemy').angle + sword.angle;
        //             json = this.getNewRx_Ry(rectPos, circlePos, angle);
        //             if (this.ComputeCollision(rectSize.width, rectSize.height, circleSize.width / 2, json.newRx, json.newRy)) {
        //                 //经验怪死亡
        //                 this.expEnemy.expEnemyDead(value);
        //                 //补充经验怪
        //                 if (this.food.getFoodNum() <= 150) {
        //                     let self = this;
        //                     this.scheduleOnce(function () {
        //                         self.expEnemy.addExpEnemy();
        //                     }, 2);
        //                 }

        //                 //增加经验球
        //                 for (let i = 0; i < 6; i++) {
        //                     if (i < 5) {
        //                         this.food.addFood(true, value.getPosition(), 20);
        //                     } else {
        //                         this.food.addFood(true, value.getPosition(), 15);
        //                     }
        //                 }

        //                 //击杀特效
        //                 let spine = cc.instantiate(this.spine);
        //                 this.node.addChild(spine);
        //                 spine.setPosition(value.x, value.y);
        //                 spine.getComponent('spineControll').die();
        //             }
        //         }
        //     }
        // }
    },

    //玩家食物碰撞
    playerEatFoodCheck() {
        let arr = this.food.quad.retrieve({
            x: this.player.node.x - this.player.playerBody.getContentSize().width / 2,
            y: this.player.node.y - this.player.playerBody.getContentSize().height / 2,
            width: this.player.playerBody.getContentSize().width,
            height: this.player.playerBody.getContentSize().height
        });
        let playerRadius = this.player.playerBody.width / 2;
        let playerPos = this.player.node.convertToWorldSpaceAR(this.player.playerBody.getPosition());
        for (let j = 0; j < arr.length; j++) {
            //使用圆形碰撞
            let arrIndex = arr[j].x + '_' + arr[j].y;
            let foodRadius = this.food.foodList[arrIndex].width / 2;
            let foodPos = this.node.convertToWorldSpaceAR(this.food.foodList[arrIndex].getPosition())
            if (playerPos.sub(foodPos).mag() < (playerRadius + foodRadius)) {
                //食物吃掉
                this.food.foodEated(this.food.foodList[arrIndex]);
                //补充食物
                // if (this.food.getFoodNum() <= this.game.foodMax) {
                //     this.food.addFood(true);
                // }

                //加分
                let addScore = 0;
                switch (foodRadius * 2) {
                    case 10:
                        addScore = parseInt(this.game.exp_ball.get(1).exp);
                        break;
                    case 15:
                        addScore = parseInt(this.game.exp_ball.get(2).exp);
                        break;
                    case 20:
                        addScore = parseInt(this.game.exp_ball.get(3).exp);
                        break;
                }
                this.player.expAddTotal += addScore;
            }
        }

        //宝箱碰撞
        if (this.box.active && this.box.getComponent(cc.Sprite).spriteFrame == this.boxSp[0]) {
            let boxRadius = this.box.width / 2;
            let boxPos = this.box.parent.convertToWorldSpaceAR(this.box.getPosition());
            if (playerPos.sub(boxPos).mag() < (playerRadius + boxRadius)) {
                this.box.getComponent(cc.Sprite).spriteFrame = this.boxSp[1];
                this.game.openBoxWindow();

                this.player.dunMax.active = true;
                this.joystick._touchEndEvent();
                this.joystick.node.getChildByName('ring').getComponent('JoystickBg')._touchEndEvent();

                this.killTipShow('你获得祝福：无敌护盾');
            }
        }
    },

    //AI食物碰撞
    enemyEatFoodCheck(enemy) {
        let arr = this.food.quad.retrieve({
            x: enemy.x - enemy.getChildByName('enemy').getChildByName('enemyBody').getContentSize().width / 2,
            y: enemy.y - enemy.getChildByName('enemy').getChildByName('enemyBody').getContentSize().height / 2,
            width: enemy.getChildByName('enemy').getChildByName('enemyBody').getContentSize().width,
            height: enemy.getChildByName('enemy').getChildByName('enemyBody').getContentSize().height
        });
        let enemyRadius = enemy.getChildByName('enemy').getChildByName('enemyBody').width / 2;
        let enemyPos = enemy.convertToWorldSpaceAR(enemy.getChildByName('enemy').getChildByName('enemyBody').getPosition());
        for (let j = 0; j < arr.length; j++) {
            //圆形碰撞
            let arrIndex = arr[j].x + '_' + arr[j].y;
            let foodRadius = this.food.foodList[arrIndex].width / 2;
            let foodPos = this.node.convertToWorldSpaceAR(this.food.foodList[arrIndex].getPosition());
            if (enemyPos.sub(foodPos).mag() < (enemyRadius + foodRadius)) {
                //食物吃掉
                this.food.foodEated(this.food.foodList[arrIndex]);
                //补充食物
                // if (this.food.getFoodNum() <= this.game.foodMax) {
                //     this.food.addFood(true);
                // }

                //加分
                let addScore = 0;
                switch (foodRadius * 2) {
                    case 10:
                        addScore = parseInt(this.game.exp_ball.get(1).exp);
                        break;
                    case 15:
                        addScore = parseInt(this.game.exp_ball.get(2).exp);
                        break;
                    case 20:
                        addScore = parseInt(this.game.exp_ball.get(3).exp);
                        break;
                }
                enemy.expAddTotal += addScore;
            }
        }

        //AI宝箱碰撞
        if (this.box.active && this.box.getComponent(cc.Sprite).spriteFrame == this.boxSp[0]) {
            let boxRadius = this.box.width / 2;
            let boxPos = this.box.parent.convertToWorldSpaceAR(this.box.getPosition());
            if (enemyPos.sub(boxPos).mag() < (enemyRadius + boxRadius)) {
                this.box.getComponent(cc.Sprite).spriteFrame = this.boxSp[1];

                enemy.getChildByName('dunMax').active = true;

                enemy.getChildByName('dun').active = false;

                let time = Math.floor(Math.random() * 3) + 4
                this.scheduleOnce(() => {
                    this.game.boxIsOpen = false;
                    this.boxSchedule();

                    //AI增加经验
                    enemy.expAddTotal += this.game.boxOtherGift;
                }, time);
                this.scheduleOnce(() => {
                    enemy.getChildByName('dunMax').active = false;
                }, time + 2);
            }
        }
    },



    //玩家飞镖碰撞
    playerDartCheck(enemy) {
        if (!this.darts.playerDart || enemy.getChildByName('dunMax').active) return;
        if (!enemy.getChildByName('dun').active) {
            let body = enemy.getChildByName('enemy').getChildByName('enemyBody');
            let enemyPos = enemy.convertToWorldSpaceAR(body.getPosition());
            let enemySize = body.getContentSize();

            let dartPos = this.darts.playerDart.parent.convertToWorldSpaceAR(this.darts.playerDart.getPosition());
            let dartSize = this.darts.playerDart.getContentSize();
            if (enemyPos.sub(dartPos).mag() < enemySize.width / 2 + dartSize.height / 2) {
                //移除飞镖
                //this.darts.removePlayerDart(this.darts.playerDart);

                //击杀特效
                let spine = cc.instantiate(this.spine);
                this.node.addChild(spine);
                spine.setPosition(this.node.convertToNodeSpaceAR(enemyPos));
                spine.getComponent('spineControll').die();

                //击杀提示
                this.killTipShow('你击败了玩家 ' + enemy.nick);

                //敌人死亡
                this.enemy.enemyDead(enemy);
                //清除加速特效
                if (enemy.getChildByName('enemy').getChildByName('speet').active) {
                    enemy.getChildByName('enemy').getChildByName('speet').active = false;
                }

                //增加经验
                let addScore = parseInt(this.roleData.get(enemy.level).be_killed_exp);
                this.player.expAddTotal += addScore;

                //击败数增加
                this.game.addKill(1);

                //连杀提示
                this.killMultiTipShow();

                //振动效果
                if (cc.sys.platform == cc.sys.WECHAT_GAME) {
                    wx.vibrateShort();
                }

                //击杀音效
                this.game.audio.onDeathAudio();
            }
        } else {
            this.scheduleOnce(() => {
                enemy.getChildByName('dun').active = false;
                enemy.dartShowTime = 0;
            }, this.game.dartSpeed);
        }

    },

    //AI飞镖碰撞
    enemyDartCheck(enemy) {
        if (this.darts.dartList.length == 0) return;
        for (let dart of this.darts.dartList) {
            if (dart) {
                let dartPos = dart.parent.convertToWorldSpaceAR(dart.getPosition());
                let dartSize = dart.getContentSize();
                if (this.player.node.active && !this.player.dunMax.active) {
                    if (!this.player.dun.active) {
                        let playerRadius = this.player.playerBody.width / 2;
                        let playerPos = this.player.node.convertToWorldSpaceAR(this.player.playerBody.getPosition());
                        if (playerPos.sub(dartPos).mag() < (playerRadius + dartSize.height / 2)) {
                            // //移除飞镖
                            //this.darts.removeEnemyDart(dart);

                            this.player.node.active = false;
                            this.joystick._touchEndEvent();
                            this.joystick.node.getChildByName('ring').getComponent('JoystickBg')._touchEndEvent();
                            this.player.stopSlashAction();

                            //击杀音效
                            this.game.audio.onDeathAudio();

                            //击杀特效
                            let spine = cc.instantiate(this.spine);
                            this.node.addChild(spine);
                            spine.setPosition(this.node.convertToNodeSpaceAR(playerPos
                            ));
                            spine.getComponent('spineControll').die();

                            this.scheduleOnce(() => {
                                this.game.overGame(enemy.nick);
                            }, 1);

                            //增加经验
                            let addScore = parseInt(this.roleData.get(this.player.level).be_killed_exp);
                            dart.owner.expAddTotal += addScore;
                        }
                    } else {
                        this.scheduleOnce(() => {
                            this.game.btnDunClear();
                        }, this.game.dartSpeed);
                    }

                }

                if (dart.owner != enemy && !enemy.getChildByName('dunMax').active) {
                    if (!enemy.getChildByName('dun').active) {
                        let body = enemy.getChildByName('enemy').getChildByName('enemyBody');
                        let enemyPos = enemy.convertToWorldSpaceAR(body.getPosition());
                        let enemySize = body.getContentSize();
                        if (enemyPos.sub(dartPos).mag() < (enemySize.width / 2 + dartSize.height / 2)) {
                            //移除飞镖
                            //this.darts.removeEnemyDart(dart);

                            //击杀特效
                            let spine = cc.instantiate(this.spine);
                            this.node.addChild(spine);
                            spine.setPosition(this.node.convertToNodeSpaceAR(enemyPos));
                            spine.getComponent('spineControll').die();

                            //敌人死亡
                            this.enemy.enemyDead(enemy);
                            //清除加速特效
                            if (enemy.getChildByName('enemy').getChildByName('speet').active) {
                                enemy.getChildByName('enemy').getChildByName('speet').active = false;
                            }

                            //增加经验
                            let addScore = parseInt(this.roleData.get(enemy.level).be_killed_exp);
                            dart.owner.expAddTotal += addScore;
                        }
                    } else {
                        this.scheduleOnce(() => {
                            enemy.getChildByName('dun').active = false;
                            enemy.dartShowTime = 0;
                        }, this.game.dartSpeed);
                    }
                }
            }
        }
    },

    //圆形与矩形碰撞检测
    ComputeCollision(w, h, r, newrx, newry) {
        var dx = Math.min(newrx, w * 0.5);
        var dx1 = Math.max(dx, -w * 0.5);
        var dy = Math.min(newry, h * 0.5);
        var dy1 = Math.max(dy, -h * 0.5);
        return (dx1 - newrx) * (dx1 - newrx) + (dy1 - newry) * (dy1 - newry) <= r * r;
    },

    //返回新的圆心坐标
    getNewRx_Ry(pos1, pos2, angle) {
        var json = {};
        var distance = this.twoDistance(pos1, pos2);
        var newangle = this.rot(pos1, pos2) - angle;
        var newRx = Math.cos(newangle / 180 * Math.PI) * distance;
        var newRy = Math.sin(newangle / 180 * Math.PI) * distance;
        json.newRx = newRx;
        json.newRy = newRy;
        return json;
    },

    //返回两点之间距离
    twoDistance(pos1, pos2) {
        return Math.pow((Math.pow((pos1.x - pos2.x), 2) + Math.pow((pos1.y - pos2.y), 2)), 0.5);
    },

    //计算最新角度（与X轴的角度），同数学X Y轴
    rot(pos1, pos2) {
        var value = (pos1.y - pos2.y) / (pos1.x - pos2.x);
        return Math.atan(value) * 180 / Math.PI;
    },

    //更新当前排行榜
    updateRankings() {
        if (this.rankArr) {
            this.rankArr = [];
        } else {
            this.rankArr = new Array();
        }
        // for (let value of this.enemy.enemyList) {
        //     if (value) {
        //         if (value.nick == undefined) console.log(value);
        //         this.rankArr.push(value);
        //     }
        // }
        this.rankArr = [].concat(this.enemy.enemyList);
        this.rankArr.push(this.player);

        this.rankArr.sort(function (a, b) {
            return b.exp - a.exp;
        });

        for (let i = 0; i < 5; i++) {
            if (this.rank.getChildByName('item' + (i + 1)).getChildByName('name').getComponent(cc.Label).string != this.rankArr[i].nick) {
                this.rank.getChildByName('item' + (i + 1)).getChildByName('name').getComponent(cc.Label).string = this.rankArr[i].nick;
            }
            if (this.rank.getChildByName('item' + (i + 1)).getChildByName('score').getComponent(cc.Label).string != this.rankArr[i].exp) {
                this.rank.getChildByName('item' + (i + 1)).getChildByName('score').getComponent(cc.Label).string = this.rankArr[i].exp;
            }
        }
        for (let key in this.rankArr) {
            if (this.rankArr[key] === this.player) {
                this.rank.getChildByName('item6').getChildByName('rankNum').getComponent(cc.Label).string = parseInt(key) + 1;
                this.rank.getChildByName('item6').getChildByName('name').getComponent(cc.Label).string = this.rankArr[key].nick;
                this.rank.getChildByName('item6').getChildByName('score').getComponent(cc.Label).string = this.rankArr[key].exp;
            }
            if (key === '0') {
                if (this.rankArr[key] === this.player) {
                    this.rankArr[key].playerName.getChildByName('crown').active = true;
                } else {
                    this.rankArr[key].getChildByName('enemyName').getChildByName('crown').active = true;
                }
            } else {
                if (this.rankArr[key] === this.player) {
                    if (this.rankArr[key].playerName.getChildByName('crown').active) {
                        this.rankArr[key].playerName.getChildByName('crown').active = false;
                    }
                } else {
                    if (this.rankArr[key].getChildByName('enemyName').getChildByName('crown').active) {
                        this.rankArr[key].getChildByName('enemyName').getChildByName('crown').active = false;
                    }
                }
            }
        }
    },

    //进化提示
    handbookTipShow(level) {
        if (!this.handbookTip.active) {
            this.handbookTip.active = true;
        }
        this.handbookTip.getChildByName('role').getComponent(cc.Label).string = this.roleData.get(level).name;

        this.unschedule(this.handbookTipShowTimer);
        this.schedule(this.handbookTipShowTimer, 3);
    },

    //进化提示计时器
    handbookTipShowTimer() {
        this.handbookTip.active = false;
        this.unschedule(this.handbookTipShowTimer);
    },

    //升级特效
    levelUpAnimation() {
        //升级特效
        // let spine = cc.instantiate(this.spine);
        // this.node.addChild(spine);
        // spine.group = 'UI';
        // spine.y = this.player.playerName.y + this.player.playerName.height / 2 + 30;
        // spine.getComponent('spineControll').levelUp();
        this.player.levelUp.active = true;

        let self = this;
        let spine = this.player.levelUp.getComponent(sp.Skeleton);
        let track = spine.setAnimation(0, 'animation', false);
        if (track) {
            // 注册动画的结束回调
            spine.setCompleteListener((trackEntry, loopCount) => {
                self.player.levelUp.active = false;
            });
        }
    }
});
