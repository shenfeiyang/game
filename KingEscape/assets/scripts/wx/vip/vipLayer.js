var config = require('config');
var globalFunc = require('globalFunc');
var vip = require('vip').getInstance();

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.view = cc.find('view', this.node);

        this.avatarList = new Array();
        for (let i = 0; i < 6; i++) {
            this.avatarList[i] = cc.find('friendsInfo/info' + (i + 1) + '/avatar', this.view);
            this.avatarList[i].parent.on('click', this.onInvite, this);
            this.avatarList[i].active = false;
        }

        this.descNode = cc.find('desc', this.view);
        this.inviteNumLb = cc.find('inviteInfo/num', this.view).getComponent(cc.Label);

        this.closeBtn = cc.find('top/close', this.view);
        this.inviteBtn = cc.find('inviteBtn', this.view);
        this.inviteBtnLb = cc.find('btnLabel', this.inviteBtn).getComponent(cc.Label);

        this.inviteBtn.on('click', this.onInvite, this);
        this.closeBtn.on('click', this.onClose, this);

        this.canActive = false;
    },

    start () {

    },

    init () {
        if (!!!config.gamecenter_link) {
            return;
        }
        this.node.active = true;
        
        if (vip.isVipActive()) {
            this.inviteBtnLb.string = '贵宾已激活';
            this.inviteBtn.getComponent(cc.Button).interactable = false;
        }
        this.showAbilityView();

        // vip.getShareVipInfo(this.updateFriendInfo, this);
        this.pullShareVipInfo();
        this.schedule(this.pullShareVipInfo, 15);
    },

    showAbilityView () {
        let stableAbs = config.vipAbility.stable;
        let configAbs = config.vipAbility.configurable;
        let abLength = stableAbs.length + configAbs.length;

        let descLbs = this.adaptDescView(abLength);
        // console.log('descLbs:', descLbs);
        for (let i = 0; i < descLbs.length; i++) {
            let lb = descLbs[i].getComponent(cc.Label);
            let desc = '';
            if (i < stableAbs.length) {
                desc = this.parseDesc(stableAbs[i].desc, stableAbs[i].value);
            } else {
                desc = this.parseDesc(configAbs[i - stableAbs.length].desc, configAbs[i - stableAbs.length].value);
            }
            lb.string = (i + 1) + '.' + desc;
        }
    },

    parseDesc (desc, value) {
        let result = desc;
        if (value != null) {
            result = globalFunc.getTextext({title: desc, value: value});
        }
        return result;
    },

    adaptDescView (abLength) {
        let result = new Array();
        let descList = this.descNode.children;
        let lenDelta = abLength - descList.length;
        if (lenDelta > 0) {
            for (let i = 0; i < lenDelta; i++) {
                let newNode = cc.instantiate(descList[0]);
                this.descNode.addChild(newNode);
            }
            // let newHeight = descList[0].height * (abLength - lenDelta) / abLength;
            let newHeight = (this.descNode.height - 10) / abLength;
            let newFontSize = newHeight - 5;
            for (let i = 0; i < abLength; i++) {
                let descLb = descList[i];
                descLb.getComponent(cc.Label).fontSize = newFontSize;
                descLb.getComponent(cc.Label).lineHeight = newHeight;
                if (i == 0) {
                    descLb.y = this.descNode.height / 2 - 5;
                } else {
                    descLb.y = descList[i - 1].y - newHeight;
                }
                result[i] = descLb;
            }
        } else if (lenDelta <= 0) {
            for (let i = 0; i < descList.length; i++) {
                if (i >= abLength) {
                    descList[i].active = false;
                } else {
                    result[i] = descList[i];
                }
            }
        }
        return result;
    },

    pullShareVipInfo () {
        vip.getShareVipInfo(this.updateFriendInfo, this.onGetVipInfoFail, this);
    },

    onGetVipInfoFail () {
        this.unschedule(this.pullShareVipInfo);
        wx.showModal({
            title: '提示',
            content: '暂时连接不上数据中心，请稍后再试',
            showCancel: false,
            confirmText: '确定',
            success: res => {
                if (res.confirm) {
                    this.onClose();
                }
            }
        });
    },

    updateFriendInfo (data) {
        console.log('getShareVipInfo:', data);
        let dataList = data.data;

        // mob data
        // for (let i = 1; i < 4; i++) {
        //     dataList[i] = dataList[0];
        // }

        // 显示邀请好友数量
        let len = dataList.length;
        len = len > 6 ? 6 : len;
        this.inviteNumLb.string = len + '/6';

        // 显示邀请的好友头像
        for (let i = 0; i < len; i++) {
            this.avatarList[i].active = true;
            this.loadAvatar(i, dataList[i].icon);
            this.avatarList[i].parent.getComponent(cc.Button).interactable = false;
        }

        // 更新按钮显示
        if (!vip.isVipActive()) {
            if (len == 6) {
                this.canActive = true;
                this.inviteBtnLb.string = '激活贵宾';
            } else {
                this.inviteBtnLb.string = '求助开启贵宾';
            }
            this.inviteBtn.getComponent(cc.Button).interactable = true;
        }
    },

    loadAvatar (index, avatarUrl) {
        if (!avatarUrl) return;
        // avatarUrl = avatarUrl.split("/0", 1);
        // avatarUrl = avatarUrl + "/96";
        cc.loader.load({ url: avatarUrl, type: 'png' }, (err, texture) => {
            if (err) {
                console.error(err.message || err);
                return;
            }
            let spriteFrame = new cc.SpriteFrame();
            spriteFrame.setTexture(texture);
            let avatar = this.avatarList[index];
            avatar.active = true;
            avatar.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });
    },

    onInvite () {
        if (this.canActive) {
            vip.setVip({
                bool: true,
                success: () => {
                    this.inviteBtnLb.string = '贵宾已激活';
                    this.inviteBtn.getComponent(cc.Button).interactable = false;
                    wx.showToast({
                        title: '激活成功',
                        duration: 2000
                    });
                },
                fail: () => {
                    wx.showToast({
                        title: '激活失败',
                        duration: 2000
                    });
                }
            });
        } else {
            // 分享
            let wxAddLayer = this.node.parent.getComponent('wxAddLayer');
            wxAddLayer.callAuthView(function () {
                console.log('vip share uid:', config.UID, typeof config.UID);
                wxAddLayer.shareBtnWithVip(null, () => {
                    wx.showToast({
                        title: '求助成功',
                        duration: 2000
                    });
                });
            }, 1);
        }
    },

    onClose () {
        this.unschedule(this.pullShareVipInfo);
        this.node.active = false;
    }

    // update (dt) {},
});
