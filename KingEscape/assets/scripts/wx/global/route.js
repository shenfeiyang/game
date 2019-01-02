var config = require('config');


const base_url = config.base_url;
const qBase_url = config.qBase_url;
var url_login = base_url + "/login"; //用户登录
var url_user = base_url + "/user"; //用户信息
var url_hongbao = base_url + "/hongbao"; //红包信息
var url_pay = base_url + "/pay/unifiedOrder"; //支付
var url_match = base_url + "/match"; //比赛活动
var url_lottery = base_url + "/lottery"; //开奖
var url_share = base_url + "/share"; // 分享
var url_advert = base_url + "/advert/activate"; //设备激活接口
var url_decodeGroup = base_url + "/group"; //解密
var url_svr_cfg = base_url + "/app/getInfo";
var url_app_cfg = base_url + "/app";
var url_hongbaoInfo = base_url;
var url_material = base_url + "/material"; //文案
module.exports = {

    urls: {
        baseUrl: base_url,
        login: url_login,
        user: url_user,
        hongbao: url_hongbao,
        pay: url_pay,
        match: url_match,
        lottery: url_lottery,
        share: url_share,
        advert: url_advert,
        svr_cfg: url_svr_cfg,
        decodeGroup: url_decodeGroup,
        app_cfg: url_app_cfg,
        adc: base_url + "/adc",
        hongbaoInfo: url_hongbaoInfo,
        material: url_material,
        friend: base_url + '/friend', //好友数据上报
        globalAct: base_url + '/globalAct/globalActConf',
    },
    qUrls: {
        baseUrl: qBase_url,
        adc: "https://gamecenter.phonecoolgame.com/adcqq",
        cpFriend: 'https://cpgc.phonecoolgame.com/friend',
    }
}
