
cc.Class({
    extends: cc.Component,

    properties: {
        bg: [cc.SpriteFrame],
        grade: [cc.SpriteFrame],
        itemBg: cc.Sprite,

        roleName: cc.Label,
        level: cc.Label,

        roleBg: cc.Node,
        shadow: cc.Node,
        level_check: cc.Sprite,
        role: cc.Sprite,
        weapon: cc.Sprite
    },

    show(index, info, level, menu) {
        this.node.active = true;
        if (index < level) {
            this.itemBg.spriteFrame = this.bg[0];
            this.level_check.spriteFrame = this.grade[0];
            this.roleBg.active = true;
            this.shadow.active = true;
            this.role.node.active = true;
            this.weapon.node.active = true;
            this.roleName.node.active = true;
            this.level.node.getComponent(cc.LabelOutline).color = cc.color(84, 38, 164,255);

            let nameArr = info.name.split('');
            let nameStr = '';
            let role = info.modle.toString();
            let weapon = info.weapon.toString();
            for (let i = 0; i < nameArr.length - 1; i++) {
                nameStr += (nameArr[i] + '\n');
            }
            this.roleName.string = nameStr + nameArr[nameArr.length - 1];

            let roleSp = menu.findRoleSp(role);
            this.role.spriteFrame = roleSp;
            this.role.width = 100;
            this.role.height = roleSp.getOriginalSize().height * (100 / roleSp.getOriginalSize().width);

            this.shadow.x = this.role.node.x;
            this.shadow.y = this.role.node.y - this.role.node.height / 2 + 15;

            let weaponSp = menu.findWeaponSp(weapon);
            this.weapon.spriteFrame = weaponSp;
            this.weapon.node.width = 60;
            this.weapon.node.height = 118;
            this.level.string = (index + 1) + '';
        } else {
            this.itemBg.spriteFrame = this.bg[1];
            this.level_check.spriteFrame = this.grade[1];
            this.roleBg.active = false;
            this.shadow.active = false;
            this.role.node.active = false;
            this.weapon.node.active = false;
            this.roleName.node.active = false;
            this.level.node.getComponent(cc.LabelOutline).color = cc.color(70, 69, 85,255);

            this.level.string = (index + 1) + '';
        }
    }
});
