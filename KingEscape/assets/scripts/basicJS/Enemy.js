import Quadtree from './QuadTree';
import wxName from '../data/wxName';

cc.Class({
    extends: cc.Component,

    properties: {
        enemyPrefab: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },

    update(dt) {

    },

    enemyInit(stage) {
        this.stage = stage;
        this.game = stage.game;
        this.player = stage.player;
        this.expEnemy = stage.expEnemy;
        this.food = stage.food;
        this.roleData = stage.roleData;

        this.initEnemyPool();
        this.addInitEnemy();

        this.unschedule(this.enemyHuxiAction);
        this.schedule(this.enemyHuxiAction, 1);
    },

    //角色呼吸动作
    enemyHuxiAction() {
        for (let value of this.enemyList) {
            let action1 = cc.scaleTo(0.5, 0.94, 1.04);
            let move1 = cc.moveBy(0.5, cc.v2(0, -value.getChildByName('enemy').getChildByName('enemyBody').height * 0.02));
            let action2 = cc.scaleTo(0.5, 1, 1);
            let move2 = cc.moveBy(0.5, cc.v2(0, value.getChildByName('enemy').getChildByName('enemyBody').height * 0.02));
            value.getChildByName('enemy').getChildByName('enemyBody').runAction(cc.sequence(cc.spawn(action1, move1), cc.spawn(action2, move2)));
        }
    },

    enemyRestart() {
        for (let value of this.enemyList) {
            value.removeFromParent();
            value.destroy();
            value = null;
        }
        this.addInitEnemy();
    },

    //创建对象池
    initEnemyPool() {
        //初始化对象池
        this.enemyPool = new cc.NodePool();
        for (let i = 0; i < this.game.enemyMax; i++) {
            let enemy = cc.instantiate(this.enemyPrefab);
            this.enemyPool.put(enemy);
        };
    },

    //从对象池获取对象
    createEnemy() {
        let enemy;
        if (this.enemyPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            enemy = this.enemyPool.get();
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            enemy = cc.instantiate(this.enemyPrefab);
        }
        return enemy;
    },

    //将对象放回对象池
    enemyKilled(enemy) {
        //停止并删除动作列表
        enemy.getChildByName('enemy').stopAllActions();
        enemy.getChildByName('enemy').getChildByName('enemySword').stopAllActions();
        this.enemyPool.put(enemy);

        //从数组中删除
        for (let i = 0; i < this.enemyList.length; i++) {
            if (enemy === this.enemyList[i]) {
                this.enemyList.splice(i, 1);
                return;
            }
        }

        //this.enemyList.splice(enemy, this.enemyList.indexOf(enemy));
    },

    //创建初始数量敌人
    addInitEnemy() {
        if (this.enemyList) {
            this.enemyList = [];
        } else {
            this.enemyList = new Array();
        }
        for (let i = 0; i < this.game.enemyMax; i++) {
            this.addEnemy();
        }
    },

    //添加敌人
    addEnemy() {
        let enemy = this.createEnemy();

        let enemyName = wxName.TblGate[Math.floor(Math.random() * Object.keys(wxName.TblGate).length) + 1]['strName'];
        enemy.getChildByName('enemyName').getComponent(cc.RichText).string = '<color=#ff1f06>' + enemyName + '</c>';
        enemy.nick = enemyName;

        //初始朝向
        enemy.getChildByName('enemy').angle = Math.round(Math.random() * 360);
        //初始等级
        let min = Math.floor(Math.random() * (this.game.levelMinGap + 1));
        let max = Math.floor(Math.random() * (this.game.levelMaxGap + 1));
        let level = Math.random() > 0.5 ? this.player.level + max : this.player.level - min;
        if (level <= 0) {
            level = 1;
        } else if (level > this.roleData.getLength()) {
            level = this.roleData.getLength();
        }
        enemy.level = level;
        //初始经验值
        enemy.exp = 0;
        //初始速度
        enemy.speed = 0;
        //初始状态
        enemy.state = 'eat';
        //能够攻击
        enemy.canSlash = true;
        //能否检测攻击碰撞
        enemy.isCheckKill = false;
        //是否加速
        enemy.isQuick = false;
        //攻击状态持续时间
        enemy.attackTime = 0;
        //捡球状态持续时间
        enemy.eatTime = 0;
        //逃跑状态持续时间
        enemy.escapeTime = 0;
        //追击状态持续时间
        enemy.chaseTime = 0;
        //飞镖攻击状态持续时间
        enemy.dartTime = 0;

        //是否可以进行飞镖攻击
        enemy.isCanDart = true;
        //护盾持续时长
        enemy.dartShowTime = 0;

        //累计增加经验
        enemy.expAddTotal = 0;

        this.node.addChild(enemy);
        this.initAllPosAndSize(enemy, enemy.level);

        let body = enemy.getChildByName('enemy').getChildByName('enemyBody');
        let randX = 0;
        let randY = 0;

        if (this.player.node.x + this.stage.bg.node.width / 2 < this.stage.node.width / 2 + 200) {
            randX = Math.round(Math.random() * (this.game.gameBg.width / 2 - body.width / 2 - (this.player.node.x + this.player.playerBody.width / 2 + parseInt(this.stage.roleData.get(enemy.level).min_check_range) + 200)) + (this.player.node.x + this.player.playerBody.width / 2 + parseInt(this.stage.roleData.get(enemy.level).min_check_range) + 200));
        } else if (this.stage.bg.node.width / 2 - this.player.node.x < this.stage.node.width / 2 + 200) {
            randX = Math.round(Math.random() * (this.player.node.x - this.player.playerBody.width / 2 - parseInt(this.stage.roleData.get(enemy.level).min_check_range) - 200 + this.game.gameBg.width / 2 - body.width / 2) - (this.game.gameBg.width / 2 - body.width / 2));
        } else {
            if (Math.random() > 0.5) {
                randX = Math.round(Math.random() * (this.player.node.x - this.player.playerBody.width / 2 - parseInt(this.stage.roleData.get(enemy.level).min_check_range) - 200 + this.game.gameBg.width / 2 - body.width / 2) - (this.game.gameBg.width / 2 - body.width / 2));
            } else {
                randX = Math.round(Math.random() * (this.game.gameBg.width / 2 - body.width / 2 - (this.player.node.x + this.player.playerBody.width / 2 + parseInt(this.stage.roleData.get(enemy.level).min_check_range) + 200)) + (this.player.node.x + this.player.playerBody.width / 2 + parseInt(this.stage.roleData.get(enemy.level).min_check_range) + 200));
            }
        }

        if (this.player.node.y + this.stage.bg.node.height / 2 < this.stage.node.height / 2 + 150) {
            randY = Math.round(Math.random() * (this.game.gameBg.height / 2 - body.width / 2 - (this.player.node.y + this.player.playerBody.height / 2 + parseInt(this.stage.roleData.get(enemy.level).min_check_range) + 200)) + (this.player.node.y + this.player.playerBody.height / 2 + parseInt(this.stage.roleData.get(enemy.level).min_check_range) + 200));
        } else if (this.stage.bg.node.height / 2 - this.player.node.y < this.stage.node.height / 2 + 150) {
            randY = Math.round(Math.random() * (this.player.node.y - this.player.playerBody.height / 2 - parseInt(this.stage.roleData.get(enemy.level).min_check_range) - 200 + this.game.gameBg.height / 2 - body.width / 2) - (this.game.gameBg.height / 2 - body.width / 2));
        } else {
            if (Math.random() > 0.5) {
                randY = Math.round(Math.random() * (this.player.node.y - this.player.playerBody.height / 2 - parseInt(this.stage.roleData.get(enemy.level).min_check_range) - 200 + this.game.gameBg.height / 2 - body.width / 2) - (this.game.gameBg.height / 2 - body.width / 2));
            } else {
                randY = Math.round(Math.random() * (this.game.gameBg.height / 2 - body.width / 2 - (this.player.node.y + this.player.playerBody.height / 2 + parseInt(this.stage.roleData.get(enemy.level).min_check_range) + 200)) + (this.player.node.y + this.player.playerBody.height / 2 + parseInt(this.stage.roleData.get(enemy.level).min_check_range) + 200));
            }
        }
        //randX = Math.round(Math.random() * (this.game.gameBg.width - body.width) - (this.game.gameBg.width / 2 - body.width / 2));
        //randY = Math.round(Math.random() * (this.game.gameBg.height - body.width) - (this.game.gameBg.height / 2 - body.width / 2));

        // while ((randX > this.player.node.x - this.player.playerBody.width / 2 - parseInt(this.stage.roleData.get(enemy.level).min_check_range) - 200) && (randX < this.player.node.x + this.player.playerBody.width / 2 + parseInt(this.stage.roleData.get(enemy.level).min_check_range) + 200) || (randY > this.player.node.y - this.player.playerBody.height / 2 - parseInt(this.stage.roleData.get(enemy.level).min_check_range) - 200) && (randY < this.player.node.y + this.player.playerBody.height / 2 + parseInt(this.stage.roleData.get(enemy.level).min_check_range) + 200)) {
        //     randX = Math.round(Math.random() * (this.game.gameBg.width - body.width) - (this.game.gameBg.width / 2 - body.width / 2));
        //     randY = Math.round(Math.random() * (this.game.gameBg.height - body.width) - (this.game.gameBg.height / 2 - body.width / 2));
        // }

        let pos = cc.v2(randX, randY);
        enemy.setPosition(pos);

        //烟雾特效隐藏
        enemy.getChildByName('enemy').getChildByName('speet').active = false;
        //护盾特效隐藏
        enemy.getChildByName('dun').active = false;
        enemy.getChildByName('dunMax').active = false;

        this.enemyList.push(enemy);
    },

    //敌人击杀处理
    enemyDead(enemy) {
        //停止并删除动作列表
        enemy.getChildByName('enemy').stopAllActions();
        enemy.getChildByName('enemy').getChildByName('enemySword').stopAllActions();

        //随机名字
        let enemyName = wxName.TblGate[Math.floor(Math.random() * Object.keys(wxName.TblGate).length) + 1]['strName'];
        enemy.getChildByName('enemyName').getComponent(cc.RichText).string = '<color=#ff1f06>' + enemyName + '</c>';
        enemy.nick = enemyName;

        //随机等级
        let min = Math.floor(Math.random() * (this.game.levelMinGap + 1));
        let max = Math.floor(Math.random() * (this.game.levelMaxGap + 1));
        let level = Math.random() > 0.5 ? this.player.level + max : this.player.level - min;
        if (level <= 0) {
            level = 1;
        } else if (level > this.roleData.getLength()) {
            level = this.roleData.getLength();
        }
        enemy.level = level;
        //初始经验值
        enemy.exp = 0;
        //初始速度
        enemy.speed = 0;
        //初始状态
        enemy.state = 'eat';
        //能够攻击
        enemy.canSlash = true;
        //能否检测攻击碰撞
        enemy.isCheckKill = false;
        //是否加速
        enemy.isQuick = false;
        //攻击状态持续时间
        enemy.attackTime = 0;
        //捡球状态持续时间
        enemy.eatTime = 0;
        //逃跑状态持续时间
        enemy.escapeTime = 0;
        //追击状态持续时间
        enemy.chaseTime = 0;
        //飞镖攻击状态持续时间
        enemy.dartTime = 0;

        //是否可以进行飞镖攻击
        enemy.isCanDart = true;
        //护盾持续时长
        enemy.dartShowTime = 0;

        //累计增加经验
        enemy.expAddTotal = 0;


        //随机位置
        this.initAllPosAndSize(enemy, enemy.level);

        let body = enemy.getChildByName('enemy').getChildByName('enemyBody');
        let randX = 0;
        let randY = 0;

        if (this.player.node.x + this.stage.bg.node.width / 2 < this.stage.node.width / 2 + 200) {
            randX = Math.round(Math.random() * ((this.game.gameBg.width / 2 - body.width / 2 - 100) - (this.player.node.x + this.player.playerBody.width / 2 + parseInt(this.stage.roleData.get(enemy.level).min_check_range) + 200)) + (this.player.node.x + this.player.playerBody.width / 2 + parseInt(this.stage.roleData.get(enemy.level).min_check_range) + 200));
        } else if (this.stage.bg.node.width / 2 - this.player.node.x < this.stage.node.width / 2 + 200) {
            randX = Math.round(Math.random() * (this.player.node.x - this.player.playerBody.width / 2 - parseInt(this.stage.roleData.get(enemy.level).min_check_range) - 200 + this.game.gameBg.width / 2 - body.width / 2 - 100) - (this.game.gameBg.width / 2 - body.width / 2));
        } else {
            if (Math.random() > 0.5) {
                randX = Math.round(Math.random() * (this.player.node.x - this.player.playerBody.width / 2 - parseInt(this.stage.roleData.get(enemy.level).min_check_range) - 200 + this.game.gameBg.width / 2 - body.width / 2 - 100) - (this.game.gameBg.width / 2 - body.width / 2));
            } else {
                randX = Math.round(Math.random() * ((this.game.gameBg.width / 2 - body.width / 2 - 100) - (this.player.node.x + this.player.playerBody.width / 2 + parseInt(this.stage.roleData.get(enemy.level).min_check_range) + 200)) + (this.player.node.x + this.player.playerBody.width / 2 + parseInt(this.stage.roleData.get(enemy.level).min_check_range) + 200));
            }
        }

        if (this.player.node.y + this.stage.bg.node.height / 2 < this.stage.node.height / 2 + 150) {
            randY = Math.round(Math.random() * ((this.game.gameBg.height / 2 - body.width / 2 - 100) - (this.player.node.y + this.player.playerBody.height / 2 + parseInt(this.stage.roleData.get(enemy.level).min_check_range) + 200)) + (this.player.node.y + this.player.playerBody.height / 2 + parseInt(this.stage.roleData.get(enemy.level).min_check_range) + 200));
        } else if (this.stage.bg.node.height / 2 - this.player.node.y < this.stage.node.height / 2 + 150) {
            randY = Math.round(Math.random() * (this.player.node.y - this.player.playerBody.height / 2 - parseInt(this.stage.roleData.get(enemy.level).min_check_range) - 200 + this.game.gameBg.height / 2 - body.width / 2 - 100) - (this.game.gameBg.height / 2 - body.width / 2));
        } else {
            if (Math.random() > 0.5) {
                randY = Math.round(Math.random() * (this.player.node.y - this.player.playerBody.height / 2 - parseInt(this.stage.roleData.get(enemy.level).min_check_range) - 200 + this.game.gameBg.height / 2 - body.width / 2 - 100) - (this.game.gameBg.height / 2 - body.width / 2));
            } else {
                randY = Math.round(Math.random() * ((this.game.gameBg.height / 2 - body.width / 2 - 100) - (this.player.node.y + this.player.playerBody.height / 2 + parseInt(this.stage.roleData.get(enemy.level).min_check_range) + 200)) + (this.player.node.y + this.player.playerBody.height / 2 + parseInt(this.stage.roleData.get(enemy.level).min_check_range) + 200));
            }
        }
        //let randX = Math.round(Math.random() * (this.game.gameBg.width - body.width) - (this.game.gameBg.width / 2 - body.width / 2));
        //let randY = Math.round(Math.random() * (this.game.gameBg.height - body.width) - (this.game.gameBg.height / 2 - body.width / 2));

        // while ((randX > this.player.node.x - parseInt(this.stage.roleData.get(enemy.level).min_check_range) - 50) && (randX < this.player.node.x + parseInt(this.stage.roleData.get(enemy.level).min_check_range) + 50) || (randY > this.player.node.y - parseInt(this.stage.roleData.get(enemy.level).min_check_range) - 50) && (randY < this.player.node.y + parseInt(this.stage.roleData.get(enemy.level).min_check_range) + 50)) {
        //     randX = Math.round(Math.random() * (this.game.gameBg.width - body.width) - (this.game.gameBg.width / 2 - body.width / 2));
        //     randY = Math.round(Math.random() * (this.game.gameBg.height - body.width) - (this.game.gameBg.height / 2 - body.width / 2));
        // }

        let pos = cc.v2(randX, randY);
        enemy.setPosition(pos);

        //烟雾特效隐藏
        enemy.getChildByName('enemy').getChildByName('speet').active = false;
        //护盾特效隐藏
        enemy.getChildByName('dun').active = false;
        enemy.getChildByName('dunMax').active = false;
    },

    //设置角色各部分位置和大小
    initAllPosAndSize(enemy, level) {
        let data = this.roleData.get(level);
        let role = this.roleData.get(level).modle.toString();
        let weapon = this.roleData.get(level).weapon.toString();

        let body = enemy.getChildByName('enemy').getChildByName('enemyBody');
        let sword = enemy.getChildByName('enemy').getChildByName('enemySword');
        let ring = enemy.getChildByName('expBg').getChildByName('ring');
        let levelLabel = enemy.getChildByName('expBg').getChildByName('levelLabel');
        let enemyName = enemy.getChildByName('enemyName');

        //设置速度
        enemy.speed = parseFloat(data.move_speed);

        //体型宽度
        let roleSp = this.stage.findRoleSp(role);
        body.getComponent(cc.Sprite).spriteFrame = roleSp;
        body.width = data.body_width;
        body.height = data.body_width / roleSp.getOriginalSize().width * roleSp.getOriginalSize().height;
        body.angle = 180;

        //武器宽度
        let weaponSp = this.stage.findWeaponSp(weapon);
        sword.getComponent(cc.Sprite).spriteFrame = weaponSp;
        sword.angle = 0;
        sword.height = data.weapon_length;
        sword.width = data.weapon_length / weaponSp.getOriginalSize().height * weaponSp.getOriginalSize().width;
        sword.position = cc.v2(-(body.width / 2 + sword.width / 2 + 5), -sword.height / 2);

        //初始化名字位置
        enemyName.position = cc.v2(0, body.height / 2 + enemyName.height / 2 + 10);
        //初始化等级进度位置
        ring.parent.position = cc.v2(-(ring.width / 2 + enemyName.width / 2 + 10), body.height / 2 + enemyName.height / 2 + 10);
        ring.getComponent(cc.ProgressBar).progress = 0;
        //等级显示
        levelLabel.getComponent(cc.Label).string = level + '';

        //皇冠大小
        enemy.getChildByName('enemyName').getChildByName('crown').scaleX = 0.55 + (level - 1) * 0.015;
        enemy.getChildByName('enemyName').getChildByName('crown').scaleY = 0.55 + (level - 1) * 0.015;

        //设置护盾大小
        enemy.getChildByName('dun').scaleX = 0.35 + 0.03 * (level - 1);
        enemy.getChildByName('dun').scaleY = 0.35 + 0.03 * (level - 1);
        enemy.getChildByName('dunMax').scaleX = 0.35 + 0.03 * (level - 1);
        enemy.getChildByName('dunMax').scaleY = 0.35 + 0.03 * (level - 1);

        //初始等级超过1级，设置基础经验值
        if (enemy.exp === 0 && level > 1) {
            enemy.level = level;
            enemy.exp = parseInt(this.roleData.get(level - 1).exp);
        }
    },

    //增加经验值
    addExp(enemy) {
        enemy.exp += enemy.expAddTotal;
        this.stage.updateRankings();

        let nowExpTop = parseInt(this.roleData.get(enemy.level).exp);

        if (enemy.level === 1) {
            enemy.getChildByName('expBg').getChildByName('ring').getComponent(cc.ProgressBar).progress = (enemy.exp / nowExpTop).toFixed(1);
        } else {
            let lastExpTop = parseInt(this.roleData.get(enemy.level - 1).exp);
            enemy.getChildByName('expBg').getChildByName('ring').getComponent(cc.ProgressBar).progress = ((enemy.exp - lastExpTop) / (nowExpTop - lastExpTop)).toFixed(1);
        }
        if (enemy.exp >= nowExpTop && enemy.level < this.roleData.getLength()) {
            enemy.level++;
            this.initAllPosAndSize(enemy, enemy.level);
        }

        enemy.expAddTotal = 0;

    },

    //攻击
    attack(enemy) {
        //攻击反应时间
        let attack_time = parseFloat(this.roleData.get(enemy.level).attack_time);
        //攻击速度
        let attack_speed = parseFloat(this.roleData.get(enemy.level).attack_speed);

        enemy.canSlash = false;

        let delayTime = cc.delayTime(attack_time);

        let finishAction = cc.callFunc(() => {
            enemy.isCheckKill = true;
        }, this);

        let body = enemy.getChildByName('enemy').getChildByName('enemyBody');
        let sword = enemy.getChildByName('enemy').getChildByName('enemySword');

        let bezier1 = [cc.v2(0, body.height * 2), cc.v2(Math.abs(sword.x) * 1.7, body.height * 2), cc.v2(Math.abs(sword.x) * 1.7, body.height * 1.7)];
        let bezierForward1 = cc.bezierBy(attack_speed, bezier1);

        let rotationAction1 = cc.rotateBy(attack_speed, -200);

        let finishAction1 = cc.callFunc(() => {
            enemy.isCheckKill = false;
        }, this);

        let bezier2 = [cc.v2(0, body.height * 0.3), cc.v2(-Math.abs(sword.x) * 1.7, body.height * 0.3), cc.v2(-Math.abs(sword.x) * 1.7, -body.height * 1.7)];
        let bezierForward2 = cc.bezierBy(attack_speed, bezier2);

        let rotationAction2 = cc.rotateBy(attack_speed, 200);

        let finishAction2 = cc.callFunc(() => {
            enemy.canSlash = true;
        }, this);

        enemy.getChildByName('enemy').getChildByName('enemySword').runAction(cc.sequence(delayTime, finishAction, cc.spawn(bezierForward1, rotationAction1), finishAction1, cc.spawn(bezierForward2, rotationAction2), finishAction2));
    },
    
    //攻击范围检测
    attackRangeCheck(enemy) {
        if (!this.stage.playerIsGod && this.game.gameState === 'game' && this.player.node.active === true && !this.player.dunMax.active) {
            let pos1 = enemy.parent.convertToWorldSpaceAR(enemy.getPosition());
            let pos2 = this.player.node.parent.convertToWorldSpaceAR(this.player.node.getPosition());
            if (pos1.sub(pos2).mag() < parseInt(this.roleData.get(enemy.level).min_check_range)) {
                return true;
            }
        }
        for (let value of this.enemyList) {
            if (enemy != value && !value.getChildByName('dunMax').active) {
                let pos1 = enemy.parent.convertToWorldSpaceAR(enemy.getPosition());
                let pos2 = value.parent.convertToWorldSpaceAR(value.getPosition());
                if (pos1.sub(pos2).mag() <= parseInt(this.roleData.get(enemy.level).min_check_range)) {
                    return true;
                }
            }
        }
        return false;
    },

    //飞镖攻击范围检测
    dartRangeCheck(enemy) {
        if (!this.stage.playerIsGod && this.game.gameState === 'game' && this.player.node.active === true && !this.player.dunMax.active) {
            let pos1 = enemy.parent.convertToWorldSpaceAR(enemy.getPosition());
            let pos2 = this.player.node.parent.convertToWorldSpaceAR(this.player.node.getPosition());
            if (pos1.sub(pos2).mag() < parseInt(this.roleData.get(enemy.level).dart_range)) {
                return true;
            }
        }
        for (let value of this.enemyList) {
            if (enemy != value && !value.getChildByName('dunMax').active) {
                let pos1 = enemy.parent.convertToWorldSpaceAR(enemy.getPosition());
                let pos2 = value.parent.convertToWorldSpaceAR(value.getPosition());
                if (pos1.sub(pos2).mag() <= parseInt(this.roleData.get(enemy.level).dart_range)) {
                    return true;
                }
            }
        }

        return false;
    },

    //警戒范围检测
    warnRangeCheck(enemy) {
        if (!this.stage.playerIsGod && this.game.gameState === 'game' && this.player.node.active === true && !this.player.dunMax.active) {
            let pos1 = enemy.parent.convertToWorldSpaceAR(enemy.getPosition());
            let pos2 = this.player.node.parent.convertToWorldSpaceAR(this.player.node.getPosition());
            if (pos1.sub(pos2).mag() < parseInt(this.roleData.get(enemy.level).max_check_range)) {
                return true;
            }
        }
        for (let value of this.enemyList) {
            if (enemy != value && !value.getChildByName('dunMax').active) {
                let pos1 = enemy.parent.convertToWorldSpaceAR(enemy.getPosition());
                let pos2 = value.parent.convertToWorldSpaceAR(value.getPosition());
                if (pos1.sub(pos2).mag() <= parseInt(this.roleData.get(enemy.level).max_check_range)) {
                    return true;
                }
            }
        }

        return false;
    },

    //获得最近的敌人或者玩家
    getNearPlayer(enemy) {
        let minDis = 9999;
        let minIndex = 0;
        for (let i = 0; i < this.enemyList.length; i++) {
            if (enemy != this.enemyList[i] && !this.enemyList[i].getChildByName('dunMax').active) {
                let pos1 = enemy.parent.convertToWorldSpaceAR(enemy.getPosition());
                let pos2 = this.enemyList[i].parent.convertToWorldSpaceAR(this.enemyList[i].getPosition());

                let dis = pos1.sub(pos2).mag();
                if (dis < minDis) {
                    minDis = dis;
                    minIndex = i;
                }
            }
        }

        if (!this.stage.playerIsGod && this.game.gameState === 'game' && this.player.node.active === true && !this.player.dunMax.active) {
            let pos1 = enemy.parent.convertToWorldSpaceAR(enemy.getPosition());
            let pos2 = this.player.node.parent.convertToWorldSpaceAR(this.player.node.getPosition());
            if (pos1.sub(pos2).mag() < minDis) {
                return this.player.node;
            }
        }
        return this.enemyList[minIndex];
    },

    //获得最近的敌人或玩家方向，改变AI朝向
    getNearPlayerDir(enemy) {
        let nearEnemy = this.getNearPlayer(enemy);
        let pos1 = nearEnemy.parent.convertToWorldSpaceAR(nearEnemy.getPosition());
        let pos2 = enemy.parent.convertToWorldSpaceAR(enemy.getPosition());
        let angle = Math.atan2(pos1.y - pos2.y, pos1.x - pos2.x) * (180 / Math.PI);
        return angle - 90;
    },

    //AI状态机
    enemyState(enemy) {
        //转向时间
        let turn_time = parseFloat(this.roleData.get(enemy.level).turn_time);
        switch (enemy.state) {
            case 'await':
                //概率使用护盾
                if (!enemy.getChildByName('dun').active) {
                    if (Math.random() < parseFloat(this.roleData.get(enemy.level).shield_pro)) {//this.roleData.get(enemy.level).shield_pro
                        enemy.getChildByName('dun').active = true;
                    }
                }
                break;
            case 'attack'://攻击
                if (enemy.canSlash === true) {
                    //删除加速特效
                    if (enemy.getChildByName('enemy').getChildByName('speet').active) {
                        enemy.getChildByName('enemy').getChildByName('speet').active = false;
                    }

                    let rotationAction1 = cc.rotateTo(turn_time, this.getNearPlayerDir(enemy));
                    let finishAction = cc.callFunc(function () {
                        this.attack(enemy);
                    }, this);
                    enemy.getChildByName('enemy').runAction(cc.sequence(rotationAction1, finishAction));

                    //攻击状态持续时间
                    enemy.attackTime = 0;
                    //捡球状态持续时间
                    enemy.eatTime = 0;
                    //逃跑状态持续时间
                    enemy.escapeTime = 0;
                    //追击状态持续时间
                    enemy.chaseTime = 0;
                    //飞镖攻击状态持续时间
                    enemy.dartTime = 0;
                }
                break;
            case 'eat'://捡经验球
                let rotationAction2 = cc.rotateTo(turn_time, this.food.getNearFood(enemy));
                enemy.getChildByName('enemy').runAction(rotationAction2);

                //攻击状态持续时间
                enemy.attackTime = 0;
                //捡球状态持续时间
                enemy.eatTime = 0;
                //逃跑状态持续时间
                enemy.escapeTime = 0;
                //追击状态持续时间
                enemy.chaseTime = 0;
                //飞镖攻击状态持续时间
                enemy.dartTime = 0;
                break;
            case 'escape'://逃跑
                let newAngle = this.getNearPlayerDir(enemy) > 180 ? this.getNearPlayerDir(enemy) - 180 : this.getNearPlayerDir(enemy) + 180;
                let rotationAction3 = cc.rotateTo(turn_time, newAngle);
                enemy.getChildByName('enemy').runAction(rotationAction3);
                if (Math.random() < this.roleData.get(enemy.level).accelerate_pro) {
                    enemy.isQuick = true;

                    if (enemy.getChildByName('enemy').getChildByName('enemyBody').childrenCount > 0) {
                        enemy.getChildByName('enemy').getChildByName('enemyBody').removeAllChildren();
                    }
                    //加速特效
                    if (!enemy.getChildByName('enemy').getChildByName('speet').active) {
                        enemy.getChildByName('enemy').getChildByName('speet').active = true;
                    }
                }

                //攻击状态持续时间
                enemy.attackTime = 0;
                //捡球状态持续时间
                enemy.eatTime = 0;
                //逃跑状态持续时间
                enemy.escapeTime = 0;
                //追击状态持续时间
                enemy.chaseTime = 0;
                //飞镖攻击状态持续时间
                enemy.dartTime = 0;
                break;
            case 'chase'://追击
                enemy.chaseTarget = this.getNearPlayer(enemy);
                if (Math.random() < this.roleData.get(enemy.level).accelerate_pro) {
                    enemy.isQuick = true;

                    if (enemy.getChildByName('enemy').getChildByName('enemyBody').childrenCount > 0) {
                        enemy.getChildByName('enemy').getChildByName('enemyBody').removeAllChildren();
                    }
                    //加速特效
                    if (!enemy.getChildByName('enemy').getChildByName('speet').active) {
                        enemy.getChildByName('enemy').getChildByName('speet').active = true;
                    }
                }

                //攻击状态持续时间
                enemy.attackTime = 0;
                //捡球状态持续时间
                enemy.eatTime = 0;
                //逃跑状态持续时间
                enemy.escapeTime = 0;
                //追击状态持续时间
                enemy.chaseTime = 0;
                //飞镖攻击状态持续时间
                enemy.dartTime = 0;
                break;
            case 'dartAttack'://飞镖攻击
                let rotationAction1 = cc.rotateTo(turn_time, this.getNearPlayerDir(enemy));
                let finishAction = cc.callFunc(function () {
                    let nowX = enemy.x;
                    let nowY = enemy.y;
                    let direction = enemy.getChildByName('enemy').angle;
                    let scale = 0.6 + 0.025 * (enemy.level - 1);
                    let range = this.roleData.get(enemy.level).dart_range;
                    let speed = this.game.dartSpeed;

                    this.stage.darts.addEnemyDart(nowX, nowY, direction, scale, range, speed, enemy);
                }, this);
                enemy.getChildByName('enemy').runAction(cc.sequence(rotationAction1, finishAction));

                //攻击状态持续时间
                enemy.attackTime = 0;
                //捡球状态持续时间
                enemy.eatTime = 0;
                //逃跑状态持续时间
                enemy.escapeTime = 0;
                //追击状态持续时间
                enemy.chaseTime = 0;
                //飞镖攻击状态持续时间
                enemy.dartTime = 0;
                break;
        }
    },

    //初始化四叉树方法
    initQuad() {
        //初始化四叉树
        this.quad = new Quadtree();
        this.quad.init({
            x: - this.game.gameBg.width / 2,
            y: - this.game.gameBg.height / 2,
            width: this.game.gameBg.width,
            height: this.game.gameBg.height
        });
    },

    //四叉树插入方法
    insertQuad() {
        this.quad.clear();
        for (let key in this.enemyList) {
            let enemyX = this.enemyList[key].x;
            let enemyY = this.enemyList[key].y;
            let enemyWidth = this.enemyList[key].getChildByName('enemy').getChildByName('enemyBody').width;
            let enemyHeight = this.enemyList[key].getChildByName('enemy').getChildByName('enemyBody').height;
            this.quad.insert({
                x: enemyX - enemyWidth / 2,
                y: enemyY - enemyHeight / 2,
                width: enemyWidth,
                height: enemyHeight
            });
        }
    },

    //四叉树返回范围数组
    retrieveQuad(pos, size) {
        cc.log(pos);
        let arr = this.quad.retrieve({
            x: pos.x - (size + 300) / 2,
            y: pos.y - (size + 300) / 2,
            width: size + 300,
            height: size + 300
        });
        //cc.log(arr);
        let returnArr = new Array();
        for (let value of arr) {
            for (let key in this.enemyList) {
                let enemyX = this.enemyList[key].x;
                let enemyY = this.enemyList[key].y;
                let enemyWidth = this.enemyList[key].getChildByName('enemy').getChildByName('enemyBody').width;
                let enemyHeight = this.enemyList[key].getChildByName('enemy').getChildByName('enemyBody').height;
                if (enemyX - enemyWidth / 2 === value.x && enemyY - enemyHeight / 2 === value.y) {
                    returnArr.push(this.enemyList[key]);
                }
            }
        }

        return returnArr;
    }

});
