//Author : zhangpan
//此文件自动生成，请不要手动修改
var exp_balltbl = {
    data: [
        {id:1,type:1,hp:0,level:1,exp:3,},
        {id:2,type:1,hp:0,level:2,exp:6,},
        {id:3,type:1,hp:0,level:3,exp:9,},
        {id:4,type:2,hp:1,level:1,exp:51,},
    ],

    __index_id: {
        1: 0,
        2: 1,
        3: 2,
        4: 3,
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
module.exports = exp_balltbl;
