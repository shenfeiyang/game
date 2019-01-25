var TEST_DEBUG = false;
// 微信服务器地址
var _base_url = "https://gamecenter2.phonecoolgame.com";
//qq玩一玩 地址
var _qBase_url = "http://tj.17fengyou.cn";
//var _qBase_url = "https://gamecenter.phonecoolgame.com";
if (TEST_DEBUG) {
    _base_url = "http://192.168.1.59";
    //_base_url = "https://gamecenter-dev.phonecoolgame.com";

}

//const base_url = _base_url;
// var url_login = base_url + "/login"; //用户登录
// var url_user = base_url + "/user"; //用户信息
// var url_hongbao = base_url + "/hongbao"; //红包信息
// var url_pay = base_url + "/pay/unifiedOrder"; //支付
// var url_match = base_url + "/match"; //比赛活动
// var url_lottery = base_url + "/lottery"; //开奖
// var url_share = base_url + "/share"; // 分享
// var url_advert = base_url + "/advert/activate"; //设备激活接口
// var url_decodeGroup = base_url + "/group"; //解密
// var url_svr_cfg = base_url + "/app/getInfo";
// var url_app_cfg = base_url + "/app";
// var url_hongbaoInfo = _base_url;
// var url_material = base_url + "/material"; //文案


///////////////这个是SDKDemo的参数，需要填自己的参数/////////////
var config_appid = "wxa9acba8442721574";
var config_appsecret = ""; // "";
////////////////////////////


/////////////游戏主场景，需要根据自己的情况修改//////////////
var loginScene = "MenuScene"; // 登录 scene
/////////////////////////////////////////////////////////////

///////////////////////连接gameCenter服务器 开关/////////////////////////////////////////
var gamecenter_link = true;
////////////////////////////////////////////////////////////////////////////

////////////////share分享Title/////////////////////////
/////////////////1为正常分享文字，2 为 分数分享文字  （#score#） 必须固定格式 , 3 为助力分享文案, 4 为vip分享文案 /////////////
var shareTitles = {
    "1": [{ title: "王者一怒，拔剑而起，千里降敌。" },
    { title: "剑已出鞘，谁与争锋。" },
    { title: "王者的战场，你能生存多久？" },
    ],
    "2": [{ title: "王者一怒，拔剑而起，千里降敌。" },
    { title: "剑已出鞘，谁与争锋。" },
    { title: "王者的战场，你能生存多久？" },
    ],
    "3": [{ title: "王者一怒，拔剑而起，千里降敌。" },
    { title: "剑已出鞘，谁与争锋。" },
    { title: "王者的战场，你能生存多久？" },
    ],
    "4": [{ title: "王者一怒，拔剑而起，千里降敌。" },
    { title: "剑已出鞘，谁与争锋。" },
    { title: "王者的战场，你能生存多久？" },]
}
/////////////////////////////////////////////////////

var rankTag = 2005; // 排行榜target
const getParam = function () {
    var util = require('util');
    return {
        appid: config_appid,
        logintype: "wx", //freein 为测试用 不用校验微信登录信息
        noncestr: util.randomString(),
    };
}


var vipAbility = {
    stable: [
        { desc: '排行榜中, 贵宾名称特殊显示', value: null, id: 's_rank' },
        { desc: '游戏中, 获得#value#%的额外分数加成', value: 5, id: 's_score' },
        { desc: '游戏分享时, 分享获得金币额外+#value#', value: 1, id: 's_gold' },
    ],
    configurable: [
        { desc: '免费获得一套精美贵宾皮肤', value: null },
    ]
}

module.exports = {
    base_url: _base_url,
    qBase_url: _qBase_url,
    // urls: {
    //     login: url_login,
    //     user: url_user,
    //     hongbao: url_hongbao,
    //     pay: url_pay,
    //     match: url_match,
    //     lottery: url_lottery,
    //     share: url_share,
    //     advert: url_advert,
    //     svr_cfg: url_svr_cfg,
    //     decodeGroup: url_decodeGroup,
    //     app_cfg: url_app_cfg,
    //     adc: base_url + "/adc",
    //     hongbaoInfo: url_hongbaoInfo,
    //     material: url_material,
    // },
    config: {
        appid: config_appid,
        appsecret: config_appsecret
    },

    gameName: '',
    vipAbility: vipAbility,
    getParam: getParam,

    userInfo: '',
    loginScene: loginScene,
    rankTag: rankTag,
    gamecenter_link: gamecenter_link,


    //暂时替代资源
    useName: '',
    UID: '',
    sessionkey: '',
    // 群进入的shareTickey 和  通过服务器解析出的 groupOpenGID
    shareTicket: '',
    groupOpenGID: '',
    shareGroupTime: 0,
    //分享到群 次数记录（）
    shareTitles: shareTitles,
    officalAccount: {
        show: true,
        width: 1136, //屏幕宽度
        height: 640, //屏幕高度
        direction: "left", //图标左右方位
        percent: 0.8, //图标高度百分比
        urls: ['https://img.phonecoolgame.com/wx_game/20180424/1524554646586.jpg', 'https://img.phonecoolgame.com/wx_game/20180424/1524554725298.jpg', 'https://img.phonecoolgame.com/wx_game/20180424/1524554816301.jpg',
            'http://img.phonecoolgame.com/wx_game/20180426/1524748239073.jpg', 'http://img.phonecoolgame.com/wx_game/20180426/1524748253288.jpg', 'http://img.phonecoolgame.com/wx_game/20180426/1524748262399.jpg'
        ]
        // 飞刀：https://img.phonecoolgame.com/wx_game/20180424/1524554646586.jpg
        // 贪吃蛇：https://img.phonecoolgame.com/wx_game/20180424/1524554725298.jpg
        // 弹珠：https://img.phonecoolgame.com/wx_game/20180424/1524554816301.jpg
        //六六六消除：http://img.phonecoolgame.com/wx_game/20180426/1524748239073.jpg
        //数字点点消：http://img.phonecoolgame.com/wx_game/20180426/1524748253288.jpg
        //物理弹珠：http://img.phonecoolgame.com/wx_game/20180426/1524748262399.jpg
    },

    //配置粉丝落地红包图标的位置
    rmbHongbaoConfig: {
        direction: "right", //图标左右方位
        percentHeight: 0.6, //图标高度百分比 范围0-1；0.5为屏幕中间，大于0.5在屏幕上半部分

    },

    //配置神秘新游图标的位置
    mysteriousNewGameConfig: {
        direction: "right", //图标左右方位
        percentHeight: 0.6, //图标高度百分比 范围0-1；0.5为屏幕中间，大于0.5在屏幕上半部分

    },
    //


    //已弃用
    gold: 10,
    // 开始游戏次数 （已不使用）
    startGameTimes: 5,
    // 友助 加添金币
    myAssist: 5,
    // 高分复活 界点
    topScore: 60,
    //视频广告 Uit
    adUnitId: 'adunit-75b9c3d23efc8748',
    //广告 Uit
    bannerId: "adunit-e8563d0019aa842d",//广告id，自定义
    //主包/马甲  true./false
    isMajor: true,
    //版本号 随版本走
    version: "0.90.2",
    //诱导分享 开关
    isShowyd: false,
    //分享同一微信群次数（分享不同群）
    groupTimes: 2,
    adc: {
        moreGame: true,
        adFrame: true,
        adBanner: true,
        adexp: true,
    },
    // 猜你好玩 广告 游戏名描边
    adEdges: {
        labOL: {
            color: cc.color(185, 113, 110, 255),
            width: 2
        }
    },
    //广点通广告宽度 填0顶宽
    bannerWidth: 300,
    //广点通广告 ios适配宽度，0 顶宽
    iosBannerWidth: 0,
    //广点通广告高度
    bannerTop: 100,
    //广点通小广告贴底
    bannerLowest: true,
    //自主广告scale
    bannerScale: 1.0,
    //ios广点通广告scale
    iosBannerScale: 0.5,
    //安卓广点通广告scale
    androidBannerScale: 1.0,
    // 收藏有礼配置奖励金币数量
    colletAwards: 300,
    //免费红包赠送礼物
    freeRedPocket: {
        num: 100,
        str: '钻石',
        getStr() {
            return (this.num + this.str);
        }
    },
    //任务奖励
    adTask: {
        "1": 100,
        "2": 200,
        "3": 300,
        "4": 400,
        "5": 500,
        "6": 600,
        "7": 700,
        "8": 800,
        "9": 500,
        "10": 600,
        "11": 700,
        "12": 800,
        getNum(id) {
            return this[id] ? this[id] : 0;
        },
        scale: 1,//奖励图标缩放
    },
    /**
     * qq 玩一玩相关的写在下面
     */
    qqGameID: 122, //游戏id (注：此为cps游戏id，需要找后台配置,不是玩一玩游戏的gameid)
    qqGameKey: '3QqH7YmRmbkMag2B5Z8omgNdNox2SP1a', // 回话key
    qqPlayUrl: ['https://img.phonecoolgame.com/wx_game/20180424/1524554646586.jpg',
        'https://img.phonecoolgame.com/wx_game/20180424/1524554646586.jpg',
    ],
    qqPUIN: '228286369',
}