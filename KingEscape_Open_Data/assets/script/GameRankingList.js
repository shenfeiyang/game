
cc.Class({
    extends: cc.Component,

    properties: {
        rankingScrollView: cc.ScrollView,
        scrollViewContent: cc.Node,
        prefabRankItem: cc.Prefab,
        prefabGameOverRank: cc.Prefab,
        gameOverRankLayout: cc.Node,
        loadingLabel: cc.Node,//加载文字
    },

    start() {
        this.removeChild();
        this.CC_WECHATGAME = true;
        if (this.CC_WECHATGAME) {
            wx.onMessage(data => {
                console.log("接收主域发来消息：", data)
                if (data.messageType == 0) {//移除排行榜
                    this.removeChild();
                } else if (data.messageType == 1) {//获取好友排行榜
                    this.node.parent.getComponent(cc.Canvas).designResolution = cc.size(732, 355);
                    this.fetchFriendData(data.MAIN_MENU_NUM);
                } else if (data.messageType == 2) {//游戏结束界面排行
                    this.node.parent.getComponent(cc.Canvas).designResolution = cc.size(90, 425);
                    this.gameOverRank(data.MAIN_MENU_NUM);
                }
            });
        }
    },

    removeChild() {
        this.rankingScrollView.node.active = false;
        this.scrollViewContent.removeAllChildren();
        this.gameOverRankLayout.active = false;
        this.gameOverRankLayout.removeAllChildren();
        this.loadingLabel.getComponent(cc.Label).string = "玩命加载中...";
        this.loadingLabel.active = true;
    },

    fetchFriendData(MAIN_MENU_NUM) {
        this.removeChild();
        this.scrollViewContent.height = 0;
        this.rankingScrollView.node.active = true;
        if (this.CC_WECHATGAME) {
            wx.getUserInfo({
                openIdList: ['selfOpenId'],
                success: (userRes) => {
                    this.loadingLabel.active = false;
                    console.log('success', userRes.data)
                    let userData = userRes.data[0];
                    //取出所有好友数据
                    wx.getFriendCloudStorage({
                        keyList: MAIN_MENU_NUM,
                        success: res => {
                            console.log("wx.getFriendCloudStorage success", res);
                            let data = res.data;
                            data.sort((a, b) => {
                                if (a.KVDataList.length == 0 && b.KVDataList.length == 0) {
                                    return 0;
                                }
                                if (a.KVDataList.length == 0) {
                                    return 1;
                                }
                                if (b.KVDataList.length == 0) {
                                    return -1;
                                }
                                if (b.KVDataList[0].value === a.KVDataList[0].value) {
                                    return b.KVDataList[1].value - a.KVDataList[1].value;
                                } else {
                                    return b.KVDataList[0].value - a.KVDataList[0].value;
                                }
                            });
                            this.scrollViewContent.removeAllChildren();
                            for (let i = 0; i < data.length; i++) {
                                var playerInfo = data[i];
                                var item = cc.instantiate(this.prefabRankItem);
                                item.getComponent('RankItem').init(i, playerInfo);
                                this.scrollViewContent.addChild(item);
                                this.scrollViewContent.height += item.height + 7;
                            }
                            this.scrollViewContent.height += 7;
                            // if (data.length <= 8) {
                            //     let layout = this.scrollViewContent.getComponent(cc.Layout);
                            //     layout.resizeMode = cc.Layout.ResizeMode.NONE;
                            // }

                        },
                        fail: res => {
                            console.log("wx.getFriendCloudStorage fail", res);
                            this.loadingLabel.getComponent(cc.Label).string = "数据加载失败，请检测网络，谢谢。";
                        },
                    });
                },
                fail: (res) => {
                    this.loadingLabel.getComponent(cc.Label).string = "数据加载失败，请检测网络，谢谢。";
                }
            });
        }
    },

    gameOverRank(MAIN_MENU_NUM) {
        this.removeChild();
        this.loadingLabel.active = false;
        this.gameOverRankLayout.active = true;
        if (this.CC_WECHATGAME) {
            wx.getUserInfo({
                openIdList: ['selfOpenId'],
                success: (userRes) => {
                    cc.log('success', userRes.data)
                    let userData = userRes.data[0];
                    //取出所有好友数据
                    wx.getFriendCloudStorage({
                        keyList: [MAIN_MENU_NUM],
                        success: res => {
                            cc.log("wx.getFriendCloudStorage success", res);
                            this.loadingLabel.active = false;
                            let data = res.data;
                            data.sort((a, b) => {
                                if (a.KVDataList.length == 0 && b.KVDataList.length == 0) {
                                    return 0;
                                }
                                if (a.KVDataList.length == 0) {
                                    return 1;
                                }
                                if (b.KVDataList.length == 0) {
                                    return -1;
                                }
                                return b.KVDataList[0].value - a.KVDataList[0].value;
                            });
                            this.gameOverRankLayout.removeAllChildren();
                            for (let i = 0; i < data.length; i++) {
                                if (data[i].avatarUrl == userData.avatarUrl) {
                                    if ((i - 1) >= 0) {
                                        if ((i + 1) >= data.length && (i - 2) >= 0) {
                                            let userItem = cc.instantiate(this.prefabGameOverRank);
                                            userItem.getComponent('GameOverRank').init(data[i - 2], false);
                                            this.gameOverRankLayout.addChild(userItem);
                                        }
                                        let userItem = cc.instantiate(this.prefabGameOverRank);
                                        userItem.getComponent('GameOverRank').init(data[i - 1], false);
                                        this.gameOverRankLayout.addChild(userItem);
                                    }
                                    let userItem = cc.instantiate(this.prefabGameOverRank);
                                    userItem.getComponent('GameOverRank').init(data[i], true);
                                    this.gameOverRankLayout.addChild(userItem);
                                    if ((i + 1) < data.length) {
                                        let userItem = cc.instantiate(this.prefabGameOverRank);
                                        userItem.getComponent('GameOverRank').init(data[i + 1], false);
                                        this.gameOverRankLayout.addChild(userItem);
                                        if ((i - 1) < 0 && (i + 2) < data.length) {
                                            let userItem = cc.instantiate(this.prefabGameOverRank);
                                            userItem.getComponent('GameOverRank').init(data[i + 2], false);
                                            this.gameOverRankLayout.addChild(userItem);
                                        }
                                    }
                                }
                            }
                            // for (let i = 0; i < 3; i++) {
                            //     let userItem = cc.instantiate(this.prefabGameOverRank);
                            //     this.gameOverRankLayout.addChild(userItem);
                            // }
                        },
                        fail: res => {
                            console.log("wx.getFriendCloudStorage fail", res);
                            this.loadingLabel.getComponent(cc.Label).string = "数据加载失败，请检测网络，谢谢。";
                        },
                    });
                },
                fail: (res) => {
                    this.loadingLabel.getComponent(cc.Label).string = "数据加载失败，请检测网络，谢谢。";
                }
            });
        }
    },
});
