
module.exports = {

    loadShowModal(target, callbacks) {
        cc.loader.loadRes("plugIn/showModal/showModal", cc.Prefab, function (err, prefab) {
            if (err) {
                console.error(err)
                return;
            }
            var preNode = cc.instantiate(prefab);
            target.node.addChild(preNode);
            preNode.setPosition(0, 0);
            target['_showModalNode'] = preNode;
            if (callbacks && typeof callbacks == 'function') callbacks();
        })
    },


};
