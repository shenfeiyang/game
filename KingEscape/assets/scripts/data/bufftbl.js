//Author : zhangpan
//此文件自动生成，请不要手动修改
var bufftbl = {
    data: [
        {id:1,buff_type:1,buff_value:"0.08",icon:0,des:"武器长度增加8%",is_buy:1,price:30,},
        {id:2,buff_type:1,buff_value:"0.12",icon:0,des:"武器长度增加12%",is_buy:1,price:60,},
        {id:3,buff_type:1,buff_value:"0.15",icon:0,des:"武器长度增加15%",is_buy:0,price:0,},
        {id:4,buff_type:2,buff_value:"0.08",icon:0,des:"移动速度增加8%",is_buy:1,price:30,},
        {id:5,buff_type:2,buff_value:"0.12",icon:0,des:"移动速度增加12%",is_buy:1,price:60,},
        {id:6,buff_type:2,buff_value:"0.15",icon:0,des:"移动速度增加15%",is_buy:0,price:0,},
        {id:7,buff_type:3,buff_value:"0.08",icon:0,des:"挥刀速度增加8%",is_buy:1,price:30,},
        {id:8,buff_type:3,buff_value:"0.12",icon:0,des:"挥刀速度增加12%",is_buy:1,price:60,},
        {id:9,buff_type:3,buff_value:"0.15",icon:0,des:"挥刀速度增加15%",is_buy:0,price:0,},
        {id:10,buff_type:4,buff_value:"3",icon:0,des:"初始等级增加3级",is_buy:1,price:50,},
        {id:11,buff_type:4,buff_value:"5",icon:0,des:"初始等级增加5级",is_buy:0,price:0,},
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
module.exports = bufftbl;
