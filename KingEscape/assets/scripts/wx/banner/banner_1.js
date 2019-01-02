// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
const adc = require('adc');
const global = require('global');
const preview = require("preview");
const wxAd = require('wxAd');
const config = require('config');
cc.Class({
    extends: cc.Component,

    properties: {
        item: [cc.Node],
        icon: [cc.Sprite],
        gName: [cc.Label],
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },
    init(bList, size) {
        let list = [];
        if (bList.length > this.item.length) {
            list = this.getNewList(bList);
        } else {
            //小于 N的最小数量 不更新
            if (this._first)
                return;
            list = bList;
        }

        for (let i = 0; i < this.item.length; i++) {
            if (list[i]) {
                let spriteFrame = adc.getSpriteFrame(list[i].url);
                if (spriteFrame) {
                    this.icon[i].spriteFrame = spriteFrame;
                    this.gName[i].string = list[i].appname;
                    this.item[i]['info'] = list[i];
                } else {
                    this.item[i].active = false;
                }

            }
            this.item[i].active = list[i] ? 1 : 0;
        }
        if (!this._first) {
            let pre = config.bannerScale;
            let _height = this.node.height * (1 - pre);
            this.node.y -= _height / 2;
            let view = cc.view.getFrameSize();
            if (view.height / view.width >= 1.78) {
                this.node.y += 15;
            }
            this.node.setScale(pre);
            this._first = 1;
        }

    },

    getNewList(list) {
        let _list = [];
        let len = list.length - 1;
        let _numMap = [];
        while (true) {
            if (_list.length >= this.item.length)
                break;
            let index = Math.floor(Math.random() * len);
            if (!_numMap[index]) {
                _list.push(list[index]);
                _numMap[index] = 1;
            }
        }
        return _list;
    },
    clickBtn(event) {
        let data = event.currentTarget['info'];
        if (!data) {
            return;
        }
        const resid = data['id'];
        const jmpid = data['jmpid'];
        var parm = data['parm'];
        parm = parm.indexOf('?') > 0 ? parm : parm + '?';
        parm = parm.indexOf('gender') > 0 ? parm : parm + '&gender=' + global.getGender();
        const share = data['share'];
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            if (jmpid && !wxAd.wxBversionLess("2.2.0"))
                //do some thing;
                wx.navigateToMiniProgram({
                    appId: jmpid,
                    path: parm,
                    success: (res) => {
                        console.log(res);
                    },
                    fail: (res) => {
                        if (adc.checkLink(share) && res.errMsg.indexOf(jmpid) > 0)
                            preview.previewUrlImage(share);
                    }
                });
            else if (adc.checkLink(share))
                preview.previewUrlImage(share);
        }
    }

    // update (dt) {},
});
