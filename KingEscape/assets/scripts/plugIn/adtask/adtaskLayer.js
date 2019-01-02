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

    setWxAddLayer(wxAddLayer) {
        this.wxAddLayer = wxAddLayer;
    },

    onLoad () {
        // const dx = this.btn2.parent.convertToWorldSpaceAR(this.btn2.getPosition()).x - this.btn.parent.convertToWorldSpaceAR(this.btn.getPosition()).x;
        // this._left = cc.p(this.list.getPosition().x - dx, this.list.getPosition().y);
        // this._right = this.list.getPosition();
        this.rewardImg = new cc.SpriteFrame(cc.url.raw("resources/share/adTask/reward.png"));
    },

    start () {
        // this.list.setPosition(this._left);
        // this.ban.active = false;
        // this.list.active = false;
        // const walk = cc.repeatForever(
        //     cc.sequence(
        //         cc.delayTime(0.2),
        //         cc.scaleTo(0.3, 1.3, 1.3),
        //         cc.scaleTo(0.2, 1.0, 1.0),
        //         cc.delayTime(0.5),
        //     ));
        // this.btn.runAction(walk);
        // this._clicking = false;

        
        this.getTaskWallInfo();
    },

    moreGame() {
        this.wxAddLayer.moreGame();
    },

    showActive() {
        if(cc.find("Canvas").getComponent("BannerAd")) {
            cc.find("Canvas").getComponent("BannerAd").hide();
        }
        this.node.active = true;
    },

    hideActive() {
        if(cc.find("Canvas").getComponent("BannerAd")) {
            cc.find("Canvas").getComponent("BannerAd").startLoop();
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
        util.request({
            url: config.base_url + "/adc/getTaskList",
            data: {
                appid:config.getParam().appid,
                uid:config.UID
            },
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            method: 'POST',
            success: res => {
                if(res.data.tskList) {
                    const tskList = res.data.tskList;
                    var blob = self.wxAddLayer.getBlob();
                    if(!blob || !blob.hastask) {
                        blob = {};
                        blob.hastask = [];
                    }
                    var hasGet = [];
                    var hasCom = [];
                    let i = 0, k = 0, j = 0;
                    for(i = tasks.length-1; i >= 0; i--) {
                        if(blob.hastask.indexOf(tasks[i].tskid) != -1) {
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
                        self.createItem(cc.p(-262, -(k)*148), hasCom[k], tskList.indexOf(hasCom[k].tskid) != -1, blob.hastask.indexOf(hasCom[k].tskid) != -1);
                    }

                    for(i = 0; i < tasks.length; i++) {
                        self.createItem(cc.p(-262, -(i+k)*148), tasks[i], tskList.indexOf(tasks[i].tskid) != -1, blob.hastask.indexOf(tasks[i].tskid) != -1);
                    }

                    for(j = 0; j < hasGet.length; j++) {
                        self.createItem(cc.p(-262, -(j+i+k)*148), hasGet[j], tskList.indexOf(hasGet[j].tskid) != -1, blob.hastask.indexOf(hasGet[j].tskid) != -1);
                    }
                } else {
                    self.taskList = [];
                }
            }, fail: res => {
                console.log("报错了");
            }
        })
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
                var blob = this.wxAddLayer.getBlob();
                if(!blob || !blob.hastask) {
                    blob = {};
                    blob.hastask = [];
                }
                if(blob.hastask.indexOf(task.tskid) < 0) {
                    if(global.taskCall) {
                        global.taskCall(config.adTask.getNum(task.tskid));
                    } else {
                        wx.showModal({
                            title:"提示",
                            content:"领取失败，请稍后再试！"
                        });
                        return;
                    }
                    blob.hastask.push(task.tskid);
                    this.wxAddLayer.setBlob(blob);
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
                item.getChildByName("getreward").active = true;
                item.getChildByName("accomplished").active = false;
                item.getChildByName("accomplish").active = false;
            }
            this.createIcon(item.getChildByName("icon").getChildByName("img"), task.icon);
        }.bind(this));
    },setAccomplishedCallBack(task, item) {
        var callback = function() {
            this.jmp2hezi(task.jmpid, task.parm, task.tskid);
            var showCallback1 = function(res) {
                adtask.inTaskList(task.tskid,function() {
                    item.getChildByName("getreward").active = false;
                    item.getChildByName("accomplish").active = false;
                    item.getChildByName("accomplished").active = true;
                })
                wx.offShow(showCallback1);
            }.bind(this);

            wx.onShow(showCallback1);
        }.bind(this);

        if(task.taskIsJump == '1' && task.taskCodeUrl) {
            callback = function() {
                var interval = !task.taskIsJump?30 : parseInt(task.taskSec);
                var timestamp = new Date().getTime();
                preview.previewUrlImage(task.taskCodeUrl);
                var showCallback2 = function(res){
                    timestamp = (new Date().getTime() - timestamp) / 1000;
                    if(timestamp > interval) {
                        adtask.completeTask(config.UID, config.getParam().appid, task.tskid);
                        item.getChildByName("getreward").active = false;
                        item.getChildByName("accomplish").active = false;
                        item.getChildByName("accomplished").active = true;
                    }
                    wx.offShow(showCallback2);
                }.bind(this);
                wx.onShow(showCallback2);
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
                envVersion: 'trial',
                // envVersion: 'develop',
                success:(res)=>{},
            });
        }
    },

    getTaskWallInfo() {
        // var self = this;
        // util.request({
        //     url: config.base_url + "/adc/getTaskWallInfo",
        //     data: {
        //         appid:config.getParam().appid,
        //     },
        //     header: { 'content-type': 'application/x-www-form-urlencoded' },
        //     method: 'POST',
        //     success: res => {
        //         if(res.data.taskList) {
        //             const length = res.data.taskList.length;

        //             if(length <= 0) {
        //                 self.node.active = false;
        //                 return;
        //             }
        var data = adtask.getData();
        if(data && data.length > 0)
                this.getTaskList(data);
                    
                // }
        //     }, fail: res => {
        //         console.log("报错了");
        //     }
        // })
    },

    // click(){
    //     console.log(this._clicking);
    //     if(this._clicking) return;
    //     this._clicking = true;
    //     const right = this.list.active;
    //     const show = (is)=>{
    //         this.list.active = !!is;
    //         this.ban.active = !!is;
    //         this.btn.active = !is;
    //     };
    //     const start = ()=>!right ? show(true) : null;
    //     const end = cc.callFunc( ()=>{this._clicking = false;right ? show(false) : null}, this, 0);
    //     const walk = cc.sequence(
    //         //cc.delayTime(0.2),
    //         cc.moveTo(0.5, right? this._left : this._right),
    //         end
    //     );
    //     this.list.stopAllActions();
    //     start();
    //     this.list.runAction(walk);
    // },
});
