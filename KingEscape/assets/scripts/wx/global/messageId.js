module.exports = {
    MessageID:{
        ON_MSG_GET_FRIEND_RANK_OPEN : 1, // 微信 好友排行
        ON_MSG_GET_FRIEND_RANK_NEXT : 2,
        ON_MSG_GET_FRIEND_RANK_BEFORE : 3,
        ON_MSG_GET_FRIEND_RANK_CLOSE : 4,
        ON_MSG_POST_FRIEND_INFO     : 5, //发送个人信息 以 [{key,value}]形式

        ON_MSG_GET_GROUP_RANK_OPEN :20,  // 微信 群排行
        ON_MSG_GET_GROUP_RANK_NEXT :21,
        ON_MSG_GET_GROUP_RANK_BEFORE :22,
        ON_MSG_GET_GROUP_RANK_CLOSE :23,

        ON_MSG_GET_NEXT_PEOPLE:30,// 下一个需要超越领先的人
        ON_MSG_GET_ADJACENT_PEOPLE:31, //与我 相邻的两人

        ON_MSG_GET_DOUBLE_FRIEND_RANK_OPEN : 40, // double rank
        ON_MSG_GET_DOUBLE_FRIEND_RANK_NEXT : 41,
        ON_MSG_GET_DOUBLE_FRIEND_RANK_BEFORE : 42,
        ON_MSG_GET_DOUBLE_FRIEND_RANK_CLOSE : 43,
        ON_MSG_POST_DOUBLE_FRIEND_INFO     : 44, //发送个人信息 以 [{key,value}]形式

        ON_MSG_GET_DOUBLE_GROUP_RANK_OPEN :50,  // 微信 群排行
        ON_MSG_GET_DOUBLE_GROUP_RANK_NEXT :51,
        ON_MSG_GET_DOUBLE_GROUP_RANK_BEFORE :52,
        ON_MSG_GET_DOUBLE_GROUP_RANK_CLOSE :53,

        //获取排行榜 根据key 
        ON_MSG_GET_MORE_RANK_OPEN : 60,
        ON_MSG_GET_MORE_RANK_NEXT : 61,
        ON_MSG_GET_MORE_RANK_BEFORE : 62,

        ON_MSG_GET_MORE_QUN_RANK_OPEN : 65,
        
    }
}