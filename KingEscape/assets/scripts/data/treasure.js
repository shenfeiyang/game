//Author : zhangpan
//此文件自动生成，请不要手动修改
var treasure = {
    data: [
        { id: 1, type: 1, name: "复活币+1", duration: 0, num: "1", weight: 120, },
        { id: 2, type: 2, name: "金币+60", duration: 0, num: "60", weight: 180, },
        { id: 3, type: 3, name: "护盾+4", duration: 0, num: "4", weight: 100, },
        { id: 4, type: 4, name: "飞镖+4", duration: 0, num: "4", weight: 100, },
        { id: 5, type: 5, name: "武器长度+40%", duration: 12, num: "0.4", weight: 80, },
        { id: 6, type: 6, name: "移动速度+40%", duration: 20, num: "0.4", weight: 80, },
        { id: 7, type: 7, name: "挥刀速度+40%", duration: 15, num: "0.4", weight: 80, },
        { id: 8, type: 8, name: "经验+200", duration: 0, num: "200", weight: 160, },
        { id: 9, type: 9, name: "经验+500", duration: 0, num: "500", weight: 100, },
    ],

    __index_id: {
        1: 0,
        2: 1,
        3: 2,
        4: 3,
        5: 4,
        6: 5,
        7: 6,
        8: 7,
        9: 8,
    },

    getLength: function () {
        return this.data.length;
    },

    indexOf: function (index) {
        return this.data[index];
    },

    get: function (id) {
        var k = id
        return this.data[this.__index_id[k]];
    },
};
module.exports = treasure;
