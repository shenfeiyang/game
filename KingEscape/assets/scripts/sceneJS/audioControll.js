//场景传值
import sessionData from "./sessionData";

cc.Class({
    extends: cc.Component,

    properties: {
        attackAudio: {
            default: null,
            type: cc.AudioClip
        },
        bgmAudio: {
            default: null,
            type: cc.AudioClip
        },
        buttonAudio: {
            default: null,
            type: cc.AudioClip
        },
        deathAudio: {
            default: null,
            type: cc.AudioClip
        },
        game_startAudio: {
            default: null,
            type: cc.AudioClip
        },
        level_upAudio: {
            default: null,
            type: cc.AudioClip
        },
        timeAudio: {
            default: null,
            type: cc.AudioClip
        }
    },

    start() {
        this.updateIsOpen();
    },

    updateIsOpen() {
        this.isOpen = sessionData.isOpen;
    },

    onPlayBgAudio() {
        if (this.isOpen) {
            this.gameBgm = cc.audioEngine.play(this.bgmAudio, true, 0.5);
        }
    },

    onCloseBgAudio() {
        if (this.isOpen) {
            cc.audioEngine.stop(this.gameBgm);
        }
    },

    onAttackAudio() {
        if (this.isOpen) {
            cc.audioEngine.play(this.attackAudio, false, 1);
        }
    },

    onButtonAudio() {
        if (this.isOpen) {
            cc.audioEngine.play(this.buttonAudio, false, 1);
        }
    },

    onDeathAudio() {
        if (this.isOpen) {
            cc.audioEngine.play(this.deathAudio, false, 1);
        }
    },

    onGameStartAudio() {
        if (this.isOpen) {
            cc.audioEngine.play(this.game_startAudio, false, 1);
        }
    },

    onLevelUpAudio() {
        if (this.isOpen) {
            cc.audioEngine.play(this.level_upAudio, false, 1);
        }
    },

    onTimeAudio() {
        if (this.isOpen) {
            cc.audioEngine.play(this.timeAudio, false, 1);
        }
    }
});
