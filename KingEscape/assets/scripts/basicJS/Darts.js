
cc.Class({
    extends: cc.Component,

    properties: {
        dartSpine: sp.SkeletonData
    },

    onLoad() {
        this.dartList = [];
    },

    addPlayerDart(x, y, angle, scale, range, speed) {
        this.playerDart = new cc.Node();
        let sk = this.playerDart.addComponent(sp.Skeleton);
        sk.skeletonData = this.dartSpine;
        this.node.addChild(this.playerDart);
        sk.setAnimation(0, 'animation', true);
        this.playerDart.setPosition(cc.v2(x, y));
        this.playerDart.scaleX = this.playerDart.scaleY = scale;
        this.playerDart.angle = angle + 90;

        let moveX = Math.cos((angle + 90) * Math.PI / 180) * range;
        let moveY = Math.sin((angle + 90) * Math.PI / 180) * range;
        let action1 = cc.moveTo(speed, cc.v2(this.playerDart.x + moveX, this.playerDart.y + moveY));
        let action2 = cc.delayTime(0.1);
        let action3 = cc.callFunc(this.removePlayerDart, this, this.playerDart);
        this.playerDart.runAction(cc.sequence(action1, action2, action3));
    },

    addEnemyDart(x, y, angle, scale, range, speed, enemy) {
        enemy.isCanDart = false;

        let node = new cc.Node();
        let sk = node.addComponent(sp.Skeleton);
        sk.skeletonData = this.dartSpine;
        this.node.addChild(node);
        sk.setAnimation(0, 'animation', true);
        node.setPosition(cc.v2(x, y));
        node.scaleX = node.scaleY = scale;
        node.angle = angle + 90;
        node.owner = enemy;

        let moveX = Math.cos((angle + 90) * Math.PI / 180) * range;
        let moveY = Math.sin((angle + 90) * Math.PI / 180) * range;
        let action1 = cc.moveTo(speed, cc.v2(node.x + moveX, node.y + moveY));
        let action2 = cc.delayTime(0.1);
        let action3 = cc.callFunc(this.removeEnemyDart, this, node);
        node.runAction(cc.sequence(action1, action2, action3));

        this.dartList.push(node);
    },

    removePlayerDart(node) {
        this.node.removeChild(node);
        this.playerDart = null;
    },

    removeEnemyDart(node) {
        node.owner.isCanDart = true;

        this.node.removeChild(node);
        for (let i = 0; i < this.dartList.length; i++) {
            if (this.dartList[i] === node) {
                this.dartList.splice(i, 1);
                return;
            }
        }
    }
});
