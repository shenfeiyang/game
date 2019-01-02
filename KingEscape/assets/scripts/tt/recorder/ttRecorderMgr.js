const STATE_RECORDING = 1;
const STATE_STOP = -1;

let self = null;
let ttRecorderMgr = cc.Class({
    statics: {
        instance: null,
        getInstance: function() {
            if (ttRecorderMgr.instance == null) {
                ttRecorderMgr.instance = new ttRecorderMgr();
            }
            return ttRecorderMgr.instance;
        }
    },

    ctor () {
        self = this;
        this.initData();
        this.initRecorder();
    },

    initData () {
        this.state = STATE_STOP;
        this.videoPath = null;
        this.userSuccessCb = null;
        this.userFailCb = null;
        this.stateChangeCb = null;
    },

    initRecorder () {
        if (cc.sys.platform !== cc.sys.WECHAT_GAME) return;
        let GameRecorderManager = tt.getGameRecorderManager();

        GameRecorderManager.onStart(function () {
            console.log('>>> start to recorder');
            self.updateState(STATE_RECORDING);
        });

        GameRecorderManager.onStop(function (res) {
            console.log('>>> stop recorder');
            self.videoPath = res.videoPath;
            self.updateState(STATE_STOP);
        });

        GameRecorderManager.onError(function (res) {
            console.log('>>> get recorder error', res);
            self.updateState(STATE_STOP);
        });

        GameRecorderManager.onInterrupted(function (res) {
            console.log('>>> get recorder interrupted', res);
            self.videoPath = res.videoPath;
            self.updateState(STATE_STOP);
        });
    },

    updateState (state) {
        this.state = state;
        if (this.stateChangeCb && typeof this.stateChangeCb === 'function') {
            this.stateChangeCb();
        }
    },

    setShareVideoCallback (success, fail) {
        this.userSuccessCb = success;
        this.userFailCb = fail;
    },

    setStateChangeCallback (callback) {
        this.stateChangeCb = callback;
    },

    startRecord (duration, microphoneEnabled) {
        if (cc.sys.platform !== cc.sys.WECHAT_GAME) return;
        let GameRecorderManager = tt.getGameRecorderManager();
        GameRecorderManager.start({duration: duration, microphoneEnabled: microphoneEnabled});
    },

    stopRecord () {
        if (cc.sys.platform !== cc.sys.WECHAT_GAME) return;
        let GameRecorderManager = tt.getGameRecorderManager();
        GameRecorderManager.stop();
    },

    shareVideo (success, fail) {
        if (cc.sys.platform !== cc.sys.WECHAT_GAME || !this.videoPath) return;
        console.log('>>> video path:', this.videoPath);
        tt.shareVideo({
            videoPath: this.videoPath,
            success () {
                self.videoPath = null;
                console.log('>>> share tt video success');
                if (success && typeof success === 'function') {
                    success();
                }
            },
            fail (e) {
                console.log('>>> share tt video failed', e);
                if (fail && typeof fail === 'function') {
                    fail();
                }
            }
        });
    },
});
