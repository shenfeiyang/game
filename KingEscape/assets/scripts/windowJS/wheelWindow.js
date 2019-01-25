import turntable from '../data/turntable';

cc.Class({
    extends: cc.Component,

    properties: {
        wheelSp: cc.Sprite,

        //恭喜获得窗口
        congraWindow: cc.Prefab,

        //免费抽取按钮
        btnFree: cc.Node,
        //分享抽取按钮
        btnShare: cc.Node,
        //分享抽取次数提示
        shareNum: cc.Label,
        //视频抽取按钮
        btnVideo: cc.Node,
        //视频抽取次数提示
        videoNum: cc.Label,

        //金币数量
        totalMoney: cc.Label,
        //复活币数量
        reviveNum: cc.Label
    },

    init(menu) {
        this.menu = menu;
        this.gc = menu.gc;
        //屏幕适配
        this.node.width = this.menu.node.width;
        this.node.height = this.menu.node.height;

        //关闭banner广告
        this.menu.bannerAd.hide();

        this.totalMoney.string = this.gc.getGold();
        this.reviveNum.string = this.menu.reviveCoinNum;

        //免费抽取初始次数
        this.freeNumInit = parseInt(this.menu.globaltbl.get(26).value);
        //分享抽取初始次数
        this.shareNumInit = parseInt(this.menu.globaltbl.get(27).value);
        //视频抽取初始次数
        this.videoNumInit = parseInt(this.menu.globaltbl.get(28).value);

        //cc.sys.localStorage.setItem('wheelFree', '0_0');
        //cc.sys.localStorage.setItem('wheelShare', '0_0');
        //cc.sys.localStorage.setItem('wheelVideo', '0_0');
        //判断是否已经使用免费抽取机会
        let freeData = cc.sys.localStorage.getItem('wheelFree') ? cc.sys.localStorage.getItem('wheelFree').split('_') : '0_0'.split('_');
        if (freeData[0] != new Date().toLocaleDateString()) {
            //显示免费抽取按钮
            this.btnFree.active = true;
            //隐藏分享抽取按钮
            this.btnShare.active = false;
            //隐藏次数提示
            this.shareNum.node.active = false;
        } else if (freeData[0] == new Date().toLocaleDateString()) {
            if (parseInt(freeData[1]) >= this.freeNumInit) {
                //隐藏免费抽取按钮
                this.btnFree.active = false;
                //显示分享抽取按钮
                this.btnShare.active = true;
                //显示次数提示
                this.shareNum.node.active = true;
            } else if (parseInt(freeData[1]) < this.freeNumInit) {
                //显示免费抽取按钮
                this.btnFree.active = true;
                //隐藏分享抽取按钮
                this.btnShare.active = false;
                //隐藏次数提示
                this.shareNum.node.active = false;
            }
        }

        this.checkShareAndVideoOver();
    },

    onLoad() {
        this.windowOpenEffect = this.node.getComponent('windowOpenEffect');
        this.windowOpenEffect.showPanel(this.node);

        this.turntable = turntable;

        /** 转动状态 0:可转动 1:加速  2:减速  **/
        this.wheelState = 0;

        /** 当前速度 **/
        this.curSpeed = 2;

        /**当前旋转值 **/
        this.curRotation = 0;

        /**最大旋转速度 **/
        this.maxSpeed = 30;

        /**加速度 **/
        this.acc = 1;

        /**减速转券数 **/
        this.decAngle = 2 * 360;

        /**加速转券数 **/
        this.accAngle = 2 * 360;


        /**是否回弹 **/
        this.springback = false;

        /**最近一格的角度 **/
        this.gearAngle = 360 / 8;

        this.maxSpeedRun = true;

        this.mostWeight = 0;
        for (let i = 0; i < this.turntable.getLength(); i++) {
            this.mostWeight += parseInt(this.turntable.indexOf(i).weight);
        }

    },

    //免费抽取
    freeBtn() {
        let freeData = cc.sys.localStorage.getItem('wheelFree') ? cc.sys.localStorage.getItem('wheelFree').split('_') : '0_0'.split('_');
        if (freeData[0] == new Date().toLocaleDateString()) {
            //更新分享次数
            cc.sys.localStorage.setItem('wheelFree', new Date().toLocaleDateString() + '_' + (parseInt(freeData[1]) + 1));
        } else {
            //更新分享次数
            cc.sys.localStorage.setItem('wheelFree', new Date().toLocaleDateString() + '_' + 1);
        }
        this.spinBtn();

        //隐藏免费抽取按钮
        this.btnFree.active = false;
        //显示分享抽取按钮
        this.btnShare.active = true;
        //显示次数提示
        this.shareNum.node.active = true;
    },

    //分享抽取
    shareBtn() {
        let self = this;
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            this.menu.gc.publicSharingWithSvrcfg((res) => {
                let shareData = cc.sys.localStorage.getItem('wheelShare') ? cc.sys.localStorage.getItem('wheelShare').split('_') : '0_0'.split('_');
                if (shareData[0] == new Date().toLocaleDateString()) {
                    //更新分享次数
                    cc.sys.localStorage.setItem('wheelShare', new Date().toLocaleDateString() + '_' + parseInt(shareData[1]) + 1);
                } else {
                    //更新分享次数
                    cc.sys.localStorage.setItem('wheelShare', new Date().toLocaleDateString() + '_' + 1);
                }

                self.spinBtn();
                self.checkShareAndVideoOver();
            }, 111);
        } else {
            let shareData = cc.sys.localStorage.getItem('wheelShare') ? cc.sys.localStorage.getItem('wheelShare').split('_') : '0_0'.split('_');
            if (shareData[0] == new Date().toLocaleDateString()) {
                //更新分享次数
                cc.sys.localStorage.setItem('wheelShare', new Date().toLocaleDateString() + '_' + (parseInt(shareData[1]) + 1));
            } else {
                //更新分享次数
                cc.sys.localStorage.setItem('wheelShare', new Date().toLocaleDateString() + '_' + 1);
            }

            this.spinBtn();
            this.checkShareAndVideoOver();
        }
    },

    //视频抽取
    videoBtn() {
        let self = this;
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            this.menu.gc.playAdNew((res) => {
                //更新视频次数
                let videoData = cc.sys.localStorage.getItem('wheelVideo') ? cc.sys.localStorage.getItem('wheelVideo').split('_') : '0_0'.split('_');
                if (videoData[0] == new Date().toLocaleDateString()) {
                    //更新分享次数
                    cc.sys.localStorage.setItem('wheelVideo', new Date().toLocaleDateString() + '_' + (parseInt(videoData[1]) + 1));
                } else {
                    //更新分享次数
                    cc.sys.localStorage.setItem('wheelVideo', new Date().toLocaleDateString() + '_' + 1);
                }

                self.spinBtn();
                self.checkShareAndVideoOver();
            }, 111);
        } else {
            //更新视频次数
            let videoData = cc.sys.localStorage.getItem('wheelVideo') ? cc.sys.localStorage.getItem('wheelVideo').split('_') : '0_0'.split('_');
            if (videoData[0] == new Date().toLocaleDateString()) {
                //更新分享次数
                cc.sys.localStorage.setItem('wheelVideo', new Date().toLocaleDateString() + '_' + (parseInt(videoData[1]) + 1));
            } else {
                //更新分享次数
                cc.sys.localStorage.setItem('wheelVideo', new Date().toLocaleDateString() + '_' + 1);
            }

            this.spinBtn();
            this.checkShareAndVideoOver();
        }
    },

    //判断分享抽取和视频抽取次数是否已用完
    checkShareAndVideoOver() {
        let shareData = cc.sys.localStorage.getItem('wheelShare') ? cc.sys.localStorage.getItem('wheelShare').split('_') : '0_0'.split('_');
        let videoData = cc.sys.localStorage.getItem('wheelVideo') ? cc.sys.localStorage.getItem('wheelVideo').split('_') : '0_0'.split('_');


        if (shareData[0] == new Date().toLocaleDateString() && parseInt(shareData[1]) >= this.shareNumInit) {
            this.btnShare.getComponent(cc.Button).interactable = false;
            this.shareNum.string = '今日剩余0次';
        } else {
            this.shareNum.string = '今日剩余' + (this.shareNumInit - parseInt(shareData[1])) + '次';
        }
        if (videoData[0] == new Date().toLocaleDateString() && parseInt(videoData[1]) >= this.videoNumInit) {
            this.btnVideo.getComponent(cc.Button).interactable = false;
            this.videoNum.string = '今日剩余0次';
        } else {
            this.videoNum.string = '今日剩余' + (this.videoNumInit - parseInt(videoData[1])) + '次';
        }
    },

    spinBtn() {
        if (this.wheelState !== 0) return;

        let allWeight = 0;
        let rand = Math.ceil(Math.random() * this.mostWeight);
        for (let i = 0; i < this.turntable.getLength(); i++) {
            if (rand > allWeight && rand <= allWeight + parseInt(this.turntable.indexOf(i).weight)) {
                this.finalNum = i;
            }
            allWeight += parseInt(this.turntable.indexOf(i).weight);
        }

        /** 最终旋转角度 */
        this.finalAngle = 360 / 8 * this.finalNum;

        if (this.springback) {
            this.finalAngle += this.gearAngle;
        }
        //最大旋转速度
        this.maxSpeed = 30;
        //转盘状态
        this.wheelState = 1;
        //当前旋转速度
        this.curSpeed = 2;
        //当前旋转角度
        this.curRotation = this.curRotation % 360;
        //设置转盘角度
        this.wheelSp.node.angle = this.curRotation;
        this.maxSpeedRun = true;
    },

    update(dt) {
        if (this.wheelState == 1) {
            this.curRotation = this.wheelSp.node.angle + this.curSpeed;
            this.wheelSp.node.angle = this.curRotation;
            if (this.curSpeed <= this.maxSpeed) {
                this.curSpeed += this.acc;
            }
            else {
                if (this.maxSpeedRun) {
                    //console.log(".....最大速度旋转2圈")
                    this.finalAngle += 360 * 1;
                    this.maxSpeedRun = false;
                }

                if (this.curRotation <= this.finalAngle) {
                    return;
                }
                //cc.log('....开始减速');
                //设置目标角度
                this.maxSpeed = this.curSpeed;
                this.wheelSp.node.angle = this.finalAngle;
                this.wheelState = 2;
            }
        }
        else if (this.wheelState == 2) {
            //cc.log('......减速');
            var curRo = this.wheelSp.node.angle; //应该等于finalAngle
            var hadRo = curRo - this.finalAngle;
            this.curSpeed = this.maxSpeed * ((this.decAngle - hadRo) / this.decAngle) + 0.2;
            this.wheelSp.node.angle = curRo + this.curSpeed;

            if ((this.decAngle - hadRo) <= 0) {
                //cc.log('....停止');
                this.wheelState = 0;
                this.wheelSp.node.angle = this.finalAngle;
                if (this.springback) {
                    //倒转一个齿轮
                    var act = cc.rotateBy(0.5, -this.gearAngle);
                    var seq = cc.sequence(cc.delayTime(0.1), act, cc.callFunc(() => {
                        this.OnEndCallBack();
                    }, this));
                    this.wheelSp.node.runAction(seq);
                } else {
                    this.OnEndCallBack();
                }
            }
        }
    },

    OnEndCallBack() {
        let type = this.turntable.indexOf(this.finalNum).type;
        let num = parseFloat(this.turntable.indexOf(this.finalNum).num);
        let self = this;
        switch (type) {
            case 1:
                //获得开局10级
                if (this.menu.wheelMostBuff != new Date().toLocaleDateString()) {
                    this.gc.setBlobMap({
                        wheelMostBuff: new Date().toLocaleDateString()
                    });
                }

                this.openCongraWindow(1, '开局等级为', 10);
                break;
            case 2:
                //加复活币
                this.menu.reviveCoinNum += num;
                this.gc.setBlobMap({
                    reviveCoin: self.menu.reviveCoinNum
                });

                this.openCongraWindow(2, '复活币', '+' + num);
                this.reviveNum.string = this.menu.reviveCoinNum;
                break;
            case 3:
                //加飞镖
                this.menu.dartNum += num;
                this.gc.setBlobMap({
                    dartNum: self.menu.dartNum
                });

                this.openCongraWindow(3, '飞镖', '+' + num);
                break;
            case 4:
                //加金币
                this.gc.addGold(num);

                this.openCongraWindow(4, '金币', '+' + num);

                this.totalMoney.string = this.gc.getGold();
                break;
            case 5:
                let getNum = 0;
                let randBuffData = cc.sys.localStorage.getItem('randWheelBuff') ? cc.sys.localStorage.getItem('randWheelBuff').split('_') : '0_0'.split('_');
                if (randBuffData[0] == new Date().toLocaleDateString()) {
                    cc.sys.localStorage.setItem('randWheelBuff', new Date().toLocaleDateString() + '_' + (parseInt(randBuffData[1]) + 1));
                    getNum = parseInt(randBuffData[1]) + 1;
                } else {
                    cc.sys.localStorage.setItem('randWheelBuff', new Date().toLocaleDateString() + '_' + 1);
                    getNum = 1;
                }

                switch (getNum % 3) {
                    case 0:
                        this.openCongraWindow(7, '挥砍速度', '+' + (num * 100) + '%');
                        cc.sys.localStorage.setItem('wheelBuff3', new Date().toLocaleDateString() + '_' + Math.ceil(getNum / 3) * num);
                        break;
                    case 1:
                        this.openCongraWindow(5, '武器长度', '+' + (num * 100) + '%');
                        cc.sys.localStorage.setItem('wheelBuff1', new Date().toLocaleDateString() + '_' + Math.ceil(getNum / 3) * num);
                        break;
                    case 2:
                        this.openCongraWindow(6, '移动速度', '+' + (num * 100) + '%');
                        cc.sys.localStorage.setItem('wheelBuff2', new Date().toLocaleDateString() + '_' + Math.ceil(getNum / 3) * num);
                        break;
                }
                break;
            case 6:
                //加护盾
                this.menu.shieldNum += num;
                this.gc.setBlobMap({
                    shieldNum: self.menu.shieldNum
                });

                this.openCongraWindow(8, '护盾', '+' + num);
                break;
        }
        this.wheelState = 0;
    },

    //打开恭喜获得窗口
    openCongraWindow(type, tip, tipNum) {
        let congraWindow = cc.instantiate(this.congraWindow);
        this.node.addChild(congraWindow);
        congraWindow.getComponent('congraWindow').init(this.menu, type, tip, tipNum);
    },

    //关闭幸运转盘窗口
    closeWheelWindow() {
        this.windowOpenEffect.closePanel();

        this.menu.reviveNumLabel.string = this.menu.reviveCoinNum.toString();

        //按钮音效
        this.menu.audio.onButtonAudio();

        //打开banner广告
        this.menu.bannerAd.show();

        //刷新小红点
        this.menu.redPointTip3();
    },
});
