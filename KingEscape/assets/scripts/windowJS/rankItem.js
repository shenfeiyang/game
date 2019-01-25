
cc.Class({
    extends: cc.Component,

    properties: {
        rankNumSp: cc.Sprite,
        rankNumStr: cc.Label,
        head: cc.Sprite,
        nick: cc.Label,
        score: cc.Label,
        rankNumImg: [cc.SpriteFrame],
    },

    show(index, info) {
        if (index < 3) {
            this.rankNumSp.node.active = true;
            this.rankNumStr.node.active = false;
            this.rankNumSp.spriteFrame = this.rankNumImg[index];
        } else {
            this.rankNumSp.node.active = false;
            this.rankNumStr.node.active = true;
            this.rankNumStr.string = index + 1;
        }

        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            if (info[0].name == '未知') {
                this.createImage(info[0].avatarUrl, this.head);
            } else {
                this.createWXImage(info[0].avatarUrl, this.head);
            }
        } else {
            this.createImage(info[0].avatarUrl, this.head);
        }

        this.nick.string = info[0].name;
        this.score.string = info[0].score;
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
