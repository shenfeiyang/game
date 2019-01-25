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
        titleLb: cc.Label,
        contentLb: cc.Label,
        failNode: cc.Node,
        sureNode: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },

    init(content, success, fail, showCancel = false, title = '') {
        this.node.active = true;
        this.contentLb.string = content;
        this.titleLb.string = title;

        this.failNode.active = showCancel;

        this.success = success;
        this.fail = fail;
        if (!showCancel) {
            this.sureNode.setPosition(0, this.sureNode.y);
        } else {
            this.sureNode.setPosition(120, this.sureNode.y);
        }
    },
    failBtn() {
        this.node.active = false;
        if (this.fail && typeof this.fail == 'function') this.fail();
    },
    sureBtn() {
        this.node.active = false;
        if (this.success && typeof this.success == 'function') this.success();
    }
    // update (dt) {},
});
