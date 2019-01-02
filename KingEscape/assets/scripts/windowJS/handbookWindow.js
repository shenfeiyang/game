cc.Class({
    extends: cc.Component,

    properties: {
        handbookCont: cc.Node,
        mostLevel: cc.Label,
        unlocked: cc.Prefab,
        locked: cc.Prefab,
    },

    //进化图鉴弹窗初始化
    init(level, roleData, menu) {
        this.menu = menu;
        this.level = level;
        //屏幕适配
        this.node.width = this.menu.node.width;
        this.node.height = this.menu.node.height;

        this.node.active = true;
        this.handbookCont.removeAllChildren();
        this.handbookCont.height = 0;
        this.mostLevel.string = this.level + '/' + roleData.getLength();
        for (let i = 0; i < roleData.getLength(); i++) {
            if (i < this.level) {
                let unlocked = cc.instantiate(this.unlocked);
                let nameArr = roleData.get(i + 1).name.split('');
                let nameStr = '';
                let role = roleData.get(i + 1).modle.toString();
                let weapon = roleData.get(i + 1).weapon.toString();
                for (let i = 0; i < nameArr.length - 1; i++) {
                    nameStr += (nameArr[i] + '\n');
                }
                unlocked.getChildByName('roleName').getComponent(cc.Label).string = nameStr + nameArr[nameArr.length - 1];

                let roleSp = menu.findRoleSp(role);
                unlocked.getChildByName('role').getComponent(cc.Sprite).spriteFrame = roleSp;
                unlocked.getChildByName('role').width = 100;
                unlocked.getChildByName('role').height = roleSp.getOriginalSize().height * (100 / roleSp.getOriginalSize().width);

                unlocked.getChildByName('shadow').x = unlocked.getChildByName('role').x;
                unlocked.getChildByName('shadow').y = unlocked.getChildByName('role').y - unlocked.getChildByName('role').height / 2 + 15;

                let weaponSp = menu.findWeaponSp(weapon);
                unlocked.getChildByName('weapon').getComponent(cc.Sprite).spriteFrame = weaponSp;
                unlocked.getChildByName('weapon').width = 60;
                unlocked.getChildByName('weapon').height = 118;
                unlocked.getChildByName('level').getComponent(cc.Label).string = (i + 1) + '';
                this.handbookCont.addChild(unlocked);
            } else {
                let locked = cc.instantiate(this.locked);
                locked.getChildByName('level').getComponent(cc.Label).string = (i + 1) + '';
                this.handbookCont.addChild(locked);
            }
        }

        let lineNum = Math.ceil(roleData.getLength() / 4);
        let contentLayout = this.handbookCont.getComponent(cc.Layout);
        this.handbookCont.height = lineNum * (this.locked.data.height + contentLayout.spacingY) + contentLayout.paddingTop + contentLayout.paddingBottom;

        this.huxiAction();
        this.unschedule(this.huxiAction);
        this.schedule(this.huxiAction, 1);

        // this.windowOpenEffect = this.node.getComponent('windowOpenEffect');
        // this.windowOpenEffect.showPanel(this.node);
    },

    //角色呼吸动画
    huxiAction() {
        let arr = this.handbookCont.children;
        for (let i = 0; i < this.handbookCont.childrenCount; i++) {
            if (i < this.level) {
                let action1 = cc.scaleTo(0.5, 0.94, 1.04);
                let move1 = cc.moveBy(0.5, cc.v2(0, arr[i].getChildByName('role').height * 0.02));
                let action2 = cc.scaleTo(0.5, 1, 1);
                let move2 = cc.moveBy(0.5, cc.v2(0, -arr[i].getChildByName('role').height * 0.02));
                arr[i].getChildByName('role').runAction(cc.sequence(cc.spawn(action1, move1), cc.spawn(action2, move2)));
            }
        }
    },

    //关闭
    closeHandbookWindow() {
        //this.windowOpenEffect.closePanel();
        this.node.parent.removeChild(this.node);

        //按钮音效
        this.menu.audio.onButtonAudio();
    }

});
