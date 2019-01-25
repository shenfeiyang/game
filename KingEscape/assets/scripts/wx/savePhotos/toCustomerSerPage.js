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
    },


    //是否进入客服接口的确认按钮，点击后进入客服接口，参数可为空，具体参数如下
    //https://developers.weixin.qq.com/minigame/dev/document/open-api/customer-message/wx.openCustomerServiceConversation.html



    onBtnSure() {
        this.sessionData = "fengsijl";
        let dataPage = {
            testData: "getTest",
        };
        dataPage.sessionFrom = this.sessionData;
        dataPage.success = this.success();
        dataPage.showMessageCard = true;
        console.log(this._wxAddLayer);
        this._wxAddLayer.goCustomerServicePage(dataPage);
    },


    success: function() {

        console.log("Success");
    },
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        this._wxAddLayer = cc.find("Canvas").getComponent("wxAddLayer");
    },


    disShow: function() {
        this.node.active = false;

    }

    // update (dt) {},
});