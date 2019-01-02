cc.Class({
    extends: cc.Component,
    properties: {
        rankNumSp: cc.Sprite,
        rankNumStr: cc.Label,
        mask: cc.Mask,
        head: cc.Sprite,
        nick: cc.Label,
        score: cc.Label,
        killNum: cc.Label,
        rankSpArr: [cc.SpriteFrame]
    },

    init(rank, data) {
        let avatarUrl = data.avatarUrl;
        let nick = data.nickname;
        let score = data.KVDataList.length != 0 ? data.KVDataList[0].value : 0;
        let killNum = data.KVDataList.length != 0 ? data.KVDataList[1].value : 0;

        if (rank < 3) {
            this.rankNumSp.active = true;
            this.rankNumStr.active = false;
            this.rankNumSp.spriteFrame = this.rankSpArr[rank];
        } else {
            this.rankNumSp.active = false;
            this.rankNumStr.active = true;
            this.rankNumStr.string = rank + 1 + '';
        }

        this.createImage(avatarUrl);
        this.head.parent = this.mask;
        this.nick.string = nick;
        this.score.string = score.toString();
        this.killNum.string = killNum.toString();
    },

    createImage(avatarUrl) {
        if (CC_WECHATGAME) {
            try {
                let image = wx.createImage();
                image.onload = () => {
                    try {
                        let texture = new cc.Texture2D();
                        texture.initWithElement(image);
                        texture.handleLoadedTexture();
                        this.head.spriteFrame = new cc.SpriteFrame(texture);
                    } catch (e) {
                        cc.log(e);
                    }
                };
                image.src = avatarUrl;
            } catch (e) {
                cc.log(e);
            }
        } else {
            cc.loader.load({
                url: avatarUrl, type: 'jpg'
            }, (err, texture) => {
                this.head.spriteFrame = new cc.SpriteFrame(texture);
            });
        }
    }
});
