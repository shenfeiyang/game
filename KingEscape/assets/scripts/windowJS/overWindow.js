cc.Class({
    extends: cc.Component,

    properties: {
        score: cc.RichText,
        killNum: cc.RichText,
        totalMoney: cc.Label,
        gameTime: cc.RichText,

        btnAgain: cc.Node
    },

    //打开游戏结算界面
    openOverWindow(stage, game) {
        this.stage = stage;
        this.game = game;
        //屏幕适配
        this.node.width = this.game.node.width;
        this.node.height = this.game.node.height;

        this.score.string = '<color=#FAAB32><b>' + this.stage.player.exp + '</b></c>';
        this.killNum.string = '<color=#FAAB32><b>' + this.game.killNum + '</b></c>';
        this.totalMoney.string = this.game.totalMoney + '';
        cc.log(this.game.gameTime);
        let hour = parseInt(this.game.gameTime / (60 * 60 * 1000));
        let minute = parseInt((this.game.gameTime % (60 * 60 * 1000)) / (60 * 1000));
        let second = parseInt((this.game.gameTime % (60 * 1000)) / 1000);
        let finalTime = '';
        if (hour < 10) {
            finalTime += '0' + hour.toString() + '：';
        } else {
            finalTime += hour.toString() + '：';
        }
        if (minute < 10) {
            finalTime += '0' + minute.toString() + '：';
        } else {
            finalTime += minute.toString() + '：';
        }
        if (second < 10) {
            finalTime += '0' + second.toString();
        } else {
            finalTime += second.toString();
        }
        this.gameTime.string = '<color=#FAAB32><b>' + finalTime + '</b></c>';

        this.loadRankData();

        //再来一局按钮呼吸动画
        this.btnHuxi();
        this.unschedule(this.btnHuxi);
        this.schedule(this.btnHuxi, 4);

        if(!this.game.goodGame.active){
            this.game.goodGame.active = true;
        }
    },

    //再来一局按钮呼吸动画
    btnHuxi() {
        let action1 = cc.scaleTo(2, 1.1);
        let action2 = cc.scaleTo(2, 1);
        this.btnAgain.runAction(cc.sequence(action1, action2));
    },

    //加载排行数据
    loadRankData() {
        if (CC_WECHATGAME) {
            // 发消息给子域
            window.wx.postMessage({
                messageType: 2,
                MAIN_MENU_NUM: "mostScore"
            });
        } else {
            cc.log("获取好友排行榜数据");
        }
    },

    //返回主页
    onBtnBackMenu() {
        //按钮音效
        this.game.audio.onButtonAudio();
        //关闭背景音乐
        this.game.audio.onCloseBgAudio();

        this.game.node.cleanup();

        cc.director.loadScene('MenuScene');
    },

    //再来一局
    onBtnRestart() {
        this.game.restartGame();

        //按钮音效
        this.game.audio.onButtonAudio();
    },

    //挑战好友
    onBtnTiaozhan() { 
        this.game.gc.shareBtn((res) => {
            console.log(res);
        }, null, 110);

        //按钮音效
        this.game.audio.onButtonAudio();
    },

    //查看全部排行榜
    onBtnAllRank() {
        this.game.openRankWindow();

        //按钮音效
        this.game.audio.onButtonAudio();
    },

    //关闭窗口
    closeOverWindow() {
        this.game.goodGame.active = false;

        this.node.parent.removeChild(this.node);

        //按钮音效
        this.game.audio.onButtonAudio();
    }
});
