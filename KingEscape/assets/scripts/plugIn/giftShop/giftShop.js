// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

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
        money: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

    },

    start() {

    },
    initData(num) {
        this.money.string = num + '礼券';
        this.showActive(this.node);
        //this.node.active = true;
    },
    yhClk() {
        this.showText('当前礼券不足');
    },
    closeClk() {
        this.hideActive(this.node);
        //this.node.active = false;
    },
    showText(_text) {
        var textNode = new cc.Node;
        textNode.addComponent(cc.Label);
        textNode.addComponent(cc.LabelOutline);
        var text = textNode.getComponent(cc.Label);
        //text.string = '+'+((i+1)*2 -1)*5; 
        text.fontSize = 40;
        text.lineHeight = 42;
        textNode.color = cc.color(255, 226, 68, 255);
        var textOutLine = textNode.getComponent(cc.LabelOutline);
        textOutLine.color = cc.color(150, 64, 0, 255);
        textOutLine.width = 2;
        text.string = _text;
        console.log('showText')

        this.node.addChild(textNode);
        textNode.setPosition(0, 100);
        textNode.runAction(cc.sequence(cc.fadeIn(0.3), cc.delayTime(0.3), cc.spawn(cc.moveBy(0.3, cc.v2(0, 100)), cc.fadeOut(0.3)), cc.callFunc(function () {
            textNode.removeFromParent(true);
        }.bind(this))))

    },
    showActive(node, callBack) {
        node.setScale(0.01);
        node.active = true;
        node.runAction(cc.sequence(cc.scaleTo(0.15, 1), cc.callFunc(function () {
            if (callBack && typeof callBack == 'function') callBack();
        })))
    },
    hideActive(node, isParent) {
        node.runAction(cc.sequence(cc.scaleTo(0.1, 0.01), cc.callFunc(function () {
            node.active = false;
            if (isParent) {
                node.setScale(1);
                node.parent.active = false;
            }
        }.bind(node))))
    },

    // update (dt) {},
});
