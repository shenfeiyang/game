var config = require('config');
const adc = require("adc");
const defaultUrls = config.officalAccount.urls;

const previewImage = function () {
    //const moreInfo = [];
    const moreInfo = adc.getMoreInfo();
    console.log(moreInfo);
    var urls = (Array.isArray(moreInfo) && moreInfo.length > 0) ? moreInfo.map((info) => info.url) : defaultUrls;
    var url = urls[Math.floor(Math.random() * (urls.length))];
    var temp = [url]; //切换为[url]
    wx.previewImage({
        // current: this.data.imgalist, // 当前显示图片的http链接    
        urls: temp // 需要预览的图片http链接列表   
    })
}

const previewUrlImage = function (url) {
    var temp = [url]; //切换为[url]
    wx.previewImage({
        // current: this.data.imgalist, // 当前显示图片的http链接    
        urls: temp // 需要预览的图片http链接列表   
    })
}

const loadRes = function () {
    var width = config.officalAccount.width;
    var deviation = (640 - width) * 0.5;
    cc.loader.loadRes("plugIn/savePhotos/officalBtn", cc.Prefab, function (err, prefab) {
        if (err) {
            console.error(err)
            return;
        }
        var newNode = cc.instantiate(prefab);
        var canvas = cc.find("Canvas");
        canvas.addChild(newNode);
        if (config.officalAccount.direction == "left") {
            newNode.x = -(280 - deviation);
        } else {
            newNode.x = 280 - deviation;
        }
        newNode.y = (config.officalAccount.percent - 0.5) * config.officalAccount.height;
        var bigger = cc.scaleBy(3, 2);
        // var smaller=bigger.reverse();
        var seq = cc.repeat(
            cc.sequence(
                cc.moveBy(0.5, 30, 0),
                cc.moveBy(0.5, -30, 0),
                cc.scaleBy(0.4, 1.2),
                cc.scaleBy(0.4, 0.8)
            ), 1);
        newNode.runAction(seq);
    })
}

const officalAccLoad = function () {
    cc.loader.loadRes("plugIn/savePhotos/officalAccount", cc.Prefab, function (err, prefab) {
        if (err) {
            console.error(err)
            return;
        }
        var newNode = cc.instantiate(prefab);
        var canvas = cc.find("Canvas");
        canvas.addChild(newNode);
    })
}

const loadRmbHongbaoRes = function () {

    let windowSize = cc.view.getVisibleSize();
    var width = windowSize.width;
    var deviation = (640 - width) * 0.5;
    cc.loader.loadRes("plugIn/savePhotos/rmbHongbaoBtn", cc.Prefab, function (err, prefab2) {
        if (err) {
            console.error(err)
            return;
        }
        var newNode = cc.instantiate(prefab2);
        var canvas = cc.find("Canvas");
        canvas.addChild(newNode);


        if (config.rmbHongbaoConfig.direction == "left") {
            newNode.x = -(268 - deviation);
        } else {
            newNode.x = 268 - deviation;
        }


        newNode.y = (config.rmbHongbaoConfig.percentHeight - 0.5) * windowSize.height;
        //var bigger = cc.scaleBy(3, 2);
        //var smaller = bigger.reverse();
        var seq = cc.sequence(cc.rotateBy(0.25, 15), cc.rotateBy(0.5, -30), cc.rotateBy(0.25, 15));
        var seq1 = cc.repeatForever(seq);
        newNode.runAction(seq1);
    })


}


const loadmysteriousNewGameRes = function () {

    let windowSize = cc.view.getVisibleSize();
    var width = windowSize.width;
    var deviation = (640 - width) * 0.5;
    cc.loader.loadRes("plugIn/savePhotos/mysteriousNewGameBtn", cc.Prefab, function (err, prefab2) {
        var newNode = cc.instantiate(prefab2);
        var canvas = cc.find("Canvas");
        canvas.addChild(newNode);


        if (config.mysteriousNewGameConfig.direction == "left") {
            newNode.x = -(268 - deviation);
        } else {
            newNode.x = 268 - deviation;
        }


        newNode.y = (config.mysteriousNewGameConfig.percentHeight - 0.5) * windowSize.height;
        //var bigger = cc.scaleBy(3, 2);
        //var smaller = bigger.reverse();
        var seq = cc.sequence(cc.rotateBy(0.25, 15), cc.rotateBy(0.5, -30), cc.rotateBy(0.25, 15));
        var seq1 = cc.repeatForever(seq);
        newNode.runAction(seq1);
    })


}


const loadFullScreenAdv = function () {
    cc.loader.loadRes("plugIn/fullScreenAdv/fullSreenAdv", cc.prefab, function (err, advPrefab) {

        var newPre = cc.instantiate(advPrefab);
        var canvas = cc.find("Canvas");
        canvas.addChild(newPre);

    })
}


module.exports = {
    previewImage: previewImage,
    previewUrlImage: previewUrlImage,
    loadRes: loadRes,
    officalAccLoad: officalAccLoad,
    loadRmbHongbaoRes: loadRmbHongbaoRes,
    loadmysteriousNewGameRes: loadmysteriousNewGameRes,
    loadFullScreenAdv: loadFullScreenAdv,
}