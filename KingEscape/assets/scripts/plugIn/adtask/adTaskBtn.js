var util = require("util");
var config = require("config");
var adtask = require("adtask");
var global = require("global");

cc.Class({
    extends: cc.Component,

    properties: {
        reddian: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            // this.setHasTask();
            this.getTaskInfo();
            this.setReceiveCall();
        }
        const walk = cc.repeatForever(
            cc.sequence(
                cc.delayTime(0.2),
                cc.scaleTo(0.3, 1.3, 1.3),
                cc.scaleTo(0.2, 1.0, 1.0),
                cc.delayTime(0.5),
            ));
        this.node.runAction(walk);
    },

    setHasTask() {
        var haskTask= cc.find("Canvas").getComponent("wxAddLayer").getBlob().hastask;
        if(!haskTask) 
            haskTask = [];
        adtask.setHasTask(haskTask);
    },

    setReceiveCall() {
        var self = this;
        global.receiveCall1 = function() {
            self.reddian.active = true;
        };

        global.receiveCall2 = function() {
            self.reddian.active = false;
        };
    },

    showTaskLayer() {
        cc.find("Canvas").getComponent("wxAddLayer").showTaskLayer();
    },

    getTaskList() {
        var self = this;
        util.request({
            url: config.base_url + "/adc/getTaskList",
            data: {
                appid:config.getParam().appid,
                uid:config.UID
            },
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            method: 'POST',
            success: res => {
                if(res.data.tskList) {  //已完成的任务
                    adtask.setReceive(res.data.tskList);
                }
                if(res.data.rwdList) {  //已领取的任务
                    adtask.setHasTask(res.data.rwdList);
                }
                adtask.checkReceive();  //检测是否有可领取的任务
            }, fail: res => {
                console.log("报错了");
            }
        })
    },



    getTaskInfo() {     //请求任务列表
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
                        self.getTaskList();
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
