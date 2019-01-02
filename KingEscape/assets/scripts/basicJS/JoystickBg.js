import { TouchType, DirectionType } from './JoystickCommon';

cc.Class({
    extends: cc.Component,

    properties: {
        dot: {
            default: null,
            type: cc.Node,
            displayName: '摇杆节点'
        },

        _joyCom: {
            default: null,
            displayName: 'joy com'
        },

        _angle: {
            default: null,
            displayName: '当前触摸角度'
        },

        _radian: {
            default: null,
            displayName: '弧度'
        },

        _direction: {
            default: null,
            displayName: '方向'
        }
    },

    onLoad() {
        //实际速度
        this._speed = 0;
        //joy下的Game组件
        this._joyCom = this.node.parent.getComponent('Joystick');

        if (this._joyCom.touchType == TouchType.DEFAULT) {
            //对圆圈的监听
            this._initTouchEvent();
        }
    },

    _initTouchEvent() {
        let self = this;
        //监听触摸
        self.node.on(cc.Node.EventType.TOUCH_START, self._touchStartEvent, self);
        self.node.on(cc.Node.EventType.TOUCH_MOVE, self._touchMoveEvent, self);
        //离开触摸弹回
        self.node.on(cc.Node.EventType.TOUCH_CANCEL, self._touchEndEvent, self);
        self.node.on(cc.Node.EventType.TOUCH_END, self._touchEndEvent, self);
    },

    update(dt) {
        switch (this._joyCom.directionType) {
            case DirectionType.FOUR:
                this._fourDirection();
                break;
            case DirectionType.EIGHT:
                this._eightDirectionsMove();
                break;
            case DirectionType.ALL:
                this._allDirectionsMove();
                break;
            default:
                break;
        }

    },

    //四个方向移动
    _fourDirection() {
        if (this._joyCom.stage.moveAllow) {
            if (this._angle > 45 && this._angle < 135) {
                this._joyCom.stage.changePlayerPosY(this._speed);
            } else if (this._angle > -135 && this._angle < -45) {
                this._joyCom.stage.changePlayerPosY(-this._speed);
            } else if (this._angle < -135 && this._angle > -180 || this._angle > 135 && this._angle < 180) {
                this._joyCom.stage.changePlayerPosX(-this._speed);
            } else if (this._angle < 0 && this._angle > -45 || this._angle > 0 && this._angle < 45) {
                this._joyCom.stage.changePlayerPosX(this._speed);
            }
        }
    },

    //八个方向移动
    _eightDirectionsMove() {
        if (this._joyCom.stage.moveAllow) {
            if (this._angle > 67.5 && this._angle < 112.5) {
                this._joyCom.stage.changePlayerPosY(this._speed);
            } else if (this._angle > -112.5 && this._angle < -67.5) {
                this._joyCom.stage.changePlayerPosY(-this._speed);
            } else if (this._angle < -157.5 && this._angle > -180 || this._angle > 157.5 && this._angle < 180) {
                this._joyCom.stage.changePlayerPosX(-this._speed);
            } else if (this._angle < 0 && this._angle > -22.5 || this._angle > 0 && this._angle < 22.5) {
                this._joyCom.stage.changePlayerPosX(this._speed);
            } else if (this._angle > 112.5 && this._angle < 157.5) {
                this._joyCom.stage.changePlayerPosX(-this._speed / 1.414);
                this._joyCom.stage.changePlayerPosY(this._speed / 1.414);
            } else if (this._angle > 22.5 && this._angle < 67.5) {
                this._joyCom.stage.changePlayerPosX(this._speed / 1.414);
                this._joyCom.stage.changePlayerPosY(this._speed / 1.414);
            } else if (this._angle > -157.5 && this._angle < -112.5) {
                this._joyCom.stage.changePlayerPosX(-this._speed / 1.414);
                this._joyCom.stage.changePlayerPosY(-this._speed / 1.414);
            } else if (this._angle > -67.5 && this._angle < -22.5) {
                this._joyCom.stage.changePlayerPosX(this._speed / 1.414);
                this._joyCom.stage.changePlayerPosY(-this._speed / 1.414);
            }
        }
    },

    //全方向移动
    _allDirectionsMove() {
        if (this._joyCom.stage.isPlayerQuick) {
            this._joyCom.stage.changePlayerPosX(Math.cos(this._angle * (Math.PI / 180)) * this._speed * this._joyCom.stage.game.speedRate);
            this._joyCom.stage.changePlayerPosY(Math.sin(this._angle * (Math.PI / 180)) * this._speed * this._joyCom.stage.game.speedRate);
        } else {
            this._joyCom.stage.changePlayerPosX(Math.cos(this._angle * (Math.PI / 180)) * this._speed);
            this._joyCom.stage.changePlayerPosY(Math.sin(this._angle * (Math.PI / 180)) * this._speed);
        }

        if (this._speed > 0) {
            //检测食物碰撞
            this._joyCom.stage.playerEatFoodCheck();
        }
    },

    //计算两点间的距离并返回
    _getDistance(pos1, pos2) {
        return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
    },

    //计算弧度
    _getRadian(point) {
        this._radian = Math.PI / 180 * this._getAngle(point);
        return this._radian;
    },

    //计算角度
    _getAngle(point) {
        let pos = this.node.getPosition();
        this._angle = Math.atan2(point.y - pos.y, point.x - pos.x) * (180 / Math.PI);
        return this._angle;
    },

    //设置实际速度
    _setSpeed() {
        this._speed = this._joyCom.stage.moveSpeed;
    },

    _touchStartEvent(event) {
        if (this._joyCom.game.gameState !== 'game' || !this._joyCom.stage.player.node.active) return;
        //获取触摸位置的世界坐标转换成圆圈的相对坐标
        let touchPos = this.node.convertToNodeSpaceAR(event.getLocation());
        //触摸点与圆圈中心的距离
        let distance = cc.v2(touchPos.x, touchPos.y).sub(cc.v2(0, 0)).mag();
        //圆圈半径
        let radius = this.node.width / 2;
        let posX = this.node.x + touchPos.x;
        let posY = this.node.y + touchPos.y;
        //手指在圆圈内触摸，控杆跟随触摸点
        if (radius > distance) {
            this.dot.setPosition(cc.v2(posX, posY));
            return true;
        }
        return false;
    },

    _touchMoveEvent(event) {
        if (this._joyCom.game.gameState !== 'game' || !this._joyCom.stage.player.node.active) return;
        //获取触摸位置的世界坐标转换成圆圈的相对坐标
        let touchPos = this.node.convertToNodeSpaceAR(event.getLocation());
        //触摸点与圆圈中心的距离
        let distance = cc.v2(touchPos.x, touchPos.y).sub(cc.v2(0, 0)).mag();
        //圆圈半径
        let radius = this.node.width / 2;
        let posX = this.node.x + touchPos.x;
        let posY = this.node.y + touchPos.y;
        //手指在圆圈内触摸，控杆跟随触摸点
        if (radius > distance) {
            this.dot.setPosition(cc.v2(posX, posY));
        } else {
            //将控杆永远保持在圈内，并在圈内跟随触摸更新角度
            let x = this.node.x + Math.cos(this._getRadian(cc.v2(posX, posY))) * radius;
            let y = this.node.y + Math.sin(this._getRadian(cc.v2(posX, posY))) * radius;
            this.dot.setPosition(cc.v2(x, y));
        }
        //更新角度
        this._getAngle(cc.v2(posX, posY));
        //设置实际速度
        this._setSpeed();
    },

    _touchEndEvent() {
        this.dot.setPosition(this.node.getPosition());
        this._speed = 0;
    }
});
