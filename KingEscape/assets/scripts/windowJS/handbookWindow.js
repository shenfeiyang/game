cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.Node,
        mostLevel: cc.Label,
        item: cc.Node,
        scrolleViewCont: cc.Node
    },

    //进化图鉴弹窗初始化
    init(level, roleData, menu) {
        this.menu = menu;
        this.level = level;
        //屏幕适配
        this.node.width = this.menu.node.width;
        this.node.height = this.menu.node.height;

        this.mostLevel.string = this.level + '/' + roleData.getLength();

        this.content = this.scrollView.getComponent('uiloopscrollview');
        this._list = roleData.data;
        this.initScrollView();
        this.content.setTotalNum(Math.ceil(roleData.getLength() / 4));
        this.content.resetView();

        this.huxiAction();
        this.unschedule(this.huxiAction);
        this.schedule(this.huxiAction, 1);

        this.windowOpenEffect = this.node.getComponent('windowOpenEffect');
        this.windowOpenEffect.showPanel(this.node);

        this.huxiAction();
        this.unschedule(this.huxiAction);
        this.schedule(this.huxiAction, 1);

         //关闭banner广告
         this.menu.bannerAd.hide();
    },

    initScrollView() {
        this.content.registerCreateItemFunc(() => {
            const itemNode = cc.instantiate(this.item);
            itemNode.active = true;
            return itemNode;
        });
        this.content.registerUpdateItemFunc((cell, index) => {
            const offset = index * 4;
            const infos = this._list.slice(offset, offset + 4);
            if (infos.length < 4) {
                for (let i = 0; i < 4; i++) {
                    cell.children[i].active = false;
                }
            }
            for (let i = 0; i < infos.length; i++) {
                var js = cell.children[i].getComponent('handbookItem');
                js.show(offset + i, infos[i], this.level, this.menu);
            }
        });
    },

    //角色呼吸动画
    huxiAction() {
        cc.log('123123123');
        let arr = this.scrolleViewCont.children;
        for (let i = 0; i < this.scrolleViewCont.childrenCount; i++) {
            for (let value of arr[i].children) {
                if (value.getChildByName('role').active) {
                    let action1 = cc.scaleTo(0.5, 0.94, 1.04);
                    let move1 = cc.moveBy(0.5, cc.v2(0, value.getChildByName('role').height * 0.02));
                    let action2 = cc.scaleTo(0.5, 1, 1);
                    let move2 = cc.moveBy(0.5, cc.v2(0, -value.getChildByName('role').height * 0.02));
                    value.getChildByName('role').runAction(cc.sequence(cc.spawn(action1, move1), cc.spawn(action2, move2)));
                }
            }
        }
    },

    //关闭
    closeHandbookWindow() {
        this.windowOpenEffect.closePanel();
        //this.node.parent.removeChild(this.node);

        //按钮音效
        this.menu.audio.onButtonAudio();

         //打开banner广告
         this.menu.bannerAd.show();
    }

});
