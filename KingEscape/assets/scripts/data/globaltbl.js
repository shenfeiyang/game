//Author : zhangpan
//此文件自动生成，请不要手动修改
var globaltbl = {
    data: [
        {id:1,description:"每日福利增加复活币数",value:"1",},
        {id:2,description:"每次福利每日最多可获得次数",value:"5",},
        {id:3,description:"场景大小",value:"1920,1280",},
        {id:4,description:"每场战斗可复活次数",value:"2",},
        {id:5,description:"经验球最大数量",value:"100",},
        {id:6,description:"击杀人物可获得经验比例（其他经验为经验球）",value:"1",},
        {id:7,description:"场上最多怪物数（怪物数量）",value:"0",},
        {id:8,description:"场上最多其他玩家数（人数）",value:"10",},
        {id:9,description:"随机玩家最高大于等级（等级）",value:"5",},
        {id:10,description:"连击时间（秒）",value:"10",},
        {id:11,description:"随机玩家最低小于等级（等级）",value:"25",},
        {id:12,description:"加速后速度为当前速度的倍率",value:"1.6",},
        {id:13,description:"Ai追击触发后持续时长（秒）",value:"2",},
        {id:14,description:"Ai加速触发后持续时长（秒）",value:"2",},
        {id:15,description:"Ai吃球触发后持续时长（秒）",value:"2",},
        {id:16,description:"初始拥有复活币的数量",value:"2",},
        {id:17,description:"Ai逃跑触发后持续时长（秒）",value:"2",},
        {id:18,description:"进入游戏无敌时间（秒）",value:"8",},
        {id:19,description:"复活后无敌时长（秒）",value:"5",},
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
        10: 9,
        11: 10,
        12: 11,
        13: 12,
        14: 13,
        15: 14,
        16: 15,
        17: 16,
        18: 17,
        19: 18,
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
module.exports = globaltbl;
