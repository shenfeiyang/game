
cc.Class({
    extends: cc.Component,

    properties: {
        expEnemyPrefab: cc.Prefab
    },

    expEnemyInit(stage) {
        this.stage = stage;
        this.game = stage.game;
        this.initExpEnemyPool();

        this.addInitExpEnemy();
    },

    //创建对象池
    initExpEnemyPool() {
        //初始化对象池
        this.expEnemyPool = new cc.NodePool();
        for (let i = 0; i < this.game.expEnemyMax; i++) {
            let expEnemy = cc.instantiate(this.expEnemyPrefab);
            this.expEnemyPool.put(expEnemy);
        };
    },

    //从对象池获取对象
    createExpEnemy() {
        let expEnemy = null;
        if (this.expEnemyPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            expEnemy = this.expEnemyPool.get();
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            expEnemy = cc.instantiate(this.expEnemyPrefab);
        }
        return expEnemy;
    },

    //将对象放回对象池
    expEnemyDead(expEnemy) {
        this.expEnemyPool.put(expEnemy);
        //从数组中删除
        for (let i = 0; i < this.expEnemyList.length; i++) {
            if (expEnemy === this.expEnemyList[i]) {
                this.expEnemyList.splice(i, 1);
                return;
            }
        }
    },

    //创建初始数量经验怪
    addInitExpEnemy() {
        this.expEnemyList = new Array();
        for (let i = 0; i < this.game.expEnemyMax; i++) {
            this.addExpEnemy();
        }
    },

    //添加食物
    addExpEnemy() {
        let expEnemy = this.createExpEnemy();
        this.node.addChild(expEnemy);
        let pos = cc.v2(Math.round(Math.random() * (this.game.gameBg.width - expEnemy.width) - (this.game.gameBg.width / 2 - expEnemy.width / 2)), Math.round(Math.random() * (this.game.gameBg.height - expEnemy.width) - (this.game.gameBg.height / 2 - expEnemy.width / 2)));
        expEnemy.setPosition(pos);
        expEnemy.angle = Math.round(Math.random() * 360);
        expEnemy.liveTime = 0;
        expEnemy.speed = 2;
        this.expEnemyList.push(expEnemy);
    },

    //随机方向
    randDir(expEnemy) {
        expEnemy.runAction(cc.rotateTo(0.2, this.stage.food.getNearFood(expEnemy)));
    },

    //朝着当前方向前进
    walk(expEnemy) {
        if (expEnemy.x > (this.game.gameBg.width / 2 - expEnemy.width / 2)){
            expEnemy.x = (this.game.gameBg.width / 2 - expEnemy.width / 2);
            expEnemy.angle = expEnemy.angle > 180 ? expEnemy.angle - 180 : expEnemy.angle + 180;
            return;
        } 
        if (expEnemy.x < - (this.game.gameBg.width / 2 - expEnemy.width / 2)){
            expEnemy.x = -(this.game.gameBg.width / 2 - expEnemy.width / 2);
            expEnemy.angle = expEnemy.angle > 180 ? expEnemy.angle - 180 : expEnemy.angle + 180;
            return;
        } 
        if (expEnemy.y > (this.game.gameBg.height / 2 - expEnemy.width / 2)){
            expEnemy.y = (this.game.gameBg.height / 2 - expEnemy.width / 2);
            expEnemy.angle = expEnemy.angle > 180 ? expEnemy.angle - 180 : expEnemy.angle + 180;
            return;
        } 
        if (expEnemy.y < -(this.game.gameBg.height / 2 - expEnemy.width / 2)){
            expEnemy.y = -(this.game.gameBg.height / 2 - expEnemy.width / 2);
            expEnemy.angle = expEnemy.angle > 180 ? expEnemy.angle - 180 : expEnemy.angle + 180;
            return;
        } 
        expEnemy.x += Math.cos((expEnemy.angle - 90) * Math.PI / 180) * expEnemy.speed;
        expEnemy.y += Math.sin((expEnemy.angle - 90) * Math.PI / 180) * expEnemy.speed;
    }
});
