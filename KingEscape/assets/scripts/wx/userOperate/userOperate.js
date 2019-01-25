///////////////////////////////////////////
//定义 用户操作  上传数据或拉取数据
/////////////////////////////////////////////
var global = require('../global/global');
var urls = require('route').urls;
var config = require('config');
var util = require('../utils/util');
var qqPlay = require('qqPlay');
var consume = require('consume').getInstance();



//// 类版本 全局函数太多可以使用类版本
var self = null;
export default class userOperate {
    // 类似构成函数
    constructor() {
        self = this;

    };

    // 上传 分数
    setScore = function (_score) {
        if (!!!config.gamecenter_link) {
            this._setStorageScore(_score);
            return;
        }
        this._setStorageScore(_score);
        // var score = global.getUserDataInfoByName('score');
        // if(!!!score || score < _score){
        //     this._setScore(_score);
        // }
        // var score = global.getUserDataInfoByName('weekScore');
        // if(!!!score || score < _score){
        //     this._setScore(_score,"weekScore","set_week_score");
        //     this.setFriendsRankScore(_score);
        // }
    }
    /**
     * 设置本地分数问题
     */
    _setStorageScore = function (_score) {
        var score = cc.sys.localStorage.getItem('score');
        if (!!!score || parseInt(score) < _score) {
            cc.sys.localStorage.setItem('score', score);
            global.setUserDataInfoByName('score', _score);
        }
        var timetamp = cc.sys.localStorage.getItem('timetamp');
        if (timetamp) {
            //if(global.isWeekTime(timetamp) ){
            var _storageScore = parseInt(cc.sys.localStorage.getItem('weekScore'));
            if (isNaN(_storageScore) || parseInt(_storageScore) < _score) {
                this.__setStorage(_score);
            }
            // }else{
            //     this.__setStorage(_score);   
            // }
        } else {
            this.__setStorage(_score);
        }

    }
    __setStorage(__score) {
        console.log("__SetStorage", __score);
        cc.sys.localStorage.setItem('weekScore', __score);
        global.setUserDataInfoByName('weekScore', parseInt(__score));
        var time = global.getTimestamp();
        cc.sys.localStorage.setItem('timetamp', time);
        this.setFriendsRankScore(__score);
        this._setScore(__score);
    }
    _setScore = function (_score) {
        var url = urls.user + "/set_score";
        var param = {} //config.getParam();
        param["score"] = JSON.stringify({
            score: _score,
            score_timestamp: global.getTimestamp()
        }); // _score;
        //param['score_timestamp'] = global.getTimestamp();;
        util.request({
            url: url,
            data: param,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            success: res => {
                console.log("setScore Success", res)
                //global.setUserDataInfoByName(dataName,_score);

            }
        })
    }
    //拉取服務器数据
    getSeverScore = function (callBack) {
        var url = urls.user + "/get_score";
        //console.log("getSeverScore",url);
        var param = {} //config.getParam();
        util.request({
            url: url,
            data: param,
            success: function (res) {
                console.log("getSeverScore", res);
                let data = res.data;
                let _cbData = undefined;
                if (data["data"] && typeof data.data != 'object') {
                    _cbData = JSON.parse(data.data);
                }

                callBack(_cbData);
            },
            fail: function (er) {
                callBack();
            }
        });
    }
    /**
     * 设置真实好友分数
     */
    setFriendsRankScore = function (score) {

        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            var weekScore = global.getUserDataInfoByName('weekScore');
            if (!!!weekScore || weekScore <= score) {
                var time = global.getTimestamp();
                var _kvData = new Array();
                score = score.toString();
                time = time.toString();
                _kvData.push({
                    key: 'score',
                    value: score
                }, {
                        key: 'timestamp',
                        value: time
                    });
                wx.setUserCloudStorage({
                    KVDataList: _kvData,
                    success: res => {
                        console.log(res);
                        global.setUserDataInfoByName('weekScore', parseInt(score));
                    },
                    fail: res => {
                        console.log("fail", res);
                    }
                })
            }
        } else if (cc.sys.platform == cc.sys.QQ_PLAY) {
            global.setQQRankeyUseCustomKey('score');
            qqPlay.upLoadRankScoreInfoWithoutRoom({
                score: score
            }, {
                    score: {
                        type: 'rank',
                        order: 1,
                    }
                })
            let blob = cc.sys.localStorage.getItem("blob");
            if (blob) {
                blob = JSON.parse(blob);
            } else {
                blob = {};
            }
            this.setBlob(blob);
        }
    }
    //当局本地分数
    setLocalScore = function (score) {
        this._localScore = score;
    }

    getLocalScore = function () {
        return this._localScore || 0;
    }

    getScore = function () {
        var score = 0
        if (!!!config.gamecenter_link) {
            var timetamp = cc.sys.localStorage.getItem('timetamp');
            if (timetamp) {
                //if(global.isWeekTime(timetamp) ){
                var _storageScore = parseInt(cc.sys.localStorage.getItem('weekScore'));
                if (typeof _storageScore == 'number') {
                    score = _storageScore;
                }
                // }
            }
        } else {
            score = parseInt(cc.sys.localStorage.getItem('weekScore')) || 0; //global.getUserDataInfoByName('weekScore') || 0;   
        }
        return score;
    }


    // 上传 分数
    setScorePlus = function (_score, dataName = "scorePlus", dataName2 = "nextData") {
        if (!!!config.gamecenter_link) {
            this._setStorageScorePlus(_score, dataName, dataName2);
            return;
        }
        this._setStorageScorePlus(_score, dataName, dataName2);
        // var score = global.getUserDataInfoByName('score');
        // if(!!!score || score < _score){
        //     this._setScore(_score);
        // }
        // var score = global.getUserDataInfoByName('weekScore');
        // if(!!!score || score < _score){
        //     this._setScore(_score,"weekScore","set_week_score");
        //     this.setFriendsRankScore(_score);
        // }
    }
    /**
     * 设置本地分数问题
     */
    _setStorageScorePlus = function (_score, dataName, dataName2) {
        // var score = cc.sys.localStorage.getItem(dataName2);
        // if(!!!score || parseInt(score) < _score){
        //     cc.sys.localStorage.setItem(dataName2,score);
        //     global.setUserDataInfoByName(dataName2,_score);
        // }
        //var timetamp = cc.sys.localStorage.getItem('timestampPlus');
        //var timetamp = cc.sys.localStorage.getItem('timetamp');
        //if(timetamp){
        //if(global.isWeekTime(timetamp) ){
        if (cc.sys.platform == cc.sys.QQ_PLAY) {
            this.__setStoragePlus(_score, dataName, dataName2);
        } else {
            this.__setStoragePlus(_score, dataName, dataName2);
        }

        // }else{
        //     this.__setStorage(_score);   
        // }
        // }else{
        //     this.__setStoragePlus(_score ,dataName ,dataName2);
        // }

    }
    __setStoragePlus(__score, dataName, dataName2) {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            if (this._setWorldRank(dataName, __score)) {
                this._setCommonWorldRank(dataName, __score);
                this.setFriendsRankScorePlus(__score, dataName, dataName2);
            }
        } else if (cc.sys.platform == cc.sys.QQ_PLAY) {
            this.setFriendsRankScorePlus(__score, dataName, dataName2);
        }

    }

    /**
     * 设置真实好友分数
     */
    setFriendsRankScorePlus = function (score, dataName, dataName2) {

        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            if (true) {
                //上传全服排行榜分数
                var time = global.getTimestamp();
                var _kvData = new Array();
                score = score.toString();
                time = time.toString();
                _kvData.push({
                    key: dataName,
                    value: score
                }, {
                        key: 'timestampPlus',
                        value: time
                    });
                wx.setUserCloudStorage({
                    KVDataList: _kvData,
                    success: res => {
                        console.log(res);
                        global.setUserDataInfoByName(dataName, parseInt(score));
                    },
                    fail: res => {
                        console.log("fail", res);
                    }
                })
            }
        } else if (cc.sys.platform == cc.sys.QQ_PLAY) {
            let _scoreInfo = { score: 0 };
            global.setQQRankeyUseCustomKey(dataName);
            let _qqKey = global.getQQRankeyByCustomKey(dataName)
            _scoreInfo[_qqKey] = score;
            let _arr = {
                score: {
                    type: 'rank',
                    order: 1,
                }
            };
            console.log('上传分数' + JSON.stringify(_scoreInfo))
            _arr[_qqKey] = {
                type: 'rank',
                order: 1,
            }
            qqPlay.upLoadRankScoreInfoWithoutRoom(_scoreInfo, _arr);
            // let blob = cc.sys.localStorage.getItem("blob");
            // if(blob){
            //     blob = JSON.parse(blob);
            // }else{
            //     blob = {};
            // }
            // this.setBlob(blob);
        }
    }


    getScorePlus = function (dataName = "scorePlus") {
        var score = 0
        if (!!!config.gamecenter_link) {
            var timetamp = cc.sys.localStorage.getItem('timestampPlus');
            if (timetamp) {
                //if(global.isWeekTime(timetamp) ){
                var _storageScore = parseInt(cc.sys.localStorage.getItem(dataName));
                if (typeof _storageScore == 'number') {
                    score = _storageScore;
                }
                // }
            }
        } else {
            let glBlob = global.getUserDataInfoByName('blobMap');
            if (!glBlob) {
                score = parseInt(parseInt(cc.sys.localStorage.getItem(dataName))) || 0;
                return score;
            }
            var scorePlusInfo = glBlob['score_plus_info']
            if (!scorePlusInfo) {
                score = parseInt(parseInt(cc.sys.localStorage.getItem(dataName))) || 0;
                return score;
            }
            if (scorePlusInfo[dataName]) {
                console.log("__getStorage")
                score = scorePlusInfo[dataName]
            } else {
                score = parseInt(parseInt(cc.sys.localStorage.getItem(dataName))) || 0;
            }
        }
        return score;
    }
    /** 
     * 上传 个人数据（自定义）
     * blob 为一个对象
     * 
     * */
    setBlob = function (blob = {}, callBack) {
        var url = urls.user + "/set_blob"
        var param = {} //config.getParam();
        blob["blob_timestamp"] = global.getTimestamp();
        cc.sys.localStorage.setItem("blob", JSON.stringify(blob));

        //玩一玩
        if (cc.sys.platform == cc.sys.QQ_PLAY) {
            let score = this.getScore();
            let gold = consume.getGold();
            blob['Gold'] = gold;
            qqPlay.saveGameData(score, blob);
            return;
        }

        let _jsonBlob = JSON.stringify(blob)
        param["blob"] = _jsonBlob;
        util.request({
            url: url,
            data: param,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            success: res => {
                console.log("setBlob Success", res)
                if (callBack && typeof callBack == 'function') callBack()
            }
        })
    }
    //拉取服務器数据
    getBlob = function (callBack) {
        var url = urls.user + "/get_blob";
        var param = {} //config.getParam();
        util.request({
            url: url,
            data: param,
            success: function (res) {
                console.log("getBlob", res);
                let data = res.data;
                let _cbData = undefined;
                if (data["data"] && typeof data.data != 'object') {
                    _cbData = JSON.parse(data.data);
                }
                //console.log("JSON.parse",_cbData);
                callBack(_cbData);

            },
            fail: function (err) {
                callBack();
            }
        });
    }
    /**
     * 上传个人人物数据信息 
     *
     */

    setUserInfo = function () {
        var url = urls.user + "/setuserinfo";
        var param = {}; //config.getParam();
        console.log(config.userInfo)
        param["portrait"] = config.userInfo.avatarUrl
        param["name"] = config.userInfo.nickName
        param["geo"] = config.userInfo.city
        util.request({
            url: url,
            data: param,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
        })
    }
    /**
     * 消耗体力
     */
    subVit = function (callBack, _num) {
        var url = urls.user + "/sub_vit";
        var param = {
            num: _num,
        }; //config.getParam();
        util.request({
            url: url,
            data: param,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            success: res => {
                if (callBack && typeof callBack == 'function') callBack(res.data.data)
            },
            fail: function (er) {
                console.error(er);
            }
        })
    }
    /*
    *上传周分数
    set_week_score
    */
    setWeekScore = function (callBack, _num) {
        var url = urls.user + "/set_week_score";
        var param = {
            num: _num,
        }; //config.getParam();
        util.request({
            url: url,
            data: param,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            success: res => {
                console.log(res.data);
                if (callBack && typeof callBack == 'function') callBack(res.data.data)
            },
            fail: function (er) {
                console.error(er);
            }
        })
    }
    // 获取 用户信息 
    /*res.data{
    "user": {
        "uid": "String",
        "name": "String",
 
        "portrait":"String",
        "geo":"String",
        
        "blob": {
            "type": "Mixed",
            "default": {}
        },
        "score": {
            "type":"Number",
            "default":0
        },
        "weekScore": {
            "type":"Number",
            "default":0
        },
        "weekTime": {
            "type":"Number",
            "default":0
        },
        "vit": {
            "type":"Number",
            "default":0
        },
        "vitRecoverTime": {
            "type":"Number",
            "default":0
        },
        "money": {
            "type": "Number",
            "default":0
        },
        "getHongBaos": {
            "type": "Object",
            "default": []
        },
        "sendHongBaos": {
            "type": "Object",
            "default": []
        },
        "tuiguangToday": {
            "type": "Object",
            "default": []
        },
        "tuiguangScore":{
            "type":"Number",
            "default":0
        },
        "createdate": "Date",
        "gold": "Number",
        "match": {
            "type": "Object",
            "default": []
        }
    },
    }
    */
    getUserData = function (callBack) {
        var url = urls.user + "/get_user";
        var param = {}; //config.getParam();
        util.request({
            url: url,
            data: param,
            method: 'GET',
            success: res => {
                //服务器存储的用户数据
                console.log("getUserData", res)
                // global.setUserDataInfo(res.data.data)
                if (callBack && typeof callBack == 'function') callBack(res.data)
            },
        })
    }
    getTuiguangUrl = function (callBack) {
        var url = urls.user + "/get_tuiguangUrl"
        var param = {} //config.getParam();
        util.request({
            url: url,
            data: param,
            method: 'GET',
            success: res => {
                //服务器存储的用户数据
                console.log(res)
                if (callBack && typeof callBack == 'function') callBack(res.data)
            },
        })
    }
    //获得体力
    getVit = function (callBack) {
        var url = urls.user + "/get_vit";
        var param = {}; //config.getParam();
        util.request({
            url: url,
            data: param,
            method: 'GET',
            success: res => {
                //服务器存储的用户数据
                if (callBack && typeof callBack == 'function') callBack(res.data.data)
            },
        })
    }
    /**
     * 获取服务器配置
     * @param {*} callBack 
     */
    getAppSvrCfg(callBack) {
        var url = urls.app_cfg + "/getCommonConfig";
        var param = {
            appid: config.config.appid,
        } //config.getParam();
        util.requestSvrCfg({
            url: url,
            data: param,
            method: 'GET',
            success: res => {
                //
                console.log(res)
                if (res.data && res.data.share) {
                    let flag = parseInt(res.data.share) || 0;
                    global.setShareChannel(flag);
                }
                // 最小
                if (res.data && res.data.sharegap1) {
                    let flag = parseInt(res.data.sharegap1);
                    global.setShareMinTime(flag);
                }
                // 连续最小
                if (res.data && res.data.sharegap2) {
                    let flag = parseInt(res.data.sharegap2);
                    global.setLXShareTime(flag);
                }
                if (res.data && res.data) {
                    global.setUserDataInfo(res.data);
                }

                if (callBack && typeof callBack == 'function') callBack(res.data)
            },
            fail: res => {
                if (callBack && typeof callBack == 'function') callBack()
            }
        })
    }
    /**
     * 获取服务器时间
     * @param {*} callBack 
     */
    getAppSvrTime(callBack) {
        var url = urls.app_cfg + "/getServerInfo";
        var param = {} //config.getParam();
        util.request({
            url: url,
            data: param,
            method: 'get',
            success: res => {
                console.log("getSvrTime", res)
                if (callBack && typeof callBack == 'function') callBack(res.data.time);
            },
        })
    }
    /**
     * 上传个人数据信息
     * @param {*} userInfo 
     */
    setUserDataInfo(userInfo) {
        var url = urls.user + "/wxgameReportInfo";
        var param = {}; //config.getParam();
        param["avatarUrl"] = userInfo.avatarUrl;
        param["name"] = userInfo.nickName;
        param["gender"] = userInfo.gender;
        param["city"] = userInfo.city;
        util.request({
            url: url,
            data: param,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            success: res => {
                console.log("setUserDataInfo", res)
            },
        })
    }

    /** 
     * 小游戏上报好友点击分享
     * 
     */
    setReportShare(tag, uid, newTag) {
        var url = urls.friend + "/reportShare";
        if (newTag) {
            url = urls.friend + "/reportNewShare";
        }
        var param = {};
        param["uid"] = uid;
        param['tag'] = tag;
        param['time'] = new Date().getTime();
        util.request({
            url: url,
            data: param,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            success: res => {
                console.log("setReportShare", res)
            },
        })
    }

    /**
     * 获取小游戏好友上报 数据列表
     */
    getReportFriends(tag, callBack, newTag) {
        var url = urls.friend + "/getFriends";
        if (newTag) {
            url = urls.friend + "/getNewFriends";
        }
        var param = {};
        if (tag) {
            param["tag"] = tag;
        }
        util.request({
            url: url,
            data: param,
            method: 'get',
            success: res => {
                console.log("getReportFriends", res)
                if (res.data.ecode == 114) {
                    if (callBack && typeof callBack == 'function') callBack();
                    return;
                }
                if (callBack && typeof callBack == 'function') callBack(res.data.data);
            },
        })
    }

    /**
     * 上报红包活动score
     */
    setHBScore(_score) {
        if (cc.sys.platform != cc.sys.WECHAT_GAME) {
            return;
        }
        if (!config.gamecenter_link) {
            return;
        }
        var launcInfo = wx.getLaunchOptionsSync();
        var _actToken = '';
        if (typeof launcInfo.query.actToken == 'undefined') {
            return;
        } else {
            _actToken = launcInfo.query.actToken;
        }
        var url = config.base_url + "/hbaoAct/reportAchieve";
        var param = {
            currentAchieve: _score,
            actToken: _actToken,
        }
        console.log("setHongBaoScore", param);
        util.request({
            url: url,
            data: param,
            method: 'POST',
            success: res => {
                console.log("post HBScore success", res);
            },
            fail: res => {
                console.log("post setHBScore fail", res);
            }
        })
    }
    /**
     * 获取blobMap数据  所有的
     */
    getBlobMap() {
        var url = urls.user + "/getUserBlobMap";
        var param = {};
        util.request({
            url: url,
            data: param,
            method: 'get',
            success: res => {
                console.log("getBlobMap", res)
                let glBlob = cc.sys.localStorage.getItem("blobMap");
                if (glBlob) {
                    glBlob = JSON.parse(glBlob);
                }
                if (glBlob && res.data && res.data.data && res.data.data['blobMap_timestamp'] && glBlob['blobMap_timestamp'] > res.data.data['blobMap_timestamp']) {
                    self.setBlobMap(glBlob);
                } else {
                    glBlob = res.data ? res.data.data : null
                }
                global.setUserDataInfoByName('blobMap', glBlob);
                //global.setUserDataInfo(res.data ?  res.data.data : null);

            },
        })
    }
    /**
     * 设置blobMap 数据
     * 可以使用 单个{key:value} 更新blob数据 
     * @param {*} blob 
     */
    setBlobMap(blob) {
        var url = urls.user + "/setUserBlobMap";
        blob["blobMap_timestamp"] = global.getTimestamp();
        let glBlob = global.getUserDataInfoByName('blobMap');
        if (glBlob) {
            for (let key in blob) {
                glBlob[key] = blob[key];
            }
            global.setUserDataInfoByName('blobMap', glBlob);
        } else {
            global.setUserDataInfoByName('blobMap', blob);
        }
        cc.sys.localStorage.setItem("blobMap", JSON.stringify(glBlob));
        //缓存数据 一起上传
        let glUpdateBlob = global.getUserDataInfoByName('updateBlobMap');
        if (glUpdateBlob) {
            for (let key in glUpdateBlob) {
                blob[key] = glUpdateBlob[key];
            }
        }
        // 清空更新数据缓存
        global.setUserDataInfoByName('updateBlobMap', {});
        var param = {
            blobMapStr: JSON.stringify(blob),
        };
        util.request({
            url: url,
            data: param,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'post',
            success: res => {
                console.log("setBlobMap", res)
            },
        })
    }
    /**
     * 更新 
     */
    setUpdateBlobMap() {
        var url = urls.user + "/setUserBlobMap";
        let glUpdateBlob = global.getUserDataInfoByName('updateBlobMap');
        if (!glUpdateBlob) {
            return;
        }
        glUpdateBlob["blobMap_timestamp"] = global.getTimestamp();
        //更新本地数据
        let glBlob = global.getUserDataInfoByName('blobMap');
        glBlob["blobMap_timestamp"] = global.getTimestamp();
        global.setUserDataInfoByName('blobMap', glBlob);
        cc.sys.localStorage.setItem("blobMap", JSON.stringify(glBlob));
        var param = {
            blobMapStr: JSON.stringify(glUpdateBlob),
        };
        // 清空更新数据缓存
        global.setUserDataInfoByName('updateBlobMap', {});
        util.request({
            url: url,
            data: param,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'post',
            success: res => {
                console.log("setBlobMap", res)
            },
        })
    }
    // 设置排行榜 称号/头衔
    setTitleName(titleName) {
        var param = {
            titleName: titleName,
        };
        util.request({
            url: urls.user + "/set_titleName",
            data: param,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'post',
            success: res => {
                console.log("setTitleName", res)
            },
        })
    }
    // 获取全局 活动配置
    getGlobalActConfig(callback) {
        let url = urls.globalAct;
        let param = {

        };
        util.request({
            url: url,
            data: param,
            method: 'get',
            success: res => {
                console.log("getGlobalActConfig", res)
                if (res.data && res.data) {
                    let _g = {};
                    let func = (list, flag = 1) => {
                        if (list) {
                            for (let i = 0; i < list.length; i++) {
                                _g[list[i]] = flag;
                            }
                        }
                    }
                    func(res.data[1]);
                    global.setUserDataInfoByName('globalActConfig', _g);
                }
                if (callback && typeof callback == 'function') callback(res.data)
            },
        })
    }
    //公众号拉粉
    officialAccount(callback) {
        let url = urls.baseUrl + '/hbaoAct/awardRevStat';
        let param = config.getParam();
        util.request({
            url: url,
            data: param,
            method: 'get',
            success: res => {
                console.log("officialAccount", res);
                if (callback && typeof callback == 'function') callback()
            },
        })
    }

    showYdStatus(callback) {
        let param = {
            appid: config.config.appid,
            version: config.version,
        };
        util.requestSvrCfg({
            url: urls.svr_cfg,
            data: param,
            success: function (res) {
                console.log("setShowYdState +", res);
                //if (success && typeof success == 'function') success(res.data);

                if (res.data.showyd != null) {
                    config.isShowyd = parseInt(res.data.showyd);
                } else {
                    config.isShowyd = 0;
                }
                //北上广深版本是否开启（注：可强制标记为 非 北上广深，当开启，按正常登录北上广深判定）
                if (typeof res.data.cityFlag == 'number' || typeof res.data.cityFlag == 'string') {
                    if (!parseInt(res.data.cityFlag)) {
                        global.setLoginCfgByKey('cityFlag', parseInt(res.data.cityFlag));
                    }
                }
                //消除类游戏首页展示 （注：可强制标记为分享进入， 未开启，按正常登录判定）
                if (typeof res.data.spShareUser == 'number' || typeof res.data.spShareUser == 'string') {
                    if (parseInt(res.data.spShareUser)) {
                        global.setLoginCfgByKey('spShareUser', parseInt(res.data.spShareUser));
                    }
                }
                if (callback && typeof callback == 'function') callback(config.isShowyd);
            },
            fail: function (er) {
                console.log("setShowYdState +", er);
                //if (fail && typeof fail == 'function') fail();

                config.isShowyd = 0;
                if (callback && typeof callback == 'function') callback(config.isShowyd);
            }
        });
    };
    //获取全服排行榜
    getCommonWorldRank(rankName, callback, rankNum = 100) {
        let url = urls.user + '/getCommonRankList';
        let param = {
            rankKey: rankName,
            rankNum: rankNum,
        };
        util.request({
            url: url,
            data: param,
            method: 'get',
            success: res => {
                console.log("officialAccount", res);
                if (res.data)
                    if (callback && typeof callback == 'function') callback(res.data)
            },
        })
    };
    //数据判断
    _setWorldRank(dataName, __score) {
        var _storageScore = parseInt(cc.sys.localStorage.getItem(dataName));
        console.log('_local storageScore', _storageScore, __score)
        if (isNaN(_storageScore) || _storageScore < __score) {
            let glBlob = global.getUserDataInfoByName('blobMap');
            if (!glBlob) {
                glBlob = {};
            }
            var scorePlusInfo = glBlob['score_plus_info']
            if (!scorePlusInfo) {
                scorePlusInfo = {};
            }
            if (!scorePlusInfo[dataName] || parseInt(scorePlusInfo[dataName]) < __score) {
                console.log("__SetStorage", __score);
                cc.sys.localStorage.setItem(dataName, __score);
                scorePlusInfo[dataName] = __score;
                this.setBlobMap({ 'score_plus_info': scorePlusInfo })
                return true;
            } else {
                return false;
            }
        }

        return false;
    };
    //上传全服排行榜数据
    setCommonWorldRank(rankName, score) {
        if (!this._setWorldRank(rankName, score)) {
            return;
        }
        this._setCommonWorldRank(rankName, score);
    };
    _setCommonWorldRank(rankName, score) {
        let url = urls.user + '/addCommonRankScore';
        let param = {
            commonScore: score,
            rankKey: rankName,
        }
        util.request({
            url: url,
            data: param,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'post',
            success: res => {
                console.log("setCommonWorldRank", res);
            },
        })
    };
    /**
     * 上报 视频播放与看完比例
     * @param {*} isStart 
     * @param {*} _id 
     */
    reportVideo(_id = - 1, isStart = true, ) {
        let url;
        if (isStart)
            url = urls.material + '/reportVideoStart';
        else
            url = urls.material + '/reportVideoEnd';

        let param = config.getParam();
        param['videoPointID'] = _id;
        util.request({
            url: url,
            data: param,
            method: 'get',
            success: res => {
                console.log("reportVideo", res);
            },
        })
    };
    /**
     * 动态消息ActiveId;
     */
    getShareActiveId() {
        let url = urls.baseUrl + '/message/getActivityId';
        let param = config.getParam();
        util.request({
            url: url,
            data: param,
            method: 'get',
            success: res => {
                console.log("getShareActiveId", res);
                global.setUserDataInfoByName('shareActiveId', res.data.activity_id);
            },
        })

    }
    /**
     * 矩阵点击上报
     * @param {*} clickAppId 
     * @param {*} name 
     */
    reportClickNew(clickAppId, name) {
        let url = urls.baseUrl + '/heziReal/reportClickNew';
        let param = {
            clickAppid: clickAppId,
            name: name,
        }

        util.request({
            url: url,
            data: param,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'post',
            success: res => {
                console.log("reportClickNew", res);
            },
        })
    }
    /**
     * 获取周卡月卡时间
     * @param {*} callBack
     * @param {*} tag   周卡（weekcard）| 月卡（monthcard）
     */
    getCard(callBack, tag = "weekcard") {
        let url = urls.user + '/getCard';
        let param = {
            tag: tag,
        }
        util.request({
            url: url,
            data: param,
            method: 'get',
            success: res => {
                console.log("getCard", res);
                if (callBack && typeof callBack == 'function') callBack(res.data);
            },
        })
    };
    /**
     * 周卡月卡购买后上报
     * @param {*} callBack 
     * @param {*} tag 周卡（weekcard）| 月卡（monthcard）
     */
    reportCard(callBack, tag = "weekcard") {
        let url = urls.user + '/reportCard';
        let param = {
            tag: tag,
        }

        util.request({
            url: url,
            data: param,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'post',
            success: res => {
                console.log("reportCard", res);
                if (callBack && typeof callBack == 'function') callBack(res.data);
            },
        })
    };
};  