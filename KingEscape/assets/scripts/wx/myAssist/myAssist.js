var self = null;
var myAssist = cc.Class({
    statics: {
        instance: null,
        getInstance: function () {
            if (myAssist.instance == null) {
                myAssist.instance = new myAssist();
            }
            return myAssist.instance;
        }
    },

    ctor: function () {
        self = this;
    },

    loadMoreGameLayer: function (target, name) {
        cc.loader.loadRes("plugIn/more/moreGameLayer", cc.Prefab, function (err, prefab) {
            if (err) {
                console.error(err)
                return;
            }
            var rankWidget = cc.instantiate(prefab);
            target.node.addChild(rankWidget);
            rankWidget.setPosition(cc.v2(0, 0))

            rankWidget.active = false;
            console.log("rankWidget", rankWidget.getPosition());
            name = name || "moreGameLayer";
            target[name] = rankWidget;

        })
    },
    loadBannerLayer: function (target, name, cb) {
        cc.loader.loadRes("wx/banner/Banner", cc.Prefab, function (err, prefab) {
            if (err) {
                console.error(err)
                return;
            }
            var rankWidget = cc.instantiate(prefab);
            target.node.addChild(rankWidget);

            const targetSize = target.node.getContentSize();
            const ax = target.node.anchorX;
            const ay = target.node.anchorY;
            //居中贴底
            const dx = (0.5 - ax) * targetSize.width;
            const dy = -ay * targetSize.height;
            rankWidget.setPosition(cc.v2(dx, dy));;
            //console.log("widget pos", rankWidget.getPosition(), ax, ay, dx, dy, targetSize);

            //rankWidget.active = true;
            name = name || "bannerNode";
            target[name] = rankWidget;
            if (typeof cb == "function") cb();

        })
    },
    loadBannerLayerNew: function (target, name, cb) {
        cc.loader.loadRes(("wx/banner/" + name), cc.Prefab, function (err, prefab) {
            if (err) {
                console.error(err)
                return;
            }
            var rankWidget = cc.instantiate(prefab);
            target.node.addChild(rankWidget);

            const targetSize = target.node.getContentSize();
            const ax = target.node.anchorX;
            const ay = target.node.anchorY;
            //居中贴底
            const dx = (0.5 - ax) * targetSize.width;
            let dy = -ay * targetSize.height;
            dy += rankWidget.height / 2;
            rankWidget.setPosition(cc.v2(dx, dy));;
            //console.log("widget pos", rankWidget.getPosition(), ax, ay, dx, dy, targetSize);

            //rankWidget.active = true;
            name = "bannerNode";
            target[name] = rankWidget;
            if (typeof cb == "function") cb();

        })
    },
})