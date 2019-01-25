cc.Class({
    extends: cc.Component,

    properties: {
        friendBtn: cc.Sprite,
        friendBtnTitle: cc.Sprite,
        wordBtn: cc.Sprite,
        wordBtnTitle: cc.Sprite,
        closeBtn: cc.Sprite,
        friendRank: cc.Node,
        worldRank: cc.Node,

        mostKill: cc.Node,

        rankItem: cc.Prefab,
        worldScrollView: cc.Node,
        worldContent: cc.Node,

        //排行榜页签图片
        checkedBg: cc.SpriteFrame,
        checkOutBg: cc.SpriteFrame,
        rankFri_checked: cc.SpriteFrame,
        rankFri_checkOut: cc.SpriteFrame,
        rankWord_checked: cc.SpriteFrame,
        rankWord_checkOut: cc.SpriteFrame,
    },

    //初始化，传递值
    init(self) {
        this.self = self;
        this.gc = self.gc;
        //屏幕适配
        this.node.width = this.self.node.width;
        this.node.height = this.self.node.height;

        this.windowOpenEffect = this.node.getComponent('windowOpenEffect');
        this.windowOpenEffect.showPanel(this.node);

        //关闭banner广告
        this.self.bannerAd.hide();
    },

    //好友排行榜按钮
    onBtnFriendRank() {
        this.friendBtn.spriteFrame = this.checkedBg;
        this.friendBtnTitle.spriteFrame = this.rankFri_checked;

        this.wordBtn.spriteFrame = this.checkOutBg;
        this.wordBtnTitle.spriteFrame = this.rankWord_checkOut;

        this.mostKill.active = true;

        this.friendRank.active = true;
        this.worldRank.active = false;

        if (CC_WECHATGAME) {
            // 发消息给子域
            console.log('获取好友排行榜数据');
            wx.postMessage({
                messageType: 1,
                MAIN_MENU_NUM: ["mostScore", "mostKillNum"]
            });
        } else {
            cc.log("获取好友排行榜数据");
        }

        //按钮音效
        this.self.audio.onButtonAudio();
    },

    //世界排行榜按钮
    onBtnWordRank() {
        this.wordBtn.spriteFrame = this.checkedBg;
        this.wordBtnTitle.spriteFrame = this.rankWord_checked;

        this.friendBtn.spriteFrame = this.checkOutBg;
        this.friendBtnTitle.spriteFrame = this.rankFri_checkOut;

        this.mostKill.active = false;

        this.friendRank.active = false;
        this.worldRank.active = true;

        if (CC_WECHATGAME) {
            // 发消息给子域
            wx.postMessage({
                messageType: 0
            });
        } else {
            cc.log("清空好友排行数据");
        }

        this.worldRankAddData();

        //按钮音效
        this.self.audio.onButtonAudio();
    },

    //添加世界排行榜数据
    worldRankAddData() {
        let KillNumArr = new Array();
        let scoreArr = new Array();
        // this.gc.getWorldRankingPlus('mostKillNum', (res) => {
        //     if (res && res.ranklist.rank.length > 0) {
        //         KillNumArr = res.ranklist.rank;
        //     }
        // });
        //this.worldContent.height = 0;
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            this.gc.getWorldRankingPlus('mostScore', (res) => {
                if (res && res.ranklist.rank.length > 0) {
                    scoreArr = res.ranklist.rank;
                    this.content = this.worldScrollView.getComponent('uiloopscrollview');
                    this._list = scoreArr;
                    this.initScrollView();
                    this.content.setTotalNum(scoreArr.length - 1);
                    this.content.resetView();
                }
            });
        } else {
            
        }

    },

    initScrollView() {
        this.content.registerCreateItemFunc(() => {
            const itemNode = cc.instantiate(this.rankItem);
            itemNode.active = true;
            return itemNode;
        });
        this.content.registerUpdateItemFunc((cell, index) => {
            const info = this._list.slice(index, index + 1);
            var js = cell.getComponent('rankItem');
            js.show(index, info);
        });
    },

    //关闭排行榜窗口
    closeRankWindow() {
        this.windowOpenEffect.closePanel();

        if (this.self.gameBg) {
            this.self.openOverWindow();
        }

        //按钮音效
        this.self.audio.onButtonAudio();

        //打开banner广告
        this.self.bannerAd.show();
    },

    createImage(avatarUrl, head) {
        cc.loader.load({
            url: avatarUrl, type: 'jpg'
        }, (err, texture) => {
            head.spriteFrame = new cc.SpriteFrame(texture);
        });
    },

    createWXImage(avatarUrl, head) {
        try {
            let image = wx.createImage();
            image.onload = () => {
                try {
                    let texture = new cc.Texture2D();
                    texture.initWithElement(image);
                    texture.handleLoadedTexture();
                    head.spriteFrame = new cc.SpriteFrame(texture);
                } catch (e) {
                    cc.log(e);
                }
            };
            image.src = avatarUrl;
        } catch (e) {
            cc.log(e);
        }

    },
});
