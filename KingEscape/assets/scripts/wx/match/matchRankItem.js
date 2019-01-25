// var this = null;

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // this = this;
    },

    start () {

    },

    init (data, index) {
        this.rankLb = cc.find('rank', this.node).getComponent(cc.Label);
        this.nameLb = cc.find('name', this.node).getComponent(cc.Label);
        this.avatar = cc.find('mask/image', this.node).getComponent(cc.Sprite);
        this.gradeLb = cc.find('star/grade', this.node).getComponent(cc.Label);

        this.rankLb.string = '第' + (index + 4) + '名';
        this.nameLb.string = data.name || '';
        this.gradeLb.string = data.score || 0;

        //获取人物头像
        var self = this;
        var texture = data.portrait;
        if (!texture) {
            return;
        }
        texture = texture.split("/0", 1);
        texture = texture + "/64";
        cc.loader.load({ url: texture, type: 'png' }, function (err, texture) {
            //console.log("loadUrl",texture instanceof cc.Texture2D)
            var spriteFrame = new cc.SpriteFrame();
            spriteFrame.setTexture(texture);
            self.avatar.spriteFrame = spriteFrame;
        });
    }

    // update (dt) {},
});
