
cc.Class({
    extends: cc.Component,

    properties: {
        item1: cc.Node,
        item2: cc.Node,
        item3: cc.Node,
        inviteFriendNum: cc.Label,
        allGetBtn: cc.Button
    },

    init(menu) {
        this.menu = menu;
        this.gc = menu.gc;
        //屏幕适配
        this.node.width = this.menu.node.width;
        this.node.height = this.menu.node.height;

        this.item1.getChildByName('gou').active = false;
        this.item2.getChildByName('gou').active = false;
        this.item3.getChildByName('gou').active = false;
        this.item1.getChildByName('inviteNum').active = true;
        this.item2.getChildByName('inviteNum').active = true;
        this.item3.getChildByName('inviteNum').active = true;
        this.allGetBtn.interactable = true;

        let self = this;
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            this.menu.gc.getInviteFriendsData((res) => {
                if (res.length === 0) {
                    return;
                } else if (res.length > 0) {
                    self.inviteFriendNum.string = '今日已邀请' + res.length + '人';
                    let data = self.menu.gc.getBlobMap();
                    if (!data) return;
                    if (res.length === 1) {
                        if (data['inviteBuff1']) {
                            if (self.isSameDay(parseInt(data['inviteBuff1']), new Date().getTime())) {
                                self.item1.getChildByName('gou').active = true;
                                self.item1.getChildByName('inviteNum').active = false;
                            } else {
                                self.item1.getChildByName('gou').active = false;
                                self.item1.getChildByName('inviteNum').active = true;
                            }
                        }
                    } else if (res.length === 2) {
                        if (data['inviteBuff1']) {
                            if (self.isSameDay(parseInt(data['inviteBuff1']), new Date().getTime())) {
                                self.item1.getChildByName('gou').active = true;
                                self.item1.getChildByName('inviteNum').active = false;
                            } else {
                                self.item1.getChildByName('gou').active = false;
                                self.item1.getChildByName('inviteNum').active = true;
                            }
                        }
                        if (data['inviteBuff2']) {
                            if (self.isSameDay(parseInt(data['inviteBuff2']), new Date().getTime())) {
                                self.item2.getChildByName('gou').active = true;
                                self.item2.getChildByName('inviteNum').active = false;
                            } else {
                                self.item2.getChildByName('gou').active = false;
                                self.item2.getChildByName('inviteNum').active = true;
                            }
                        }
                    } else if (res.length >= 3) {
                        if (data['inviteBuff1']) {
                            if (self.isSameDay(parseInt(data['inviteBuff1']), new Date().getTime())) {
                                self.item1.getChildByName('gou').active = true;
                                self.item1.getChildByName('inviteNum').active = false;
                            } else {
                                self.item1.getChildByName('gou').active = false;
                                self.item1.getChildByName('inviteNum').active = true;
                            }
                        }
                        if (data['inviteBuff2']) {
                            if (self.isSameDay(parseInt(data['inviteBuff2']), new Date().getTime())) {
                                self.item2.getChildByName('gou').active = true;
                                self.item2.getChildByName('inviteNum').active = false;
                            } else {
                                self.item2.getChildByName('gou').active = false;
                                self.item2.getChildByName('inviteNum').active = true;
                            }
                        }
                        if (data['inviteBuff3']) {
                            if (self.isSameDay(parseInt(data['inviteBuff3']), new Date().getTime())) {
                                self.item3.getChildByName('gou').active = true;
                                self.item3.getChildByName('inviteNum').active = false;
                            } else {
                                self.item3.getChildByName('gou').active = false;
                                self.item3.getChildByName('inviteNum').active = true;
                            }
                        }

                        if (self.item1.getChildByName('gou').active && self.item2.getChildByName('gou').active && self.item3.getChildByName('gou').active) {
                            self.allGetBtn.interactable = false;
                        }
                    }
                }
            });
        } else {
            this.inviteFriendNum.string = '今日已邀请3人';
            let data = this.menu.gc.getBlobMap();
            if (!data) return;
            if (data['inviteBuff1']) {
                if (this.isSameDay(parseInt(data['inviteBuff1']), new Date().getTime())) {
                    this.item1.getChildByName('gou').active = true;
                    this.item1.getChildByName('inviteNum').active = false;
                } else {
                    this.item1.getChildByName('gou').active = false;
                    this.item1.getChildByName('inviteNum').active = true;
                }
            }
            if (data['inviteBuff2']) {
                if (this.isSameDay(parseInt(data['inviteBuff2']), new Date().getTime())) {
                    this.item2.getChildByName('gou').active = true;
                    this.item2.getChildByName('inviteNum').active = false;
                } else {
                    this.item2.getChildByName('gou').active = false;
                    this.item2.getChildByName('inviteNum').active = true;
                }
            }
            if (data['inviteBuff3']) {
                if (this.isSameDay(parseInt(data['inviteBuff3']), new Date().getTime())) {
                    this.item3.getChildByName('gou').active = true;
                    this.item3.getChildByName('inviteNum').active = false;
                } else {
                    this.item3.getChildByName('gou').active = false;
                    this.item3.getChildByName('inviteNum').active = true;
                }
            }

            if (this.item1.getChildByName('gou').active && this.item2.getChildByName('gou').active && this.item3.getChildByName('gou').active) {
                this.allGetBtn.interactable = false;
            }
        }

        this.windowOpenEffect = this.node.getComponent('windowOpenEffect');
        this.windowOpenEffect.showPanel(this.node);
    },

    //判断是否是同一天
    isSameDay(oldTime, nowTime) {
        let oldDate = new Date(oldTime);
        let nowDate = new Date(nowTime);

        let old = oldDate.getFullYear() + '' + oldDate.getMonth() + '' + oldDate.getDate();
        let now = nowDate.getFullYear() + '' + nowDate.getMonth() + '' + nowDate.getDate();

        if (old === now) {
            return true;
        } else {
            return false;
        }
    },

    //全部领取
    onBtnAllGet() {
        //按钮音效
        this.menu.audio.onButtonAudio();

        let self = this;
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            this.menu.gc.getInviteFriendsData((res) => {
                if (res.length === 0) {
                    this.menu.gc.shareWithInviteFriends((res) => {
                        console.log(res);
                    }, 103);
                    return;
                } else if (res.length > 0) {
                    if (res.length === 1) {
                        if(self.item1.getChildByName('gou').active){
                            this.menu.gc.shareWithInviteFriends((res) => {
                                console.log(res);
                            }, 103);
                            return;
                        }
                        if (!self.item1.getChildByName('gou').active) {
                            //加金币
                            self.gc.addGold(60);
                            self.menu.gc.setBlobMap({
                                inviteBuff1: new Date().getTime()
                            });
                            self.item1.getChildByName('gou').active = true;
                            self.item1.getChildByName('inviteNum').active = false;
                        }

                        wx.showToast({
                            title: '领取成功',
                            icon: 'success',
                            duration: 2000
                        });
                    } else if (res.length === 2) {
                        if(self.item1.getChildByName('gou').active && self.item2.getChildByName('gou').active){
                            this.menu.gc.shareWithInviteFriends((res) => {
                                console.log(res);
                            }, 103);
                            return;
                        }
                        if (!self.item1.getChildByName('gou').active) {
                            //加金币
                            self.gc.addGold(60);
                            self.menu.gc.setBlobMap({
                                inviteBuff1: new Date().getTime()
                            });
                            self.item1.getChildByName('gou').active = true;
                            self.item1.getChildByName('inviteNum').active = false;
                        }
                        if (!self.item2.getChildByName('gou').active) {
                            //加复活币
                            self.menu.reviveCoinNum += 2;
                            self.menu.gc.setBlobMap({
                                reviveCoin: self.menu.reviveCoinNum,
                                inviteBuff2: new Date().getTime()
                            });
                            self.menu.reviveNumLabel.string = self.menu.reviveCoinNum.toString();
                            self.item2.getChildByName('gou').active = true;
                            self.item2.getChildByName('inviteNum').active = false;
                        }

                        wx.showToast({
                            title: '领取成功',
                            icon: 'success',
                            duration: 2000
                        });
                    } else if (res.length >= 3) {
                        if(self.item1.getChildByName('gou').active && self.item2.getChildByName('gou').active && self.item3.getChildByName('gou').active){
                            return;
                        }
                        if (!self.item1.getChildByName('gou').active) {
                            //加金币
                            self.gc.addGold(60);
                            self.menu.gc.setBlobMap({
                                inviteBuff1: new Date().getTime()
                            });
                            self.item1.getChildByName('gou').active = true;
                            self.item1.getChildByName('inviteNum').active = false;
                        }
                        if (!self.item2.getChildByName('gou').active) {
                            //加复活币
                            self.menu.reviveCoinNum += 2;
                            self.menu.gc.setBlobMap({
                                reviveCoin: self.menu.reviveCoinNum,
                                inviteBuff2: new Date().getTime()
                            });
                            self.menu.reviveNumLabel.string = self.menu.reviveCoinNum.toString();
                            self.item2.getChildByName('gou').active = true;
                            self.item2.getChildByName('inviteNum').active = false;
                        }
                        if (!self.item3.getChildByName('gou').active) {
                            //开局10级
                            self.menu.gc.setBlobMap({
                                inviteBuff3: new Date().getTime()
                            });
                            self.item3.getChildByName('gou').active = true;
                            self.item3.getChildByName('inviteNum').active = false;
                        }

                        wx.showToast({
                            title: '领取成功',
                            icon: 'success',
                            duration: 2000
                        });

                        this.allGetBtn.interactable = false;
                    }
                }
            })
        } else {
            if (!this.item1.getChildByName('gou').active) {
                //加金币
                this.gc.addGold(60);
                this.menu.gc.setBlobMap({
                    inviteBuff1: new Date().getTime()
                });
                this.item1.getChildByName('gou').active = true;
                this.item1.getChildByName('inviteNum').active = false;
            }
            if (!this.item2.getChildByName('gou').active) {
                //加复活币
                this.menu.reviveCoinNum += 2;
                this.menu.gc.setBlobMap({
                    reviveCoin: self.menu.reviveCoinNum,
                    inviteBuff2: new Date().getTime()
                });
                this.menu.reviveNumLabel.string = this.menu.reviveCoinNum.toString();
                this.item2.getChildByName('gou').active = true;
                this.item2.getChildByName('inviteNum').active = false;
            }
            if (!this.item3.getChildByName('gou').active) {
                //开局10级
                this.menu.gc.setBlobMap({
                    inviteBuff3: new Date().getTime()
                });
                this.item3.getChildByName('gou').active = true;
                this.item3.getChildByName('inviteNum').active = false;
                this.gc.showModal('领取成功');
            }

            this.allGetBtn.interactable = false;
        }
    },

    //邀请好友
    onBtnInvite() {
        this.menu.gc.shareWithInviteFriends((res) => {
            console.log(res);
        }, 103);

        //按钮音效
        this.menu.audio.onButtonAudio();
    },

    closeGoalWindow() {
        this.windowOpenEffect.closePanel();

        //按钮音效
        this.menu.audio.onButtonAudio();
    }
});
