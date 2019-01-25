var BANNERAD_TIEMS = 900;
var qqPlay = {
    _bannerAd: true,
    // constructor(){ 
    //     //BK.Script.loadlib('GameRes://qqPlayCore.js');
    // };    
    /**
     * ******************************************************************
     * **************************  排行榜  *******************************
     * ******************************************************************
     */
    /**
     * 上传 排行榜 分数等数据
     * 
     * @param {* 对象类型（例如 {key：value,key1 :value , ... }  value 必须为整数型 ） } _scoreInfo 
     * @param {*对象类型，详情查看 内部 注释的 attr字段， key 与 _scoreInfo中的 key 需要对应， order 值详情 查看内部 attr 描述 } _attr 
     * @param {* 游戏模式} gameMode 
     */
    upLoadRankScoreInfoWithoutRoom(_scoreInfo, _attr, gameMode = 1) {
        let data = {
            userData: [
                {
                    openId: GameStatusInfo.openId,
                    startMs: (((new Date()).getTime()) - 5000).toString(),    //必填。 游戏开始时间。单位为毫秒，<font color=#ff0000>类型必须是字符串</font>
                    endMs: ((new Date()).getTime()).toString(),  //必填。 游戏结束时间。单位为毫秒，<font color=#ff0000>类型必须是字符串</font>
                    scoreInfo: _scoreInfo
                }
            ],
            // type 描述附加属性的用途
            // order 排序的方式，
            // 1: 从大到小，即每次上报的分数都会与本周期的最高得分比较，如果大于最高得分则覆盖，否则忽略
            // 2: 从小到大，即每次上报的分数都会与本周期的最低得分比较，如果低于最低得分则覆盖，否则忽略（比如酷跑类游戏的耗时，时间越短越好）
            // 3: 累积，即每次上报的积分都会累积到本周期已上报过的积分上
            // 4: 直接覆盖，每次上报的积分都会将本周期的得分覆盖，不管大小
            // 如score字段对应，上个属性.
            attr: _attr
            /*attr : {
                score: {   
                    type: 'rank',
                    order: 1,
                },
                a1: {
                    type: 'rank',
                    order: 2,
                }
            },
            */
        };
        console.log('uploadScoreWithoutRoom' + JSON.stringify(data));
        // gameMode: 游戏模式，如果没有模式区分，直接填 1
        // 必须配置好周期规则后，才能使用数据上报和排行榜功能
        BK.QQ.uploadScoreWithoutRoom(gameMode, data, function (errCode, cmd, data) {
            // 返回错误码信息
            if (errCode !== 0) {
                BK.Script.log(1, 1, '上传分数失败!错误码：' + errCode);
            }
        });
    },

    /**
     * 拉取 排行榜数据  
     * 
     * @param {* 数组 [key,key1,key2...] （上报数据的key） } _attr 
     * @param {* 数组 [1,2,3] 排序的方法：[ 1: 从大到小(单局)，2: 从小到大(单局)，3: 由大到小(累积)] } _order 
     * @param {* 数组 [1,2,3] 要查询的排行榜类型，0: 好友排行榜，1: 群排行榜，2: 讨论组排行榜，3: C2C二人转 (手Q 7.6.0以上支持)} _rankType 
     * @param {* 回调 返回 一个对象以_attr中 key 为键值的数组列表 { key:[v,v1,...],key1:[v,v1,...],...} } callBack
     */
    getRankListWithoutRoom(_attr, _order, _rankType, callBack) {
        // 当前不支持一次同时拉取多个排行榜，需要拉取多次，而且必须等上一个拉取回来后才能拉取另外一个排行榜
        // 先拉 score 排行榜
        var attr = _attr;//使用哪一种上报数据做排行，可传入score，a1，a2等
        var order = _order;     //排序的方法：[ 1: 从大到小(单局)，2: 从小到大(单局)，3: 由大到小(累积)]
        var rankType = _rankType; //要查询的排行榜类型，0: 好友排行榜，1: 群排行榜，2: 讨论组排行榜，3: C2C二人转 (手Q 7.6.0以上支持)
        // 必须配置好周期规则后，才能使用数据上报和排行榜功能\
        var attrLists = {};

        this._getRankList(attr, order, rankType, 0, attrLists, callBack);

    },
    _getRankList(attr, order, rankType, index, attrLists, callBack) {
        let self = this;
        let _order = order[index] || 1;
        let _rankType = rankType[index] || 0;
        console.log("getRankListWithoutRoom" + attr[index] + _order + _rankType)
        BK.QQ.getRankListWithoutRoom(attr[index], _order, _rankType, function (errCode, cmd, data) {
            BK.Script.log(1, 1, "getRankListWithoutRoom callback  cmd" + cmd + " errCode:" + errCode + "  data:" + JSON.stringify(data));
            // 返回错误码信息
            if (errCode !== 0) {
                BK.Script.log(1, 1, '获取排行榜数据失败!错误码：' + errCode);
                return;
            }
            // 解析数据
            let _list = [];
            if (data) {
                for (var i = 0; i < data.data.ranking_list.length; ++i) {
                    var rd = data.data.ranking_list[i];
                    _list.push(rd);
                    // rd 的字段如下:
                    //var rd = {
                    //    url: '',            // 头像的 url
                    //    nick: '',           // 昵称
                    //    score: 1,           // 分数
                    //    selfFlag: false,    // 是否是自己
                    //};
                }
            }
            attrLists[attr[index]] = _list;
            if (attr.length > index + 1) {
                self._getRankList(attr, order, rankType, index + 1, attrLists, callBack);
            } else {
                if (callBack && typeof callBack == 'function') {
                    return callBack(attrLists);
                }
            }
        });
    },

    /********************************************************************************
     * ********************************* 分享 ***************************************
     * ******************************************************************************
     */

    /**
     * @param {* QQ聊天消息标题 } summary
     * @param {* 分享到qq QQ聊天消息图片} picUrl
     * @param {* extendInfo只能在分享至手Q中使用，分享只空间、微信、朋友圈不可用。 GameStatusInfo.gameParam 可以获取} extendInfo
     * @param {* 分享至空间、微信、朋友圈时需要的图。} localPicPath
     * @param {* 返回 分享后的结果 参数 （ 0QQ聊天窗，1空间，2微信，3朋友圈， 20及以后分享失败或取消分享 ） } callBack 
     * 
     */
    share(summary, picUrl, extendInfo, localPicPath, callBack) {

        var shareInfo = {
            summary: summary,          //QQ聊天消息标题
            picUrl: picUrl,               //QQ聊天消息图片
            extendInfo: extendInfo,    //QQ聊天消息扩展字段
            localPicPath: localPicPath,   //分享至空间、微信、朋友圈时需要的图。（选填，若无该字段，系统使用游戏对应的二维码）
        };
        console.log('share' + JSON.stringify(shareInfo));
        BK.QQ.share(shareInfo, function (retCode, shareDest, isFirstShare) {
            BK.Script.log(1, 1, "retCode:" + retCode + " shareDest:" + shareDest + " isFirstShare:" + isFirstShare);
            let shareId = 0;
            if (retCode == 0) {
                shareId = 1;
                if (shareDest == 0 /* QQ */) {
                    //聊天窗
                    BK.Script.log(1, 1, "成功分享至QQ");
                }
                else if (shareDest == 1 /* QZone */) {
                    //空间
                    BK.Script.log(1, 1, "成功分享至空间");
                }
                else if (shareDest == 2 /* WX */) {
                    //微信
                    BK.Script.log(1, 1, "成功分享至微信");
                }
                else if (shareDest == 3 /* WXCircle */) {
                    // 朋友圈
                    BK.Script.log(1, 1, "成功分享至朋友圈");
                }

            } else if (retCode == 1) {
                BK.Script.log(1, 1, "分享失败" + retCode);
                shareId = 0;
            } else if (retCode == 2) {
                BK.Script.log(1, 1, "分享失败，用户取消分享：" + retCode);
                shareId = 0;
            }

            if (callBack && typeof callBack == 'function') callBack(shareId);
        });

    },
    /**
     * 将游戏分享至手机QQ聊天窗。其他人点击该消息气泡后，会触发打开游戏。  使用网络图片
     * @param {* 分享文字} summary 
     * @param {* 图片的网络链接 } picUrl 
     * @param {* 选择好友 为true则跳出选择好友的列表} isSelectFriend 
     * @param {* 携带 自定义数据} extendInfo 
     * @param {* 成功/失败} callBack 
     * @param {* 如使用BK.Room房间逻辑，可填入对应roomId，如开发者自建房间，填0 } roomId 
     */
    shareToArk(summary, picUrl, extendInfo, callBack, isSelectFriend = true, roomId = 0, ) {

        console.log('shareToArk' + summary + picUrl + extendInfo + isSelectFriend);

        BK.QQ.shareToArk(roomId, summary, picUrl, isSelectFriend, extendInfo, function (errCode) {
            BK.Script.log(1, 1, "errCode:" + errCode);
            let shareId = 0;
            if (errCode == 0) {
                //分享成功
                shareId = 1;
            } else {
                shareId = 0;
                //分享失败
            }
            if (callBack && typeof callBack == 'function') callBack(shareId);
        })
    },

    /**
     * 将BK.Buffer中的图片内容分享至聊天窗
     * @param {*} summary 
     * @param {*} extendInfo 
     * @param {*} buff 
     * @param {*} roomId 
     */
    shareToArkFromBuff(summary, buff, extendInfo, callBack, roomId = 0) {
        //var buff = BK.FileUtil.readFile("GameRes://resource/texture/monster.png");
        BK.QQ.shareToArkFromBuff(roomId, summary, extendInfo, buff);
    },

    /**
     * 分享将本地径下的图片以及自定义数据图片的消息气泡至聊天窗,与BK.QQ.shareToArk相似，与其不同的是本接口分享的图片来自游戏本地路径
     * @param {*} summary 
     * @param {*} picPath 
     * @param {*} extendInfo 
     * @param {*} callBack 
     * @param {*} roomId 
     */
    shareToArkFromFile(summary, picPath, extendInfo, callBack, roomId = 0) {
        BK.QQ.shareToArkFromFile(roomId, summary, extendInfo, picPath)
    },

    /**
     * 截屏分享,将某个节点进行截屏后，分享至聊天窗 ，保存本地路径，然后分享
     * @param {* { x: 500, y: 1000 }; 设置截图区域原点} origin
     * @param {* { x: 500, y: 1000 }; 设置截图区域大小} size
     * @param {*} summary 
     * @param {*} node 
     * @param {*} extendInfo 
     * @param {*} callBack 
     * @param {*} roomId 
     */
    shareToArkFromNodeLocation(origin = { x: 500, y: 1000 }, size = { width: 500, height: 1000 }, summary, extendInfo, callBack, roomId = 0) {
        let self = this;
        var gl = bkWebGLGetInstance();
        var ss = new BK.ScreenShot();
        ss.origin = origin;// { x: 500, y: 1000 };// 设置截图区域原点
        ss.size = size;//  { width: 500, height: 1000 };// 设置截图区域大小
        var buffer = ss.shotToBuffFromGL(gl, function (path) {
            //path为生成截图的路径
            // 分享给好友
            self.shareToArkFromFile(summary, path, extendInfo, callBack, roomId)
        });
        //BK.QQ.shareToArkFromNode(roomId, summary, extendInfo, node)   
    },

    /** 推荐使用此方法
    * 
    * 截屏分享,将某个节点进行截屏后，分享至聊天窗 ，截屏保存为 BK.Buffer，然后分享
    * @param {* { x: 500, y: 1000 }; 设置截图区域原点} origin
    * @param {* { x: 500, y: 1000 }; 设置截图区域大小} size
    * @param {*} summary 
    * @param {*} node 
    * @param {*} extendInfo 
    * @param {*} callBack 
    * @param {*} roomId 
    */
    shareToArkFromNodeBuffer(origin = { x: 500, y: 1000 }, size = { width: 500, height: 1000 }, summary, extendInfo, callBack, roomId = 0) {
        let self = this;
        var gl = bkWebGLGetInstance();
        var ss = new BK.ScreenShot();
        ss.origin = origin;// { x: 500, y: 1000 };// 设置截图区域原点
        ss.size = size;//  { width: 500, height: 1000 };// 设置截图区域大小
        var buffer = ss.shotToBuffFromGL(gl, function (buff) {
            //path为生成截图的路径
            // 分享给好友
            self.shareToArkFromBuff(summary, buff, extendInfo, callBack, roomId)
        });
        //BK.QQ.shareToArkFromNode(roomId, summary, extendInfo, node)   
    },

    /*********************************************************************************************************************
     * ****************************** 个人数据存储 ************************************************************************
     * *******************************************************************************************************************
     */

    /**
     * 保存个人数据
     * @param {* 历史最高分} score
     * @param {* 个人数据 } _data
     */
    saveGameData(score = 0, _data) {

        // 存储游戏个人私有数据
        var data = {
            maxScore: score,              // 一个历史最高积分
            // 不同游戏模式下存的数据，列表来的，可以根据自身需求使用，这里面的数据，后台不做任何处理，怎么来怎么回
            modeDatas: _data,
        }
        console.log('saveGameData' + JSON.stringify(data));
        BK.QQ.saveGameData(data, function (errCode, cmd, data) {
            BK.Script.log(1, 1, 'saveGameData : ' + errCode + ', ' + cmd + ', ' + JSON.stringify(data));
        });
    },
    /**
     * 个人数据拉取
     * @param {*} callBack 
     */
    loadGameData(callBack) {
        // 拉取游戏个人私有数据
        BK.QQ.loadGameData(function (errCode, cmd, data) {
            // 这里返回的 data，就是上面存储游戏个人私有数据时候传入的 data
            BK.Script.log(1, 1, 'loadGameData : ' + errCode + ', ' + cmd + ', ' + JSON.stringify(data) + data + callBack);
            //let _data = JSON.parse(data);
            if (callBack && typeof callBack == 'function') callBack(data);
        });
    },



    /************************************************************************************************
     * ***************************************** 广告激励 ****************************************
     * **********************************************************************************************
     */
    /**
     * 视频广告激励
     * @param {* 激励视频广告场景 0.游戏页面挂件广告 1.游戏结算页广告 2.游戏任务广告  3.游戏复活广告} _videoType
     * @param {* 成功回调 } successFunc
     * @param {* 失败回调 } failFunc
     */
    playVideoAd(_videoType = 0, successFunc, failFunc) {
        let self = this;
        //1.拉取广告
        var videoType = _videoType; //激励视频广告场景 0.游戏页面挂件广告 1.游戏结算页广告 2.游戏任务广告  3.游戏复活广告
        var vHandle = undefined;
        var isAwards = false;
        BK.Advertisement.fetchVideoAd(videoType, function (retCode, msg, handle) {
            //retCode 返回错误码
            //msg       返回信息
            //handle  广告句柄
            //BK.Script.log(1, 1, "我的广告" + retCode + 'msg:::::::' + JSON.stringify(msg) + "我的hanlde::+++++++++++" + JSON.stringify(handle));
            //返回码0表示成功
            if (retCode == 0) {
                vHandle = handle;
                //2.监听事件
                handle.setEventCallack(
                    function (code, msg) {
                        BK.Script.log(1, 1, "closeGame"); //关闭游戏
                    }.bind(self),
                    function (code, msg) {
                        BK.Script.log(1, 1, "endVide 到看广告时长要求，可以下发奖励code:" + code + " msg:" + msg);//达到看广告时长要求，可以下发奖励
                        isAwards = true;
                    }.bind(self),
                    function (code, msg) {
                        if (isAwards) {
                            if (successFunc && typeof successFunc == 'function') {
                                isAwards = false;
                                successFunc();
                            }
                        } else {
                            if (failFunc && typeof failFunc == 'function') {
                                failFunc();
                            }
                        }
                        BK.Script.log(1, 1, "endVide 关闭视频webviewcode:" + code + " msg:" + msg);//关闭视频webview
                        //if (failFunc && typeof failFunc == 'function') failFunc();
                    }.bind(self),
                    function (code, msg) {
                        BK.Script.log(1, 1, "endVide 开始播放视频code:" + code + " msg:" + msg);//开始播放视频
                    }.bind(self));
                //3.跳转至播放界面
                handle.jump();
            } else {
                BK.Script.log(1, 1, "error:拉取视频广告失败" + retCode + " msg:" + msg); //拉取视频广告失败
                if (failFunc && typeof failFunc == 'function') failFunc();
            }
        }.bind(self))
    },
    /**
     * banner 广告
     */
    playBannerAd() {
        //BK.Script.loadlib("GameRes://libs/qqPlayCore.js");
        this._playBannerAD();
        if (this._adTime) {
            this._adTime.dispose();
            this._adTime = null;
        }
        var t = new BK.Ticker();
        t.interval = BANNERAD_TIEMS;
        t.setTickerCallBack(this.blPlayBannerAD);
        this._adTime = t;
    },
    blPlayBannerAD(ts, duration) {
        if (this._bannerAd) {
            this._playBannerAD();
        }

    },
    _playBannerAD(ts, duration) {
        let self = this;
        if (this._adBannerHandle) {
            this._ishide = true;
            //this._adBannerHandle.close();
            this._adBannerHandle = null;
        }
        console.log("拉取广告")
        BK.Advertisement.fetchBannerAd(function (retCode, msg, adBannerHandle) {
            if (retCode == 0) {
                //2.开发者 使用adBannerHanlde 
                //2.1 决定是否展示
                this._adBannerHandle = adBannerHandle;
                this._ishide = false
                if (this._bannerAd) {
                    this.showBannerAd();
                }
                // adBannerHandle.show(function (succCode, msg, handle) {
                //     if (succCode == 0) {
                //         //
                //     }
                //     else {
                //         BK.Script.log(1, 1, "展示失败 msg:" + msg);
                //     }
                // });
                //2.2 开发者主动关闭广告。
                //adBannerHandle.close(); 
                //2.3 开发者监听事件

            }
            else {
                BK.Script.log(1, 1, "fetchBannerAd failed. retCode:" + retCode);
            }
        }.bind(this));

    },
    /**
     * 显示 banner 广告
     */
    showBannerAd() {
        this._bannerAd = true;
        if (this._adBannerHandle && !this._isOnLad && !this._ishide) {
            this._ishide = true;
            this._isOnLad = true;
            this._adBannerHandle.show(function (succCode, msg, handle) {
                if (succCode == 0) {
                    //
                    console.log("展示成功1" + succCode + JSON.stringify(msg))
                }
                else {
                    BK.Script.log(1, 1, "展示失败 msg:" + msg);
                }
                this._isOnLad = false;
            }.bind(this));
            //this._adBannerHandle.show();
        } else {
            //this._playBannerAD();
        }
    },
    /**
     * 关闭/隐藏 banner 广告
     */
    hideBannerAd() {
        console.log("关闭广告")
        this._bannerAd = false;
        if (this._adBannerHandle && this._ishide && !this._isOnLad) {
            this._adBannerHandle.close();
            this._ishide = false;
            //this._adBannerHandle.hide();
            //this._adBannerHandle = null;
        }
    },

    /**
     * 获取名字
     * @param {*} openID 
     * @param {* callBack(openID, nick) 回调返回两个参数} callBack 
     */
    getNick(openID, callBack) {
        console.log("getNick" + openID);
        BK.MQQ.Account.getNick(openID, callBack);
    },
    /**
     * 获取头像
     * @param {*} openID 
     * @param {*callBack(openID, BuffInfo)} callBack 
     */
    getHead(openID, callBack) {
        BK.MQQ.Account.getHead(openID, callBack);
    },
    /**
     * 检查公众号 是否关注
     * @param {*} PUIN 
     * @param {*} callBack 
     */
    checkPubAccountState(PUIN, callBack) {
        PUIN = PUIN || "228286369";
        BK.QQ.checkPubAccountState(PUIN, function (errCode, cmd, data) {
            BK.Script.log(0, 0, " callback errCode = " + errCode + " cmd = " + cmd + " data = " + data);
            if (data.is_follow == 1) {
                //已关注
                if (callBack && typeof callBack == 'function') callBack(1);
            } else {
                //未关注
                if (callBack && typeof callBack == 'function') callBack(0);
            }
        });
    },
    /**
     * 进入公众号
     * @param {*} PUIN 
     */
    enterPubAccountCard(PUIN) {
        PUIN = PUIN || "228286369";
        BK.QQ.enterPubAccountCard(PUIN);
    },
    /**
     * 跳转其他游戏
     * @param {*} gameId 
     * @param {*} extendInfo 
     */
    skipGame(gameId, extendInfo) {
        BK.QQ.skipGame(gameId, extendInfo);
    },
    /**
     * andriod 发送游戏快捷方式到桌面
     * @param {*} extendInfo 
     */
    createShortCut(extendInfo) {
        BK.QQ.createShortCut(extendInfo);
    },
    /**
     * 上报运维数据
     * @param {*} infoList 
     * @param {*} baseInfo 
     * @param {*} playerAttr 
     * @param {*} passInfo 
     */
    reportGameResult(infoList, baseInfo, playerAttr = null, passInfo = null) {

        // var gameResultData = {
        //     "infoList": [              //通用数据上报列表
        //         {
        //             "type": 1,         //必选。数据类型。
        //             "op": 1,           //必选。运营类型。1表示增量，2表示存量。
        //             "num": 1,          //必选。数目。不超过32位有符号数。
        //             "extId": 1         //可选。扩展Id。用于特殊数据的上报，如果要填，不能是0。
        //         }
        //     ],

        //     //以下字段为兼容历史，优先使用上面的“通用数据上报”。
        //     "baseInfo": {              //基本信息
        //         "score": 80,           //分数
        //         "gameMode": 1,         //游戏模式。1：普通，2：挑战
        //         "playWay": 1,          //互动方式。1：单人，2：邀请好友，3：被好友邀请，4：匹配赛
        //     },
        //     "playerAttr": {            //玩家属性（可选）
        //         "level": 3,            //玩家的经验等级（时间积累）
        //         "danLevel": 6,         //玩家的战力等级（游戏技能）
        //         "power": 300           //玩家战斗力
        //     },
        //     "passInfo": {              //过关信息（可选）
        //         "passNum": 3,          //本局游戏通过的最高关卡数，比如本局游戏通过了8,9,10关，上报10（不关注以前是否通过第10关）
        //         "passList": [{         //本局游戏通过的关卡列表
        //             "index": 1,        //第几关
        //         }],
        //         "upPassNum": 1         //本局游戏新通过关卡数，比如通过了8,9,10关,9,10是以前没有通过的，上报2
        //     }
        // };
        var gameResultData = {
            "infoList": infoList,
            "baseInfo": baseInfo,
        }
        if (playerAttr) {
            gameResultData['gameResultData'] = playerAttr;
        }
        if (passInfo) {
            gameResultData['passInfo'] = passInfo;
        }
        BK.QQ.reportGameResult(gameResultData, function (errCode, cmd, data) {
            if (errCode !== 0) {
                //上报运营结果失败
                console.log('上报运营结果失败');
            } else {
                //上报运营结果成功
                console.log('上报运营结果成功');
            }
        });
    }

}

module.exports = qqPlay;
