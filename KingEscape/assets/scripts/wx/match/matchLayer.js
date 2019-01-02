var util = require('util');
var match = require('match');
var matchManager = require('matchManager').getInstance();
var self = null;

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        self = this;

        // 跑马灯父节点
        self.marquee = cc.find('tips/marquee', self.node);
        self.marqueeItem = cc.find('prizeInfo', self.marquee);
        self.marqueeItem.active = false;

        var shareBtn = cc.find('shareBtn', self.node);
        shareBtn.on('click', self.onShare, self);

        var closeBtn = cc.find("closeBtn", self.node);
        closeBtn.on('click', self.onClose, self);

        // 跑马灯相关设置
        self.marqueeList = new Array();
        self.marqueePool = new cc.NodePool();

        for (var i = 0; i < 3; i++) {
            var item = cc.instantiate(self.marqueeItem);
            self.marqueePool.put(item);
        }

        for (var i = 0; i < 3; i++) {
            self.createMarqueeItem();
        }

        self.prePos = null;

        // 微信设置
        /*
        wx.onShareAppMessage(function () {
            return {
                title: '转发标题',
                success: res => {
                    console.log("shareAppMessage", res);
                },
                fail: res => {
                    console.log("shareAppMessage fail", res)
                }
            }
        }) */
    },

    start() {

    },

    init(data) {
        console.log('data:', data);
        self.matchData = data;
        // self.matchId = data._id;
    },

    onShare() {
        wx.shareAppMessage({
            title: '来玩啊',
            // query: {
            //     matchId: self.matchData.matchId,
            //     starttime: self.matchData.starttime,
            //     endtime: self.matchData.endtime,
            //     limitscore: self.matchData.limitscore
            // },
            query: 'matchId=' + self.matchData._id +
                '&starttime=' + self.matchData.starttime +
                '&endtime=' + self.matchData.endtime +
                '&limitscore=' + self.matchData.limitscore,
            success: res => {
                console.log('match share success >>>>>>>>>>');
                // 转发到群成功后会拿到一个shareTicket，用来获取群相关信息
                console.log('success response:', res);

                // 通过返回的shareTicket获取群相关的信息
                matchManager.getQunRankInfo(res.shareTickets[0]);

                self.onClose();
            },
            fail: res => {
                console.log('match share failed >>>>>>>>>>');
                console.log('fail response:', res);
            }
        })
    },

    onClose() {
        self.node.active = false;
        // self.node.parent
    },

    updateMarqueeItem(item) {
        var lb = item.getComponent(cc.Label);
        var name = util.randomStr(5);
        var num = 0.01 + Math.random() * 10;
        num = num.toFixed(2);
        lb.string = name + '获得' + num + '元';
    },

    createMarqueeItem() {
        var item = self.marqueePool.get();
        if (item == null) {
            item = cc.instantiate(self.marqueeItem);
        }
        item.active = true;

        self.updateMarqueeItem(item);

        // 设置位置
        self.marquee.addChild(item);
        var destPos = cc.Vec2.ZERO;
        var delta = 20;
        if (self.marqueeList.length > 0) {
            var last = self.marqueeList[self.marqueeList.length - 1];
            destPos.x = last.x + last.width / 2 + item.width / 2 + delta;
        }
        item.setPosition(destPos);
        self.marqueeList.push(item);

        // 设置动作
        if (!item.getActionByTag(1)) {
            var action = cc.repeatForever(cc.moveBy(1, -100, 0));
            action.setTag(1);
            item.runAction(action);
        }
    },

    update(dt) {
        if (self.marqueeList.length <= 0) {
            return;
        }

        var first = self.marqueeList[0];
        if (first.x + first.width / 2 < self.marquee.x - self.marquee.width / 2) {
            var item = self.marqueeList.shift();

            self.marqueePool.put(item);
            self.createMarqueeItem();
        }
    },
});
