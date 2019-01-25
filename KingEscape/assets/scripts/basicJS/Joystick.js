import { TouchType, DirectionType } from './JoystickCommon';
import JoystickBg from './JoystickBg';

cc.Class({
    extends: cc.Component,

    properties: {
        ring: {
            default: null,
            type: JoystickBg,
            displayName: '摇杆节点背景'
        },
        dot: {
            default: null,
            type: cc.Node,
            displayName: '摇杆节点'
        },
        stickX: {
            default: 0,
            displayName: '摇杆X位置'
        },
        stickY: {
            default: 0,
            displayName: '摇杆Y位置'
        },
        touchType: {
            default: TouchType.DEFAULT,
            type: TouchType,
            displayName: '触摸类型'
        },
        directionType: {
            default: DirectionType.ALL,
            type: DirectionType,
            displayName: '方向类型'
        },

        _stickPos: {
            default: null,
            type: cc.Node,
            displayName: '遥感当前位置'
        },
        _touchLocation: {
            default: null,
            type: cc.Node,
            displayName: '触摸当前位置'
        }
    },

    joystickInit(stage) {
        this.stage = stage;
        this.game = stage.game;
    },

    onLoad() {
        this._createStickSprite();
        //当触摸类型为FOLLOW会在此对圆圈的触摸监听
        if (this.touchType === TouchType.FOLLOW) {
            this._initTouchEvent();
        }
    },

    _createStickSprite() {
        //调整摇杆的位置
        this.ring.node.setPosition(cc.v2(this.stickX, this.stickY));
        this.dot.setPosition(cc.v2(this.stickX, this.stickY));
    },

    _initTouchEvent() {
        let self = this;
        self.node.on(cc.Node.EventType.TOUCH_START, self._touchStartEvent, self);
        self.node.on(cc.Node.EventType.TOUCH_MOVE, self._touchMoveEvent, self);
        //触摸在圆圈内离开或在圆圈外离开后，摇杆归位，player速度为0
        self.node.on(cc.Node.EventType.TOUCH_END, self._touchEndEvent, self);
        self.node.on(cc.Node.EventType.TOUCH_CANCEL, self._touchEndEvent, self);
    },

    _touchStartEvent(event) {
        if (this.game.gameState !== 'game' || !this.stage.player.node.active) return;        
        this.dot.color = cc.color(98, 165, 254, 255);
        this.ring.node.getChildByName('jiantou1').active = true;
        this.ring.node.getChildByName('jiantou2').active = true;
        this.ring.node.getChildByName('jiantou3').active = true;
        this.ring.node.getChildByName('jiantou4').active = true;
        //记录触摸的世界坐标，给touch move使用
        this._touchLocation = event.getLocation();
        let touchPos = this.node.convertToNodeSpaceAR(event.getLocation());
        //更改摇杆的位置
        this.ring.node.setPosition(touchPos);
        this.dot.setPosition(touchPos);
        //记录摇杆位置，给touch move使用
        this._stickPos = touchPos;
    },

    _touchMoveEvent(event) {
        if (this.game.gameState !== 'game' || !this.stage.player.node.active) return;
        // 如果touch start位置和touch move相同，禁止移动
        if (this._touchLocation.x == event.getLocation().x && this._touchLocation.y == event.getLocation().y) {
            return false;
        }
        // 以圆圈为锚点获取触摸坐标
        var touchPos = this.ring.node.convertToNodeSpaceAR(event.getLocation());
        var distance = this.ring._getDistance(touchPos, cc.v2(0, 0));
        var radius = this.ring.node.width / 2;

        // 由于摇杆的postion是以父节点为锚点，所以定位要加上touch start时的位置
        var posX = this._stickPos.x + touchPos.x;
        var posY = this._stickPos.y + touchPos.y;
        if (radius > distance) {
            this.dot.setPosition(cc.v2(posX, posY));
        } else {
            //控杆永远保持在圈内，并在圈内跟随触摸更新角度
            var x = this._stickPos.x + Math.cos(this.ring._getRadian(cc.v2(posX, posY))) * radius;
            var y = this._stickPos.y + Math.sin(this.ring._getRadian(cc.v2(posX, posY))) * radius;
            this.dot.setPosition(cc.v2(x, y));
        }
        //更新角度
        this.ring._getAngle(cc.v2(posX, posY));
        //更新玩家朝向
        this.stage.changePlayerDirection(this.ring._angle);
        //设置实际速度
        this.ring._setSpeed();
    },

    _touchEndEvent() {
        this.dot.color = cc.color(71, 38, 168, 255);
        this.ring.node.getChildByName('jiantou1').active = false;
        this.ring.node.getChildByName('jiantou2').active = false;
        this.ring.node.getChildByName('jiantou3').active = false;
        this.ring.node.getChildByName('jiantou4').active = false;

        this.ring.node.setPosition(cc.v2(this.stickX, this.stickY));
        this.dot.setPosition(cc.v2(this.stickX, this.stickY));
        this.ring._speed = 0;
    },

});
