
cc.Class({
    extends: cc.Component,

    properties: {

    },

    die(callback) {
        let self = this;
        cc.loader.loadRes('spine/siwang', sp.SkeletonData, function (err, res) {
            let spine = self.getComponent(sp.Skeleton);
            spine.skeletonData = res;
            let track = spine.setAnimation(0, 'animation', false);
            if (track) {
                // 注册动画的结束回调
                spine.setCompleteListener((trackEntry, loopCount) => {
                    let name = trackEntry.animation ? trackEntry.animation.name : '';
                    if (name === 'animation' && callback) {
                        callback(); // 动画结束后执行自己的逻辑
                    }
                    self.node.parent.removeChild(self.node);
                });
            }
        });
    },

    roleHuxi(atta){
        let self = this;
        cc.loader.loadRes('spine/Huxi', sp.SkeletonData, function (err, res) {
            let spine = self.getComponent(sp.Skeleton);
            spine.skeletonData = res;
            spine.setAnimation(0, 'animation', true);
            let slot = spine.findSlot('baiqi');
            slot.setAttachment(atta);
        });
    },

    startGame(callback){
        let self = this;
        cc.loader.loadRes('spine/zhandoukaishi', sp.SkeletonData, function (err, res) {
            let spine = self.getComponent(sp.Skeleton);
            spine.skeletonData = res;
            let track = spine.setAnimation(0, 'animation', false);
            if (track) {
                // 注册动画的结束回调
                spine.setCompleteListener((trackEntry, loopCount) => {
                    let name = trackEntry.animation ? trackEntry.animation.name : '';
                    if (name === 'animation' && callback) {
                        callback(); // 动画结束后执行自己的逻辑
                    }
                    self.node.parent.removeChild(self.node);
                });
            }
        });
    },

    levelUp(callback){
        let self = this;
        cc.loader.loadRes('spine/shengji', sp.SkeletonData, function (err, res) {
            let spine = self.getComponent(sp.Skeleton);
            spine.skeletonData = res;
            let track = spine.setAnimation(0, 'animation', false);
            if (track) {
                // 注册动画的结束回调
                spine.setCompleteListener((trackEntry, loopCount) => {
                    let name = trackEntry.animation ? trackEntry.animation.name : '';
                    if (name === 'animation' && callback) {
                        callback(); // 动画结束后执行自己的逻辑
                    }
                    self.node.parent.removeChild(self.node);
                });
            }
        });
    }
});
