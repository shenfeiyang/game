import Quadtree from './QuadTree';
cc.Class({
    extends: cc.Component,

    properties: {
        foodPrefab: cc.Prefab,
        foodSpriteFrame: [cc.SpriteFrame]
    },

    foodInit(stage) {
        this.stage = stage;
        this.game = stage.game;
        this.player = this.stage.player;
        this.initFoodPool();

        //创建初始数量食物
        this.addInitFood();
    },

    //创建对象池
    initFoodPool() {
        //初始化对象池
        this.foodPool = new cc.NodePool();
        for (let i = 0; i < this.game.foodMax; i++) {
            let food = cc.instantiate(this.foodPrefab);
            this.foodPool.put(food);
        };

        //初始化四叉树
        this.quad = new Quadtree();
        this.quad.init({
            x: -this.game.gameBg.width / 2 + 50,
            y: -this.game.gameBg.height / 2 + 100,
            width: this.game.gameBg.width - 100,
            height: this.game.gameBg.height - 200
        });
    },

    //从对象池获取对象
    createFood() {
        let food = null;
        if (this.foodPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            food = this.foodPool.get();
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            food = cc.instantiate(this.foodPrefab);
        }
        return food;
    },

    //将对象放回对象池
    foodEatOff(food) {
        this.foodPool.put(food);

        //清除四叉树
        this.quad.clear();
        //将对象从数组中删除
        let arr = new Array();
        for (let key in this.foodList) {
            if (this.foodList[key] !== food) {
                //更新数组
                arr[key] = this.foodList[key];
                //更新四叉树
                let foodX = this.foodList[key].x;
                let foodY = this.foodList[key].y;
                let foodWidth = this.foodList[key].width;
                let foodHeight = this.foodList[key].height;
                this.quad.insert({
                    x: foodX - foodWidth / 2,
                    y: foodY - foodHeight / 2,
                    width: foodWidth,
                    height: foodHeight
                });
            }
        }

        this.foodList = arr;
    },

    //食物被吃掉优化处理
    foodEated(food) {
        //将对象从数组中删除
        let arr = new Array();
        for (let key in this.foodList) {
            if (this.foodList[key] !== food) {
                //更新数组
                arr[key] = this.foodList[key];
            }
        }
        this.foodList = arr;

        //食物属性随机变换
        let pos = cc.v2(Math.round(Math.random() * (this.game.gameBg.width - 100) - (this.game.gameBg.width / 2 - 50)), Math.round(Math.random() * (this.game.gameBg.height - 200) - (this.game.gameBg.height / 2 - 100)));
        food.setPosition(pos);
        food.color = this.randColor();
        food.angle = Math.round(Math.random() * 360);
        this.foodList[(pos.x - food.width / 2) + '_' + (pos.y - food.width / 2)] = food;
        
        //更新四叉树
        this.quad.clear();
        for (let key in this.foodList) {
            let foodX = this.foodList[key].x;
            let foodY = this.foodList[key].y;
            let foodWidth = this.foodList[key].width;
            let foodHeight = this.foodList[key].height;
            this.quad.insert({
                x: foodX - foodWidth / 2,
                y: foodY - foodHeight / 2,
                width: foodWidth,
                height: foodHeight
            });
        }
    },

    //创建初始数量食物
    addInitFood() {
        this.foodList = new Array();
        for (let i = 0; i < this.game.foodMax; i++) {
            this.addFood(false);
        }
    },

    //随机颜色
    randColor() {
        let color;
        switch (Math.floor(Math.random() * 12)) {
            case 0:
                color = cc.color(134, 129, 255, 255);
                break;
            case 1:
                color = cc.color(250, 184, 255, 255);
                break;
            case 2:
                color = cc.color(159, 33, 203, 255);
                break;
            case 3:
                color = cc.color(151, 246, 248, 255);
                break;
            case 4:
                color = cc.color(240, 240, 247, 255);
                break;
            case 5:
                color = cc.color(242, 58, 238, 255);
                break;
            case 6:
                color = cc.color(134, 129, 255, 255);
                break;
            case 7:
                color = cc.color(241, 89, 79, 255);
                break;
            case 8:
                color = cc.color(214, 239, 70, 255);
                break;
            case 9:
                color = cc.color(55, 9, 255, 255);
                break;
            case 10:
                color = cc.color(255, 175, 38, 255);
                break;
            case 11:
                color = cc.color(94, 250, 0, 255);
                break;
        }
        return color;
    },

    //添加食物
    addFood(flag, circlePos = null, foodSize = null) {
        let food = this.createFood();
        this.node.addChild(food);
        let pos = cc.v2(Math.round(Math.random() * (this.game.gameBg.width - 100) - (this.game.gameBg.width / 2 - 50)), Math.round(Math.random() * (this.game.gameBg.height - 200) - (this.game.gameBg.height / 2 - 100)));
        if (circlePos == null) {
            pos = cc.v2(Math.round(Math.random() * (this.game.gameBg.width - 100) - (this.game.gameBg.width / 2 - 50)), Math.round(Math.random() * (this.game.gameBg.height - 200) - (this.game.gameBg.height / 2 - 100)));
        } else {
            pos = cc.v2(Math.round(Math.random() * 80 - 40) + circlePos.x, Math.round(Math.random() * 80 - 40) + circlePos.y);
        }
        food.setPosition(pos);
        let sp = this.foodSpriteFrame[Math.floor(Math.random() * this.foodSpriteFrame.length)];
        food.getComponent(cc.Sprite).spriteFrame = sp;
        let size;
        if (foodSize == null) {
            size = Math.floor(Math.random() * 3) * 5 + 10;
        } else {
            size = foodSize;
        }
        food.setContentSize(size, size);
        food.color = this.randColor();
        food.angle = Math.round(Math.random() * 360);

        this.foodList[(pos.x - size / 2) + '_' + (pos.y - size / 2)] = food;
        if (flag) {
            this.quad.clear();
            for (let key in this.foodList) {
                let foodX = this.foodList[key].x;
                let foodY = this.foodList[key].y;
                let foodWidth = this.foodList[key].width;
                let foodHeight = this.foodList[key].height;
                this.quad.insert({
                    x: foodX - foodWidth / 2,
                    y: foodY - foodHeight / 2,
                    width: foodWidth,
                    height: foodHeight
                });
            }
        } else {
            this.quad.insert({
                x: pos.x - size / 2,
                y: pos.y - size / 2,
                width: size,
                height: size
            });
        }
    },

    //获得最近的食物
    getNearFood(enemy) {
        // let arr = this.quad.retrieve({
        //     x: enemy.x - (enemy.width + 200) / 2,
        //     y: enemy.y - (enemy.height + 200) / 2,
        //     width: enemy.width + 200,
        //     height: enemy.height + 200
        // });
        // let minDis = 9999;
        // let minIndex;
        // if (arr.length > 0) {
        //     for (let i = 0; i < arr.length; i++) {
        //         let arrIndex = arr[i].x + '_' + arr[i].y;
        //         if (enemy.getPosition().sub(this.foodList[arrIndex].getPosition()).mag() <= minDis) {
        //             minDis = enemy.getPosition().sub(this.foodList[arrIndex].getPosition()).mag();
        //             minIndex = arrIndex;
        //         }
        //     }
        // } else {
        let arr = this.quad.retrieve({
            x: -this.game.gameBg.width / 2 + 50,
            y: -this.game.gameBg.height / 2 + 100,
            width: this.game.gameBg.width - 100,
            height: this.game.gameBg.height - 200
        });
        let randIndex = parseInt(Math.random() * arr.length);
        let minIndex = arr[randIndex].x + '_' + arr[randIndex].y;
        //}

        let pos1 = this.foodList[minIndex].parent.convertToWorldSpaceAR(this.foodList[minIndex].getPosition());
        let pos2 = enemy.parent.convertToWorldSpaceAR(enemy.getPosition());
        let angle = Math.atan2(pos1.y - pos2.y, pos1.x - pos2.x) * (180 / Math.PI);
        return angle - 90;
    },

    //获得当前食物数量
    getFoodNum() {
        let arr = this.quad.retrieve({
            x: -this.game.gameBg.width / 2 + 50,
            y: -this.game.gameBg.height / 2 + 100,
            width: this.game.gameBg.width - 100,
            height: this.game.gameBg.height - 200
        });
        return arr.length;
    }
});


