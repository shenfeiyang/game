cc.Class({
    extends: cc.Component,
    properties: {
        avatar: cc.Sprite,
        nickLabel: cc.Label,
        scoreLabel: cc.Label
    },
    start() {

    },

    init(data, isPlayer) {
        let avatarUrl = data.avatarUrl;
        let nick = data.nickname.length <= 4 ? data.nickname : data.nickname.substr(0, 4) + "...";
        //let nick = data.nickname;
        let grade = data.KVDataList.length != 0 ? data.KVDataList[0].value : 0;

        if (isPlayer) {
            this.nickLabel.node.color = new cc.Color(247, 75, 73, 255);
        }else{
            this.nickLabel.node.color = new cc.Color(250, 171, 50, 255);
        }

        this.createImage(avatarUrl);
        this.nickLabel.string = nick;
        this.scoreLabel.string = grade.toString();
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
                        this.avatar.spriteFrame = new cc.SpriteFrame(texture);
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
                this.avatar.spriteFrame = new cc.SpriteFrame(texture);
            });
        }
    }

});
