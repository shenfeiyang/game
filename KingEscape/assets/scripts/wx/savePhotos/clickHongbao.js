// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var config = require('config');


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

    // onLoad () {},

    start() {

    },

    //点击红包的按钮功能，50%的概率随机出现两个页面中的一个
    hongbaoBtn: function () {



        var randomNum = Math.random() * 10;
        randomNum = Math.floor(randomNum) % 2;
        if (randomNum == 0) {
            cc.loader.loadRes("plugIn/savePhotos/toCustomerSerPage", cc.Prefab, function (err, prefab) {
                if (err) {
                    console.error(err)
                    return;
                }
                var newNode = cc.instantiate(prefab);
                var parent = cc.find("Canvas");
                parent.addChild(newNode);

            })
            console.log(randomNum);
        } else {
            cc.loader.loadRes("plugIn/savePhotos/rmbHongbaoOfficalAccount", cc.Prefab, function (err, prefab) {
                if (err) {
                    console.error(err)
                    return;
                }
                var newNode = cc.instantiate(prefab);
                var parent = cc.find("Canvas");
                parent.addChild(newNode);

            })
        }

    },

    mysteriousNewGameBtn: function () {
        var randomNewNum = Math.random() * 10;
        randomNewNum = Math.floor(randomNewNum) % 2;
        if (randomNewNum == 0) {
            cc.loader.loadRes("plugIn/savePhotos/toNewGameCustomerSerPage", cc.Prefab, function (err, prefab) {
                if (err) {
                    console.error(err)
                    return;
                }
                var newNode = cc.instantiate(prefab);
                var parent = cc.find("Canvas");
                parent.addChild(newNode);

            })
            console.log(randomNewNum);
        } else {
            cc.loader.loadRes("plugIn/savePhotos/mysteriousNewGameOfficalAccount", cc.Prefab, function (err, prefab) {
                if (err) {
                    console.error(err)
                    return;
                }
                var newNode = cc.instantiate(prefab);
                var parent = cc.find("Canvas");
                parent.addChild(newNode);

            })
        }


    }



    // update (dt) {},
});