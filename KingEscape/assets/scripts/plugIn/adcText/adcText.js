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
var adc = require('adc');
var preview = require('preview');

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        mask: cc.Node,
        showTips: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

        //this._list = [{text:"adfasdf"},{text:'2135sd'}, {text: "aet63fsd3"}];
        this._speed = 1;
        this._textNodeList = [];
        this._colors = [new cc.color(14, 255, 252, 255), new cc.color(255, 136, 38, 255), new cc.color(255, 14, 76, 255), new cc.color(40, 250, 169, 255), new cc.color(254, 216, 57, 255)];


    },

    start() {
        this._list = global.noticeAdInfo;
        console.log("adcText", this._list);
        if (!this._list || this._list.length <= 0) {
            this.node.active = false;
            return;
        } else {
            this.node.active = true;
        }
        this.showTips.runAction(cc.repeatForever(cc.blink(2.4, 3)));
        this._maskSize = this.mask.getContentSize();
        this.addTextNodeList(0);
        this.addTextNodeList(1);

        this._index = 1;

    },
    addTextNodeList(index) {
        let textNode = this.createTextNode();
        this._textSize = textNode.getContentSize();
        this.mask.addChild(textNode);
        //textNode 子节点  下划线
        let textNode2 = this.createTextNode(true);
        textNode.addChild(textNode2);
        textNode['textNode'] = textNode2;

        this._textNodeList.push(textNode);
        textNode.setPosition(this._maskSize.width / 2 + this._textSize.width * (index + 1 / 2), 0);
        if (this._list.length <= index) {
            this.updateTextInfo(textNode, index - 1, this._colors[index - 1]);
        } else {
            this.updateTextInfo(textNode, index, this._colors[index]);
        }

    },
    //创建label
    createTextNode(flag = false) {
        let textNode = new cc.Node();
        textNode.addComponent(cc.Label);
        textNode.addComponent(cc.LabelOutline);
        textNode.setContentSize(330, 54);
        let lab = textNode.getComponent(cc.Label)
        lab.fontSize = 30;
        lab.lineHight = 40;
        let lbol = textNode.getComponent(cc.LabelOutline);
        lbol.color = new cc.color(36, 36, 36, 255);
        lbol.width = 2;
        if (!flag) {
            textNode.addComponent(cc.Button);
            textNode.on('click', this.btnClick, textNode);
        }
        return textNode;
    },
    //更新
    updateTextInfo(node, index, color) {
        node["eventInfo"] = this._list[index];
        let str = this._list[index].text;
        if (str.length > 8) {
            str = str.slice(0, 8);
        }
        node.getComponent(cc.Label).string = str;
        node.color = color;
        //更新下划线
        let nodeText = node.textNode;
        this.updateNodeText(nodeText, str, color);
    },
    updateNodeText(node, str, color) {

        let _str = '';
        let num = str.length;
        if (num > 6) {
            num += 6;
        } else if (num > 4) {
            num += 4;
        } else {
            num += 3;
        }
        for (let i = 0; i < num; i++) {
            _str += '_'
        }
        node.getComponent(cc.Label).string = _str;
        node.setPosition(0, node.y);
        node.color = color;
    },
    btnClick(event) {
        let node = event.getCurrentTarget();
        //console.log(node.eventInfo);

        if (!node.eventInfo) return;
        const appid = node.eventInfo['jmpid'];
        var parm = node.eventInfo['parm'] || '';
        parm = parm.indexOf('?') > 0 ? parm : parm + '?';
        parm = parm.indexOf('gender') > 0 ? parm : parm + '&gender=' + global.getGender();
        const share = node.eventInfo['url'];
        console.log("parm", parm);
        if (!global.wxBversionLess("2.2.0"))
            //do some thing;
            wx.navigateToMiniProgram({
                appId: appid,
                path: parm,
                success: (res) => { },
                fail: (res) => {
                    if (adc.checkLink(share) && res.errMsg.indexOf(appid) > 0)
                        preview.previewUrlImage(share);
                }
            });
    },
    update(dt) {
        for (let i = 0; i < this._textNodeList.length; i++) {
            let pos = this._textNodeList[i].getPosition();
            if (pos.x < -(this._maskSize.width / 2 + this._textSize.width / 2)) {
                pos.x = (this._maskSize.width / 2 + this._textSize.width / 2);
                this._index += 1;
                this._index = this._index % this._list.length;
                this.updateTextInfo(this._textNodeList[i], this._index, this._colors[this._index % 5]);
                this._textNodeList[i].setPosition(pos.x, pos.y);
            } else {
                this._textNodeList[i].setPosition(pos.x - this._speed, pos.y);
            }

        }
    },
});