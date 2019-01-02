var util = require("util");
var config = require("config");
var adtask = require("adtask");

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

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            this.getTaskInfo();
        }
    },

    showTaskLayer() {
        cc.find("Canvas").getComponent("wxAddLayer").showTaskLayer();
    },

    getTaskInfo() {
        var self = this;
        util.request({
            url: config.base_url + "/adc/getTaskWallInfo",
            data: {
                appid:config.getParam().appid,
            },
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            method: 'POST',
            success: res => {
                if(res.data.taskList) {
                    let length = res.data.taskList.length;

                    if(length <= 0)
                        self.node.active = false;
                    else {
                        adtask.setData(res.data.taskList);
                    }
                    
                } else {
                    self.node.active = false;
                }
            }, fail: res => {
                console.log("报错了");
            }
        })
    }


    // update (dt) {},
});
