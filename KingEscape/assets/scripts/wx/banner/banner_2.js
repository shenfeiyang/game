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
let PRE_NUM = 4;
cc.Class({
    extends: cc.Component,

    properties: {
        content: cc.Node,
        view: cc.Node,
        item: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

    },

    start() {
        //this.onTouchEvent();
    },
    //touch 移动事件
    onTouchEvent() {
        this.view.on(cc.Node.EventType.TOUCH_START, function (event) {
            this.isClick = true;
            this._time = new Date().getTime();
        }.bind(this), this);
        this.view.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            this.isClick = true;
            if (this.content.width > 640) {
                let pos = event.getLocation();
                let posPre = event.getPreviousLocation();
                let _posx = pos.x - posPre.x;
                if (this.content.x + _posx < -320 && this.content.x + _posx > -this.content.width + 320) {
                    this.content.x += _posx;
                }
            }
        }.bind(this), this)
        this.view.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.isClick = false;
            let _time = new Date().getTime() - this._time
            if (_time < 150) {
                let pos = event.getLocation();
                let _pos = this.content.convertToNodeSpaceAR(pos);
                this.item = this._itemList[Math.floor(_pos.x / this._itemList[0].width)];
                if (this.item) {
                    let self = this;
                    this.clickBtn({
                        node: self.item,
                    });
                }
            }
        }.bind(this), this);
        this.view.on(cc.Node.EventType.TOUCH_CANCEL, function () {
            this.isClick = false;
        }.bind(this), this);
    },
    init(bList, size) {
        let list = [];
        if (bList.length > PRE_NUM) {
            list = this.getNewList(bList);
        } else {
            //小于 N的最小数量 不更新
            if (this._first)
                return;
            list = bList;
        }
        console.log("banner_2", list)
        if (!this._itemList) {
            this._itemList = [];
        }
        let width = 0;
        for (let i = 0; i < list.length; i++) {
            let node = this.createIcon(list[i].url, list[i].appname, i);
            if (node && !this._itemList[i]) {
                this.content.addChild(node);
                node.setPosition(width, 0);
                node['info'] = list[i];
                width += node.width;
                this._itemList.push(node);
            }
        }
        if (!this._first) {
            this.speed = 1;
            this.width = width;
            this.content.width = width;
            // if (this.content.width > 640) {
            //     this.schedule(this.move, 1 / 60);
            // }
            let pre = config.bannerScale;;
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
    //获得新的列表
    getNewList(list) {
        let _list = [];
        let len = list.length - 1;
        let _numMap = [];
        while (true) {
            if (_list.length >= PRE_NUM)
                break;
            let index = Math.floor(Math.random() * len);
            if (!_numMap[index]) {
                _list.push(list[index]);
                _numMap[index] = 1;
            }
        }
        return _list;
    },
    //创建icon ,当前拥有替换icon
    createIcon(url, nameStr, index) {
        let spriteFrame = adc.getSpriteFrame(url);
        if (spriteFrame) {
            let node = this._itemList[index];
            if (!node) {
                node = cc.instantiate(this.item);
                node.anchorX = 0;
                node.addComponent(cc.Button);
                node.on('click', this.clickBtn, this);
            }
            let icon = node.getChildByName('icon');
            let name = node.getChildByName('name').getComponent(cc.Label);
            icon.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            icon.setContentSize(140, 120);
            name.string = nameStr;
            return node;
        }
        return null;
    },
    clickBtn(event) {
        if (this.isClick) return;
        let node = event.node;
        let data = node['info'];
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
    },
    move() {
        if (this.isClick) return;
        if (this.content.x >= -320)
            this._flag = 1;
        else if (this.content.x <= (-this.content.width + 320))
            this._flag = 0;
        let speed = this._flag ? -this.speed : this.speed;
        this.content.x += speed;
    }
    // update (dt) {},
});
