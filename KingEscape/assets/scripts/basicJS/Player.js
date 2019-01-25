cc.Class({
    extends: cc.Component,

    properties: {
        player: {
            default: null,
            type: cc.Node,
            displayName: '玩家'
        },
        playerBody: {
            default: null,
            type: cc.Node,
            displayName: '玩家身体'
        },
        sword: {
            default: null,
            type: cc.Node,
            displayName: '武器'
        },
        playerName: {
            default: null,
            type: cc.Node,
            displayName: '玩家名字'
        },
        ring: {
            default: null,
            type: cc.Node,
            displayName: '本级经验进度'
        },
        levelLabel: {
            default: null,
            type: cc.Label,
            displayName: '当前等级'
        },
        crown: {
            default: null,
            type: cc.Node,
            displayName: '皇冠'
        },

        dun: {
            default: null,
            type: cc.Node,
            displayName: '单次护盾特效'
        },

        dunMax: {
            default: null,
            type: cc.Node,
            displayName: '无敌护盾特效'
        },

        yanwu: {
            default: null,
            type: cc.Node,
            displayName: '烟雾特效'
        },

        levelUp: {
            default: null,
            type: cc.Node,
            displayName: '升级特效'
        },

        //主摄像机
        mainCamera: {
            default: null,
            type: cc.Node,
            displayName: '主摄像机'
        },
        //保证攻击工作不重复调用
        canSlash: {
            default: true,
            displayName: '能否挥砍'
        },

        //玩家当前经验值
        exp: 0,
        //玩家当前等级
        level: 1,
        //击杀人数
        killNum: 0,

        //击杀时间
        killTime: 0,
        //连杀数
        killMulti: 0,

        //累计增加经验
        expAddTotal: 0,
    },

    playerInit(stage) {
        this.stage = stage;
        this.menu = stage.menu;
        this.game = stage.game;
        this.roleData = stage.roleData;
        this.exp = 0;
        this.level = 1;
        this.killNum = 0;
        this.nick = '我';
        this.playerName.getComponent(cc.RichText).string = '<color=#1DBAFE>' + this.nick + '</c>';

        this.killTime = 0;
        this.killMulti = 0;

        this.expAddTotal = 0;

        this.canSlash = true;
        this.isCheckKill = false;
        this.initAllPosAndSize(1);//buff加成

        this.unschedule(this.roleHuxiAction);
        this.schedule(this.roleHuxiAction, 1);

        //烟雾特效隐藏
        this.yanwu.active = false;
        //护盾特效隐藏
        this.dun.active = false;
        this.dunMax.active = false;
        //升级特效隐藏
        this.levelUp.active = false;

        this.attack_speed = 0;
    },

    //角色呼吸动作
    roleHuxiAction() {
        let action1 = cc.scaleTo(0.5, 0.94, 1.04);
        let move1 = cc.moveBy(0.5, cc.v2(0, -this.playerBody.height * 0.02));
        let action2 = cc.scaleTo(0.5, 1, 1);
        let move2 = cc.moveBy(0.5, cc.v2(0, this.playerBody.height * 0.02));
        this.playerBody.runAction(cc.sequence(cc.spawn(action1, move1), cc.spawn(action2, move2)));
    },

    playerRestart() {
        this.exp = 0;
        this.level = 1;
        this.killNum = 0;

        this.killTime = 0;
        this.killMulti = 0;

        this.expAddTotal = 0;

        this.canSlash = true;
        this.isCheckKill = false;
        this.initAllPosAndSize(1);

        this.node.position = cc.v2(0, 0);
        this.mainCamera.position = cc.v2(0, 0);

        //烟雾特效隐藏
        this.yanwu.active = false;
        //护盾特效隐藏
        this.dun.active = false;
        this.dunMax.active = false;
        //升级特效隐藏
        this.levelUp.active = false;

        this.attack_speed = 0;
    },

    onLoad() {

    },

    //设置角色各部分位置和大小
    initAllPosAndSize(level) {
        let data = this.roleData.get(level);
        let role = this.roleData.get(level).modle.toString();
        let weapon = this.roleData.get(level).weapon.toString();

        //获取角色图片资源
        // 加载 SpriteFrame
        let roleSp = this.stage.findRoleSp(role);
        this.playerBody.getComponent(cc.Sprite).spriteFrame = roleSp;
        this.playerBody.width = data.body_width / roleSp.getOriginalSize().width * roleSp.getOriginalSize().width;
        this.playerBody.height = data.body_width / roleSp.getOriginalSize().width * roleSp.getOriginalSize().height;
        this.playerBody.angle = 180;

        //设置护盾大小
        this.dun.scaleX = 0.35 + 0.03 * (level - 1);
        this.dun.scaleY = 0.35 + 0.03 * (level - 1);
        this.dunMax.scaleX = 0.35 + 0.03 * (level - 1);
        this.dunMax.scaleY = 0.35 + 0.03 * (level - 1);

        let weaponSp = this.stage.findWeaponSp(weapon);
        this.sword.getComponent(cc.Sprite).spriteFrame = weaponSp;


        this.playerName.position = cc.v2(0, this.playerBody.height / 2 + this.playerName.height / 2 + 10);

        this.ring.parent.position = cc.v2(-(this.ring.width / 2 + this.playerName.width / 2 + 10), this.playerBody.height / 2 + this.playerName.height / 2 + 10);
        this.ring.getComponent(cc.ProgressBar).progress = 0;

        //皇冠大小
        this.crown.scaleX = 0.55 + (level - 1) * 0.015;
        this.crown.scaleY = 0.55 + (level - 1) * 0.015;

        this.levelLabel.string = level + '';

        if (this.exp === 0 && level > 1) {
            this.level = level;
            this.exp = this.roleData.get(level - 1).exp;
        }

        this.flashProperty();
    },

    //刷新移速、攻速、武器长度
    flashProperty() {
        //设置角色速度
        this.stage.moveSpeed = parseInt(this.roleData.get(this.level).move_speed) * (1 + this.game.buff2 + this.game.wheelBuff2 + this.game.boxBuff2);
        //武器长度
        this.sword.height = this.roleData.get(this.level).weapon_length * (1 + this.game.buff1 + this.game.wheelBuff1 + this.game.boxBuff1);//buff加成
        this.sword.width = this.sword.height / this.sword.getComponent(cc.Sprite).spriteFrame.getOriginalSize().height * this.sword.getComponent(cc.Sprite).spriteFrame.getOriginalSize().width;
        this.sword.position = cc.v2(-(this.playerBody.width / 2 + this.sword.width / 2), -this.sword.height / 2);
        //攻击速度
        this.attack_speed = parseFloat(this.roleData.get(this.level).attack_speed) * (1 - this.game.buff3 - this.game.wheelBuff3 - this.game.boxBuff3);
    },

    //增加经验值
    addExp() {
        this.exp += this.expAddTotal;
        this.stage.updateRankings();
        let nowExpTop = this.roleData.get(this.level).exp;
        if (this.level === 1) {
            this.ring.getComponent(cc.ProgressBar).progress = (this.exp / nowExpTop).toFixed(1);
        } else {
            let lastExpTop = this.roleData.get(this.level - 1).exp;
            this.ring.getComponent(cc.ProgressBar).progress = ((this.exp - lastExpTop) / (nowExpTop - lastExpTop)).toFixed(1);
        }

        if (this.exp >= nowExpTop && this.level < this.roleData.getLength()) {
            this.level++;

            this.initAllPosAndSize(this.level);
            this.stage.game.addLevel(this.level);

            //进化提示
            this.stage.handbookTipShow(this.level);
            //升级提示
            this.stage.killTipShow('恭喜你进化到 ' + this.level + '级！');

            //升级音效
            this.game.audio.onLevelUpAudio();

            //升级特效
            this.stage.levelUpAnimation();
        }

        this.expAddTotal = 0;
    },

    //设置x位置
    setPosX(num) {
        if (!this.game.boxIsOpen) {
            this.node.x += num;

            let leftX = -this.game.gameBg.width / 2 + this.playerBody.width / 2;
            let rightX = this.game.gameBg.width / 2 - this.playerBody.width / 2;
            if (this.node.x < leftX) {
                this.node.x = leftX;
                return;
            }
            if (this.node.x > rightX) {
                this.node.x = rightX;
                return;
            }

            this.mainCamera.x += num;
        }
    },

    //设置y位置
    setPosY(num) {
        if (!this.game.boxIsOpen) {
            this.node.y += num;

            let topY = -this.game.gameBg.height / 2 + this.playerBody.width / 2;
            let bottomY = this.game.gameBg.height / 2 - this.playerBody.width / 2
            if (this.node.y < topY) {
                this.node.y = topY;
                return;
            }
            if (this.node.y > bottomY) {
                this.node.y = bottomY;
                return;
            }

            this.mainCamera.y += num;
        }
    },

    //主角随机位置
    randPos() {
        this.node.x = Math.round(Math.random() * (this.game.gameBg.width - this.playerBody.width) - (this.game.gameBg.width / 2 - this.playerBody.width / 2));
        this.node.y = Math.round(Math.random() * (this.game.gameBg.height - this.playerBody.width) - (this.game.gameBg.height / 2 - this.playerBody.width / 2));
        this.mainCamera.x = this.node.x;
        this.mainCamera.y = this.node.y;
    },

    //改变朝向
    setDirection(angle) {
        this.player.angle = angle - 90;
    },

    //挥砍动作
    slashAction() {
        this.canSlash = false;
        this.isCheckKill = true;


        let bezier1 = [cc.v2(0, this.playerBody.height * 2), cc.v2(Math.abs(this.sword.x) * 1.7, this.playerBody.height * 2), cc.v2(Math.abs(this.sword.x) * 1.7, this.playerBody.height * 1.7)];
        let bezierForward1 = cc.bezierBy(this.attack_speed, bezier1);

        let rotationAction1 = cc.rotateBy(this.attack_speed, -200);

        let finishAction1 = cc.callFunc(() => {
            this.isCheckKill = false;
        }, this);

        let bezier2 = [cc.v2(0, this.playerBody.height * 0.3), cc.v2(-Math.abs(this.sword.x) * 1.7, this.playerBody.height * 0.3), cc.v2(-Math.abs(this.sword.x) * 1.7, -this.playerBody.height * 1.7)];
        let bezierForward2 = cc.bezierBy(this.attack_speed, bezier2);

        let rotationAction2 = cc.rotateBy(this.attack_speed, 200);

        let finishAction2 = cc.callFunc(() => {
            this.canSlash = true;
            this.stage.moveAllow = true;
            this.sword.position = cc.v2(-(this.playerBody.width / 2 + this.sword.width / 2), -this.sword.height / 2);
        }, this);
        this.sword.runAction(cc.sequence(cc.spawn(bezierForward1, rotationAction1), finishAction1, cc.spawn(bezierForward2, rotationAction2), finishAction2));
    },

    //停止挥砍动作
    stopSlashAction() {
        this.sword.stopAllActions();
        this.isCheckKill = false;
        this.canSlash = true;
        this.stage.moveAllow = true;
        this.sword.angle = 0;
        this.sword.position = cc.v2(-(this.playerBody.width / 2 + this.sword.width / 2), -this.sword.height / 2);
    }
});
