const ttConfig = require('ttConfig');
const ttRecorderMgr = require('ttRecorderMgr');

let self = null;
let ttAddLayer = cc.Class({
    extends: cc.Component,
    properties: {

    },

    onLoad() {
        self = this;
        this.ttRecorderMgr = ttRecorderMgr.getInstance();
        if (ttConfig.showRecorder) {
            this.showRecorderIcon();
        }
    },

    // start () {

    // },

    /**
     * 设置录屏分享回调
     * @param {*} success 
     * @param {*} fail 
     */
    setShareVideoCallback(success, fail) {
        this.ttRecorderMgr.setShareVideoCallback(success, fail);
    },

    /**
     * 开始录屏 - 如果录屏中调用会继续当前的录制
     */
    startRecord(giftId, duration, microphoneEnabled) {
        if (this.ttRecorderMgr.recorderNode) {
            let recorder = this.ttRecorderMgr.recorderNode.getComponent('recorderNode');
            giftId = giftId ? giftId : ttConfig.GiftDefine.ShareGift;
            recorder.startRecord(giftId, duration, microphoneEnabled);
        }
    },

    /**
     *  结束录屏
     */
    stopRecord() {
        if (this.ttRecorderMgr.recorderNode) {
            let recorder = this.ttRecorderMgr.recorderNode.getComponent('recorderNode');
            recorder.stopRecord();
        }
    },

    /**
     * 分享录屏
     * @param {*} autoStop 是否自动停止 
     */
    shareVideo(autoStop = true) {
        if (this.ttRecorderMgr.recorderNode) {
            let recorder = this.ttRecorderMgr.recorderNode.getComponent('recorderNode');
            recorder.shareVideo(autoStop);
        }
    },

    /**
     * 显示录屏悬浮窗按钮(默认不显示)
     */
    showRecorderIcon() {
        // let func = function () {
        //     self.ttRecorderMgr.recorderNode.active = isShow;
        //     if (isShow) {
        //         self.ttRecorderMgr.recorderNode.getComponent('recorderNode').updateShow();
        //     }
        // };

        if (!this.ttRecorderMgr.recorderNode) {
            cc.loader.loadRes('tt/recorder/recorderNode', cc.Prefab, function (err, prefab) {
                if (err) {
                    console.error(err)
                    return;
                }
                let widget = cc.instantiate(prefab);
                self.node.parent.addChild(widget, 10);
                widget.setPosition(self.node.position);
                widget.getComponent('recorderNode').init();
                cc.game.addPersistRootNode(widget);
                self.ttRecorderMgr.recorderNode = widget;
            });
        }
    }
});