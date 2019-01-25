//Author : zhangpan
//此文件自动生成，请不要手动修改
var turntable = {
    data: [
        {id:1,type:1,name:"开局10级",weight:"25",num:"1",},
        {id:2,type:2,name:"复活币x1",weight:"215",num:"1",},
        {id:3,type:3,name:"飞镖x5",weight:"120",num:"5",},
        {id:4,type:4,name:"金币x80",weight:"100",num:"80",},
        {id:5,type:5,name:"随机buff+3%",weight:"110",num:"0.03",},
        {id:6,type:2,name:"复活币x2",weight:"100",num:"2",},
        {id:7,type:6,name:"护盾x3",weight:"120",num:"3",},
        {id:8,type:4,name:"金币x60",weight:"210",num:"60",},
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
module.exports = turntable;
