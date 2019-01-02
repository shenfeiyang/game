const DoTweenType = require('dotweendefine').DoTweenType;
const ScrollAnimation = require('dotweendefine').ScrollAnimation;

var DoTweenManager = cc.Class({

    statics: {
        instance: null,
        getInstance: function () {
            if (DoTweenManager.instance == null) {
                DoTweenManager.instance = new DoTweenManager();
            }
            return DoTweenManager.instance;
        }
    },

    ctor: function () {

    },

    /// for slot


    /// for scrollview

    /**
     * 播放scrollview增加或删除动画
     * @param {Number} type 
     * @param {Node} node 
     * @param {Number} duration 
     * @param {Function} callback 
     */
    playScrollAnimation: function (type, node, duration, callback) {
        switch (type) {
            case ScrollAnimation.MoveRightOut:
                this.moveRightOut(node, duration, callback);
                break;
            case ScrollAnimation.MoveLeftOut:
                this.moveLeftOut(node, duration, callback);
                break;
            case ScrollAnimation.MoveUpOut:
                this.moveUpOut(node, duration, callback);
                break;
            case ScrollAnimation.MoveDownOut:
                this.moveDownOut(node, duration, callback);
                break;
            case ScrollAnimation.MoveRightIn:
                this.moveRightIn(node, duration, callback);
                break;
            default:
                break;
        }
    },

    moveRightOut: function (node, duration, callback) {
        let delta = 10;
        let action = cc.moveBy(duration, node.width + delta, 0);
        this.executeAction(node, action, cc.easeIn(2), DoTweenType.MoveRightOut, callback);
    },

    moveRightIn: function (node, duration, callback) {
        let delta = 10;
        let distance = node.width + delta;
        node.x -= distance;
        let action = cc.moveBy(duration, distance, 0);
        this.executeAction(node, action, cc.easeIn(2), DoTweenType.MoveRightIn, callback);
    },

    moveLeftOut: function (node, duration, callback) {
        let delta = 10;
        let action = cc.moveBy(duration, -node.width - delta, 0);
        this.executeAction(node, action, cc.easeIn(2), DoTweenType.MoveLeftOut, callback);
    },

    moveUpOut: function (node, duration, callback) {
        let delta = 10;
        let action = cc.moveBy(duration, 0, node.height + delta);
        this.executeAction(node, action, cc.easeIn(2), DoTweenType.MoveUpOut, callback);
    },

    moveDownOut: function (node, duration, callback) {
        let delta = 10;
        let action = cc.moveBy(duration, 0, -node.height - delta);
        this.executeAction(node, action, cc.easeIn(2), DoTweenType.MoveDownOut, callback);
    },

    moveListUp: function (nodes, duration, distance, callback) {
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            if (i != nodes.length - 1) {
                this.moveUp(node, duration, distance);
            } else {
                this.moveUp(node, duration, distance, callback);
            }
        }
    },

    moveListLeft: function (nodes, duration, distance, callback) {
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            if (i != nodes.length - 1) {
                this.moveLeft(node, duration, distance);
            } else {
                this.moveLeft(node, duration, distance, callback);
            }
        }
    },

    moveUp: function (node, duration, distance, callback) {
        let action = cc.moveBy(duration, 0, distance);
        this.executeAction(node, action, null, DoTweenType.MoveUp, callback);
    },

    moveLeft: function (node, duration, distance, callback) {
        let action = cc.moveBy(duration, distance, 0);
        this.executeAction(node, action, null, DoTweenType.MoveUp, callback);
    },

    /// 通用动作
    popUpModelWnd: function (node, tag, callback) {
        let scaleFrom = cc.v2(0, 0);
        let scaleBig = cc.v2(1.1, 1.1);
        let scaleSmall = cc.v2(0.9, 0.9);
        let scaleTo = cc.v2(1, 1);

        node.scaleX = scaleFrom.x;
        node.scaleY = scaleFrom.y;
        let action = cc.sequence(
            cc.scaleTo(0.2, scaleBig.x, scaleBig.y),
            cc.scaleTo(0.2, scaleSmall.x, scaleSmall.y),
            cc.scaleTo(0.2, scaleTo.x, scaleTo.y),
        );
        
        this.executeAction(node, action, cc.easeIn(1), tag, callback);
    },

    removePopUpModelWnd: function (node, tag, callback) {
        let nodes = [node];
        this.scaleToPointFast(nodes, tag, callback);
    },

    rotateForever: function (node, duration) {
        let action = cc.repeatForever(
            cc.rotateBy(duration, 360)
        );
        this.executeAction(node, action);
    },

    showResourceDisPlay: function (node, tag, callback) {
        let targetPos = node.getPosition();
        node.y += 200;
        let action = cc.moveTo(0.5, targetPos);
        this.executeAction(node, action, cc.easeBackOut(), tag, callback);
    },


    twist: function (node, tag, callback) {
        let scaleFrom = cc.v2(0.9, 1.1);
        let scaleTo = cc.v2(1.1, 0.9);
        let duration = 0.5;
        let action = cc.sequence(
            cc.scaleTo(duration, scaleFrom.x, scaleFrom.y),
            cc.scaleTo(duration, scaleTo.x, scaleTo.y),
            cc.scaleTo(duration, 1, 1)
        );
        this.executeAction(node, action, cc.easeIn(1), tag, callback);
    },

    // 果冻效果
    jellyEffect: function (node) {
        let scale1 = cc.v2(0.9, 1.1);
        let scale2 = cc.v2(1.1, 0.9);

        let action = cc.repeatForever(
            cc.sequence(
                // cc.scaleTo(0.5, scale1.x, scale1.y).easing(cc.easeCubicActionOut()),
                // cc.scaleTo(0.5, scale2.x, scale2.y).easing(cc.easeCubicActionOut())
                cc.scaleTo(0.5, scale1.x, scale1.y),
                cc.scaleTo(0.5, scale2.x, scale2.y)
            )
        );
        this.executeAction(node, action, cc.easeQuarticActionOut());
    },

    /// move to be a point
    scaleToPointFast: function (nodes, tag, callback) {
        let duration = 0.2;
        this.scaleToPoint(nodes, duration, tag, callback);
    },

    scaleToPointSlow: function (nodes, tag, callback) {
        let duration = 0.3;
        this.scaleToPoint(nodes, duration, tag, callback);
    },

    scaleToPoint: function (nodes, duration, tag, callback) {
        let scaleTo = cc.v2(0, 0);
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            let action = cc.scaleTo(duration, scaleTo.x, scaleTo.y);

            if (i != nodes.length - 1) {
                this.executeAction(node, action, cc.easeBackIn(), tag);
            } else {
                this.executeAction(node, action, cc.easeBackIn(), tag, callback);
            }
        }
    },

    /// 低阶借口
    // 添加动作结束回调
    addCallback: function (action, callback) {
        // let callback = callback.callback;
        // let target = callback.target;
        // let opt = callback.opt;

        // let finished = cc.callFunc(callback, target, opt);
        let seq = cc.sequence(action, callback);
        return seq;
    },

    // 设置缓动动作
    setEaseAction: function (action, easeType) {
        if (!!easeType) {
            action.easing(easeType);
        }
    },

    // 设置动作标签
    setActionTag: function (action, tag) {
        if (!!tag) {
            action.setTag(tag);
        }
    },

    // 根据标签获取动作
    getAction: function (node, tag) {
        return node.getActionByTag(tag);
    },

    // 动作是否结束
    isActionDone: function (node, tag) {
        let action = this.getAction(node, tag);
        if (action == null) {
            return true;
        }
        return action.isDone();
    },

    /**
     * 执行动作，可添加缓动动作，标签和回调
     * @param {Node} node 
     * @param {ActionInterval} action 
     * @param {Object} easeType 
     * @param {Number} tag 
     * @param {ActionInstant} callback 
     */
    executeAction: function (node, action, easeType, tag, callback) {
        this.setEaseAction(action, easeType);
        this.setActionTag(action, tag);
        if (!!callback) {
            action = this.addCallback(action, callback);
        }
        node.runAction(action);
    }
});
