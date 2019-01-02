const ttConfig = require('ttConfig');
const ttRecorderMgr = require('ttRecorderMgr');

let self = null;
cc.Class({
    extends: cc.Component,

    properties: {
        bg: cc.Node,
        widget: cc.Node,
        iconBtn: cc.Node,
        funcWidget: cc.Node,
        progress: cc.Node,
        progressBarSp: cc.Sprite,
        startBtn: cc.Node,
        stopBtn: cc.Node,
        shareBtn: cc.Node,
        tip: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        self = this;
        this.initData();
        this.ttRecorderMgr = ttRecorderMgr.getInstance();
        this.ttRecorderMgr.setStateChangeCallback(function () {
            self.updateShow();
        });

        this.bg.on('click', this.toggleFuncWidget, this);
        this.iconBtn.on('click', this.toggleFuncWidget, this);
        this.startBtn.on('click', this.onStartBtnClick, this);
        this.stopBtn.on('click', this.stopRecord, this);
        this.shareBtn.on('click', this.shareVideo, this);
    },

    init () {
        let canvas = cc.find('Canvas');
        let canvasWidth = canvas.width;
        let canvasHeight = canvas.height;

        let startX = -canvasWidth / 2 + this.iconBtn.width / 2;
        let startY = canvasHeight * (ttConfig.RecorderConfig.percentHeight - 0.5);
        this.widget.setPosition(startX, startY);
        this.progress.setPosition(0, canvasHeight / 2 - this.progress.height / 2);

        this.funcWidget.active = false;
        this.iconBtn.active = false;  // 不显示悬浮窗
        this.bg.active = false;
        this.progress.active = false;

        this.tip.opacity = 0;
        this.updateShow();
    },

    initData () {
        this.giftId = null;
        this.inToggle = false;
        this.recordTimer = 0;
        this.maxTime = 0;
        this.inRecording = false;
        this.moveDelta = this.funcWidget.width;

        this.autoShare = false;
        this.inStop = false;
    },

    start () {

    },

    updateShow () {
        if (this.ttRecorderMgr.state === 1) {  // 录屏中
            // this.stopBtn.active = true;
            // this.startBtn.active = false;
            this.inRecording = true;
            // this.progress.active = false;
        } else {
            // this.stopBtn.active = false;
            // this.startBtn.active = true;
            this.inRecording = false;
            this.inStop = false;
            // this.progress.active = false;

            if (this.autoShare) {
                this.autoShare = false;
                this.shareVideo();
            }
        }

        // if (this.ttRecorderMgr.videoPath !== null && !this.inRecording) {  // 录了屏
        //     this.shareBtn.getComponent(cc.Button).interactable = true;
        // } else {
        //     this.shareBtn.getComponent(cc.Button).interactable = false;
        // }
    },

    toggleFuncWidget () {
        if (this.inToggle) return;
        this.inToggle = true;

        let isOut = this.funcWidget.active;
        if (!isOut) {
            this.funcWidget.active = true;
            this.iconBtn.active = false;
            this.bg.active = true;
        }
        
        let end = cc.callFunc(function () {
            this.inToggle = false;
            if (isOut) {
                this.funcWidget.active = false;
                this.iconBtn.active = true;
                this.bg.active = false;
            }
        }, this);

        let move = cc.sequence(
            cc.moveBy(0.5, isOut ? cc.p(-1 * this.moveDelta, 0) : cc.p(this.moveDelta, 0)),
            end
        );

        this.funcWidget.stopAllActions();
        this.funcWidget.runAction(move);
    },

    onStartBtnClick () {
        this.startRecord();
    },

    startRecord (giftId = null, duration = ttConfig.RecorderConfig.maxRecordTime, microphoneEnabled = false) {
        if (!this.inRecording) {  // 开始录制
            this.giftId = giftId;
            this.maxTime = duration;
            this.recordTimer = 0;
            this.ttRecorderMgr.startRecord(duration, microphoneEnabled);
        } else {  // 已经在录制
            // this.showTip('正在录屏中~');
        }
    },

    stopRecord () {
        if (!this.inRecording || this.inStop) return;
        this.ttRecorderMgr.stopRecord();
        this.inStop = true;
    },

    shareVideo (autoStop) {
        if (this.inRecording) {
            if (autoStop === true) {  // 自动停止录屏
                if (!this.inStop) this.stopRecord();  // 没有点过停止-先自动停止
                this.autoShare = true;
            }
            return;
        }
        if (this.recordTimer <= 3) {
            this.showTip('录屏时间至少需要3秒哦~');
            return;
        }

        this.ttRecorderMgr.shareVideo(function () {
            self.updateShow();
            if (self.ttRecorderMgr.userSuccessCb) {
                self.ttRecorderMgr.userSuccessCb();
            }
            // if (self.giftId && self.ttRecorderMgr.userSuccessCb) {
            //     self.ttRecorderMgr.userSuccessCb(self.giftId);
            // }
        }, function () {
            if (self.ttRecorderMgr.userFailCb) {
                self.ttRecorderMgr.userFailCb();
            }
            // if (self.giftId && self.ttRecorderMgr.userFailCb) {
            //     self.ttRecorderMgr.userFailCb();
            // }
        });
    },

    update (dt) {
        if (this.inRecording) {
            this.recordTimer += dt;
            // this.updateProgress();
        }
    },

    updateProgress () {
        this.progressBarSp.fillRange = this.recordTimer / this.maxTime;
    },

    showTip (str) {
        this.tip.stopAllActions();
        this.tip.opacity = 255;
        this.tip.setPosition(0, 0);
        this.tip.getChildByName('desc').getComponent(cc.Label).string = str;

        let moveUp = cc.moveBy(0.6, 0, 200).easing(cc.easeCubicActionOut());
        let delay = cc.delayTime(0.5);
        let fadeOut = cc.fadeOut(0.3);
        this.tip.runAction(cc.sequence(moveUp, delay, fadeOut));
    }
});
