var util = require('util');
var match = require('match');
var self = null;

cc.Class({
    extends: cc.Component,

    properties: {
        rankItem: cc.Prefab,
        withdrawWidget: cc.Prefab
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        self = this;

        // match 界面相关元素设置
        self.challengePanel = cc.find('challengePanel', self.node);
        self.gameIcon = cc.find('gameIcon/mask/image', self.challengePanel).getComponent(cc.Sprite);
        self.limitScore = cc.find('targetLabel/score', self.challengePanel).getComponent(cc.Label);
        self.endTimeDesc = cc.find('timeLimitDesc', self.challengePanel).getComponent(cc.Label);

        self.challengeBtn = cc.find('challengeBtn', self.challengePanel);
        self.challengeBtnLb = cc.find('desc', self.challengeBtn).getComponent(cc.Label);
        self.challengeBtn.on('click', self.onChallengeBtnClick, self);

        self.withdraw = cc.find('withdraw', self.challengePanel);
        self.withdraw.on('click', self.onWithdrawClick, self);

        // rank 相关界面元素设置
        self.rankPanel = cc.find('rankPanel', self.node);
        self.scrollView = cc.find('rankScroll', self.rankPanel).getComponent(cc.ScrollView);
        self.content = self.scrollView.content;

        self.closeBtn = cc.find('closeBtn', self.node);
        self.closeBtn.on('click', self.onCloseBtnClick, self);

        self.bestThreeWidgets = new Array();
        for (var i = 0; i < 3; i++) {
            var index = i + 1;
            self.bestThreeWidgets[i] = cc.find('rank_' + index, self.rankPanel);
        }

        // 提现界面设置
        self.withdrawView = cc.instantiate(self.withdrawWidget);
        self.node.addChild(self.withdrawView);
        self.withdrawView.active = false;

        self.allMoneyLb = cc.find('money', self.withdrawView).getComponent(cc.Label);
        cc.find('closeBtn', self.withdrawView).on('click', function () {
            self.withdrawView.active = false;
        });

        // 状态设置
        self.matchState = 1;    // 0: 比赛过期或不存在, 1: 未参加比赛, 2: 已参加比赛
        self.moneyState = 0;    // 0: 未达到条件, 1: 已达到条件但未领取, 2: 已领取
    },

    start() {

    },

    init(matchData, rankData) {
        console.log('match rank layer inited ..........');
        console.log('match data:', matchData);
        console.log('rank data:', rankData);

        self.matchId = matchData._id;

        self.initChallengeView(matchData);
        self.initRankView(rankData);
    },

    initChallengeView(matchData) {
        self.limitScore.string = matchData.limitscore;
        self.endTimeDesc.string = '本次小比赛将于' + self.parseDate(matchData.endtime) + '结束';

        // var endTime = new Date();
        // endTime.setTime(matchData.endtime * 1000);
        // console.log('endtime:', util.formatTime(endTime));

        self.challengeBtn.interactable = false;
        match.queryMyMatch({
            matchId: self.matchId,
            success: res => {
                console.log('query my match success, res:', res);
                if (res.matchstate) {
                    self.matchState = res.matchstate;
                }
                if (res.moneystate) {
                    self.moneyState = res.moneystate;
                }
                self.updateChallengeView();
            },
            fail: res => {
                console.log('query my match fail, res:', res);
                // self.challengePanel.active = false;
                self.onCloseBtnClick();
            }
        });
    },

    initRankView(rankData) {
        self.bestList = [];
        self.content.removeAllChildren();

        // 设置前三
        for (var i = 0; i < 3; i++) {
            var value = rankData.shift();
            if (!!value) {
                self.bestList.push(value);
            }
        }
        self.initBestThree(self.bestList);

        // 设置之后
        self.initScrollView(rankData);
    },

    initBestThree(list) {
        for (var i = 0; i < 3; i++) {
            var data = list[i];
            if (typeof data != 'undefined') {
                self.updateBestData(data, i);
                self.bestThreeWidgets[i].active = true;
            } else {
                self.bestThreeWidgets[i].active = false;
            }
        }
    },

    updateBestData(data, index) {
        var widget = self.bestThreeWidgets[index];
        var name = cc.find('name', widget).getComponent(cc.Label);
        var grade = cc.find('grade', widget).getComponent(cc.Label);
        var image = cc.find('mask/image', widget).getComponent(cc.Sprite);

        name.string = data.name || '';
        grade.string = data.score || 0;

        //获取人物头像
        var texture = data.portrait;
        if (!texture) {
            return;
        }
        texture = texture.split("/0", 1);
        texture = texture + "/64";
        cc.loader.load({ url: texture, type: 'png' }, function (err, texture) {
            ////console.log("loadUrl",texture instanceof cc.Texture2D)
            var spriteFrame = new cc.SpriteFrame();
            spriteFrame.setTexture(texture);
            image.spriteFrame = spriteFrame;
        })
    },

    initScrollView(rankData) {
        for (var i = 0; i < rankData.length; i++) {
            var item = self.createRankItem(rankData[i], i);
            self.content.addChild(item);
        }
        self.scrollView.scrollToTop(0);
    },

    createRankItem(data, index) {
        var item = cc.instantiate(self.rankItem);
        item.getComponent('matchRankItem').init(data, index);
        return item;
    },

    updateChallengeView() {
        console.log('update challenge view, matchState: ' + self.matchState + ' moneyState: ' + self.moneyState);

        if (self.matchState == 0) {
            self.challengeBtnLb.string = '比赛已结束';
            self.endTimeDesc.string = '本次小比赛已于' + self.parseDate(matchData.endtime) + '结束';
            return;
        }

        if (self.matchState == 1) {
            self.challengeBtnLb.string = '挑战领赏金';
            return;
        }

        if (self.moneyState == 0) {
            self.challengeBtnLb.string = '挑战领赏金';
        } else if (self.moneyState == 1) {
            self.challengeBtnLb.string = '领取赏金';
        } else if (self.moneyState == 2) {
            self.challengeBtnLb.string = '挑战排名';
            self.endTimeDesc.string = '近期已领取过此游戏比赛赏金';
        }

        self.challengeBtn.interactable = true;
    },

    onCloseBtnClick() {
        self.node.active = false;
    },

    onChallengeBtnClick() {
        console.log('on challenge btn click, matchState: ' + self.matchState + ' moneyState: ' + self.moneyState);

        // 领取赏金
        if (self.matchState == 2 && self.moneyState == 1) {
            match.getCurMatchMoney({
                matchId: self.matchId,
                success: res => {
                    // 之后应该从服务器获取state
                    self.moneyState = 2;
                    self.updateChallengeView();

                    wx.showToast({
                        title: '赏金领取成功',
                        duration: 1500
                    });
                }
            });
            return;
        }

        // 加入比赛
        if (self.matchState == 1) {
            match.enterMatch(function () {
                wx.showToast({
                    title: '加入比赛成功',
                    duration: 1500
                });
            });
        } else {
            wx.showToast({
                title: '开始挑战',
                duration: 1500
            });
        }
        self.onCloseBtnClick();
    },

    onWithdrawClick() {
        match.getAllMoney(function (data) {
            self.withdrawView.active = true;
            self.allMoneyLb.string = (data.allmoney || '0') + '元';
        });
    },

    parseDate(time) {
        var datetime = new Date();
        datetime.setTime(time * 1000);
        // var year = datetime.getFullYear();
        var month = datetime.getMonth() + 1;
        var date = datetime.getDate();
        var hour = datetime.getHours();
        var minute = datetime.getMinutes();
        // var second = datetime.getSeconds();
        // var mseconds = datetime.getMilliseconds();
        return month + "/" + date + " " + hour + ":" + minute;
    }
});
