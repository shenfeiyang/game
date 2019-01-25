var global = require("global");
var util = require("util");
var config = require("config");
var adtask = require("adtask");
var wxAd = require('wxAd');
var preview = require('preview');

cc.Class({
    extends: cc.Component,

    properties: {
        ban:cc.Node,
        list:cc.Node,
        content:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.rewardImg = new cc.SpriteFrame(cc.url.raw("resources/share/adTask/reward.png"));
    },

    start () {
        
        this.getTaskWallInfo();
    },

    showActive() {
        if(cc.find(global.bannerPath).getComponent("BannerAd")) {
            cc.find(global.bannerPath).getComponent("BannerAd").hide();
        }
        this.node.active = true;
    },

    hideActive() {
        if(cc.find(global.bannerPath).getComponent("BannerAd")) {
            cc.find(global.bannerPath).getComponent("BannerAd").show();
        }
        this.node.active = false;
    },

    createIcon(icon, link) {
        if(!link)
            return;

        cc.loader.load( link, (err, texture) => {
            if (err) {
                cc.log(err);
            }else {
                icon.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            }
        });
    },

    getTaskList(tasks) {
        var self = this;
            var tskList = adtask.getReceive()
                if(tskList) {
                    var hastask = adtask.getHasTask();

                    var hasGet = [];
                    var hasCom = [];
                    let i = 0, k = 0, j = 0;
                    for(i = tasks.length-1; i >= 0; i--) {
                        if(hastask.indexOf(tasks[i].tskid) != -1) {
                            hasGet.push(tasks[i]);
                            tasks.splice(i, 1);
                        }
                    }

                    for(i = tasks.length-1; i >= 0; i--) {
                        if(tskList.indexOf(tasks[i].tskid) != -1) {
                            hasCom.push(tasks[i]);
                            tasks.splice(i, 1);
                        }
                    }


                    for(k = 0; k < hasCom.length; k++) {
                        self.createItem(cc.p(-262, -(k)*148), hasCom[k], tskList.indexOf(hasCom[k].tskid) != -1, hastask.indexOf(hasCom[k].tskid) != -1);
                    }

                    for(i = 0; i < tasks.length; i++) {
                        self.createItem(cc.p(-262, -(i+k)*148), tasks[i], tskList.indexOf(tasks[i].tskid) != -1, hastask.indexOf(tasks[i].tskid) != -1);
                    }

                    for(j = 0; j < hasGet.length; j++) {
                        self.createItem(cc.p(-262, -(j+i+k)*148), hasGet[j], tskList.indexOf(hasGet[j].tskid) != -1, hastask.indexOf(hasGet[j].tskid) != -1);
                    }
                }
    },

    
    createItem(pos, task, accomplished, received) {
        cc.loader.loadRes('plugIn/adtask/item', cc.Prefab, function (er, prefab) {
            var item = cc.instantiate(prefab);
            this.content.addChild(item);
            this.content.height += 148;
            item.setPosition(pos);
            item.name = task.tskid;
            item.getChildByName("name").getComponent(cc.Label).string = task.name;

            item.getChildByName("num").getComponent(cc.Label).string = "X" + config.adTask.getNum(task.tskid)
            item.getChildByName("tip").getComponent(cc.Label).string = task.desc;

            item.getComponent("items").setReward(config.adTask.scale, this.rewardImg);
        
            this.setAccomplishedCallBack(task, item)
            
            item.getComponent("items").setAccomplishedCallBack(function() {
                if(adtask.getHasReceive(task.tskid)) {
                    if(global.taskCall) {
                        global.taskCall(config.adTask.getNum(task.tskid));
                        adtask.addHasTsk(task.tskid);
                        adtask.rewardTask(config.UID, config.getParam().appid, task.tskid);
                        adtask.checkReceive();
                    } else {
                        wx.showModal({
                            title:"提示",
                            content:"领取失败，请稍后再试！"
                        });
                        return;
                    }
                    item.getComponent("items").hideReward();
                    
                    item.getChildByName("accomplish").active = false;
                    item.getChildByName("accomplished").active = false; 
                    item.getChildByName("getreward").active = true;
                }
            }.bind(this));

            if(accomplished) {
                item.getChildByName("getreward").active = false;
                item.getChildByName("accomplish").active = false;
                item.getChildByName("accomplished").active = true;
            }

            if(received) {
                item.getComponent("items").hideReward();
                item.getChildByName("getreward").active = true;
                item.getChildByName("accomplished").active = false;
                item.getChildByName("accomplish").active = false;
            }
            this.createIcon(item.getChildByName("icon").getChildByName("img"), task.icon);
        }.bind(this));
    },
    

    taskHideCall () {
        this.timestamp = new Date().getTime();
    },

    setAccomplishedCallBack(task, item) {
        // var callback = function() {
        //     if(global._canClick)
        //         return;
        //     global._canClick = true;
        //     this.jmp2hezi(task.jmpid, task.parm, task.tskid);
        //     var showCallback1 = function() {
        //         adtask.inTaskList(task.tskid,function() {
        //             adtask.addReceive(task.tskid);
        //             item.getChildByName("getreward").active = false;
        //             item.getChildByName("accomplish").active = false;
        //             item.getChildByName("accomplished").active = true;
        //             adtask.checkReceive();
        //         })
        //         global._canClick = false;
        //         wx.offShow(showCallback1);
        //     }.bind(this);

        //     wx.onShow(showCallback1);
        // }.bind(this);

        var callback = function() {
            if(global._canClick)
                return;
            global._canClick = true;
            this.jmp2hezi(task.jmpid, task.parm, task.tskid);
            var interval = !task.taskSec?30 : parseInt(task.taskSec);
            this.timestamp = new Date().getTime();
            wx.onHide(this.taskHideCall.bind(this));
            this.showCallback = function(){
                this.timestamp = (new Date().getTime() - this.timestamp) / 1000;
                if(this.timestamp > interval) {
                    if(!adtask.hasGetReWard(task.tskid)) {
                        adtask.addReceive(task.tskid);
                        adtask.completeTask(config.UID, config.getParam().appid, task.tskid);
                        item.getChildByName("getreward").active = false;
                        item.getChildByName("accomplish").active = false;
                        item.getChildByName("accomplished").active = true;
                        adtask.checkReceive();
                    };
                } else {
                    if(!adtask.getHasReceive(task.tskid)) {
                        wx.showModal({
                            title:"提示",
                            content:"体验时间不足"
                        });
                    }
                }
                global._canClick = false;
                wx.offHide(this.taskHideCall);
                wx.offShow(this.showCallback);
            }.bind(this);
            
            wx.onShow(this.showCallback);
        }.bind(this);



        if(task.taskCodeUrl && task.taskIsJump == '1') {        //二位码
            callback = function() {
                if(global._canClick)
                    return;
                global._canClick = true;
                var interval = !task.taskSec?30 : parseInt(task.taskSec);
                var timestamp = new Date().getTime();
                preview.previewUrlImage(task.taskCodeUrl);
                this.showCallback = function(){
                    timestamp = (new Date().getTime() - timestamp) / 1000;
                    if(timestamp > interval) {
                        if(!adtask.hasGetReWard(task.tskid)) {
                            adtask.addReceive(task.tskid);
                            adtask.completeTask(config.UID, config.getParam().appid, task.tskid);
                            item.getChildByName("getreward").active = false;
                            item.getChildByName("accomplish").active = false;
                            item.getChildByName("accomplished").active = true;
                            adtask.checkReceive();
                        };
                    } else {
                        if(!adtask.getHasReceive(task.tskid)) {
                            wx.showModal({
                                title:"提示",
                                content:"体验时间不足"
                            });
                        }
                    }
                    global._canClick = false;
                    wx.offShow(this.showCallback);
                }.bind(this);
                wx.onShow(this.showCallback);
            }.bind(this);
        }

        item.getComponent("items").setAccomplishCallBack(callback);
    },


    jmp2hezi(appid, parm, tskid){
        parm = parm.indexOf('gender') > 0 ? parm : parm + '&gender='+ global.getGender();
        parm = parm.indexOf('tskid') > 0 ? parm : parm + '&tskid='+ tskid;
        parm = parm.indexOf('suid') > 0 ? parm : parm + '&suid='+ config.UID;
        parm = parm.indexOf('srcid') > 0 ? parm : parm + '&srcid='+ config.getParam().appid;
        console.log(">>>" + parm);
        if(appid && !wxAd.wxBversionLess("2.2.0") ) {
            //do some things
            wx.navigateToMiniProgram({
                appId: appid,
                path: parm,
                // envVersion: 'trial',
                // envVersion: 'develop',
                success:(res)=>{},
                fail:()=>{
                    global._canClick = false;
                    wx.offShow(this.showCallback);
                    wx.offHide(this.taskHideCall);
                },
            });
        }
    },

    getTaskWallInfo() {       
        var data = adtask.getData();
        if(data && data.length > 0)
            this.getTaskList(data);
    },
});
