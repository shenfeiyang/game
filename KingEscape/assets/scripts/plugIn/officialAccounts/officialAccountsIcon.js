// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var global = require('global');

cc.Class({
    extends: cc.Component,

    properties: {
        officialAccountShow: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._cfgInfo = global.getLoginCfgByKey('vpnaFlag');
        let blob = cc.sys.localStorage.getItem('blob');
        if (blob) {
            blob = JSON.parse(blob);
        }
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            let launchInfo = wx.getLaunchOptionsSync();
            this.wxOnShow();
            console.log('vpnaFlag+++++++++++++++', this._cfgInfo, blob);
            if (!this._cfgInfo || !parseInt(this._cfgInfo.flag) || launchInfo.query['vpnaFlag'] || (blob && blob['vpnaFlag'])) {
                this.node.active = false;
                return;
            }
        }
        this.node.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.3, 0.95), cc.scaleTo(0.6, 1.05), cc.scaleTo(0.3, 1))))

    },
    wxOnShow() {
        wx.onShow(function (res) {
            let launchInfo = res;
            if (launchInfo.query['vpnaFlag']) {
                this.node.active = false;
            }
        }.bind(this))
    },
    start() {

    },

    clickBtn() {
        if (!this._showVpn) {
            this.createShowVpn();
        }
        if (this._showVpn && !this._showVpn.active) {
            this._showVpn.scale = 0.01;
            this._showVpn.active = true;
            this._showVpn.runAction(cc.scaleTo(0.15, 1));
        }
    },
    createShowVpn() {
        let self = this;
        this._showVpn = cc.instantiate(this.officialAccountShow);
        this._showIcon = this._showVpn.getChildByName('icon');
        if (this._cfgInfo.picurl) {
            cc.loader.load({ url: this._cfgInfo.picurl, type: 'png' }, (err, texture) => {
                if (err) {
                    cc.log(err);
                } else {
                    console.log('createShowVpn', self._showIcon, texture);
                    self._showIcon.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                }
            });
        }
        let btn = this._showVpn.getChildByName('btn');
        btn.on('click', this.closeVpn, this);
        let canvas = cc.find('Canvas');
        canvas.addChild(this._showVpn);
    },
    closeVpn() {
        this._showIcon.runAction(cc.sequence(cc.scaleTo(0.15, 0.01), cc.callFunc(function () {
            this._showVpn.active = false;
            this._showIcon.scale = 1;
        }.bind(this))))
    }
    // update (dt) {},
});
