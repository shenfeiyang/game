
cc.Class({
    extends: cc.Component,

    properties: {

    },

    yanwu(completeCallback) {  //动态加载龙骨
        let self = this;
        cc.loader.loadResDir('dragonBones/yanwu', function (err, assets) {
            let animationDisplay = self.node.getComponent(dragonBones.ArmatureDisplay);

            if (err || assets.length <= 0) return;
            assets.forEach(asset => {
                if (asset instanceof dragonBones.DragonBonesAsset) {
                    animationDisplay.dragonAsset = asset;
                }
                if (asset instanceof dragonBones.DragonBonesAtlasAsset) {
                    animationDisplay.dragonAtlasAsset = asset;
                }
            });

            animationDisplay.armatureName = 'dataoshayanwu';
            animationDisplay.playAnimation('newAnimation', 0);
            if (completeCallback) {
                animationDisplay.addEventListener(dragonBones.EventObject.COMPLETE, completeCallback);
            }
        })
    }
});
