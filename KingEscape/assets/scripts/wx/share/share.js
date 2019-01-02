var urls = require('route').urls
var config = require('config');
var global = require('global');
var globalFunc = require('globalFunc');
var util = require('util');
var consume = require('consume').getInstance();
var shareUtil = require('shareUtil').getInstance();
var qqPlay = require('qqPlay');
var tokenMgr = require('tokenMgr');
//使用cc.game.event_show 功能 ，不用微信分享回调功能
var CC_GMAE_ONSHOW_OPEN = 1;//global.getShareChannel();
var self = null;
var that = null;
export default class share {
  constructor() {
    self = this;
    //this.shareTicket = ''  
    self._getStorage();
    var path = cc.url.raw('resources/share/share1.jpg');
    if (cc.loader.md5Pipe) {
      path = cc.loader.md5Pipe.transformURL(path);
    }
    self._url = [{ url: path }];
    path = cc.url.raw('resources/share/share2.jpg');
    if (cc.loader.md5Pipe) {
      path = cc.loader.md5Pipe.transformURL(path);
    }
    self._url.push({ url: path });

    CC_GMAE_ONSHOW_OPEN = global.getShareChannel();

    this.gameEvent();
    this._shareLxTime = 0;
    // 分享成功/失败 时间
    this._shareMinTime = global.getShareMinTime();
    // 连续分享 3次设置最小时间 小于time 
    this._shareLXMinTime = global.getLXShareTime();
    // 分享策略  
    this._sharePolicy = parseInt(global.getUserDataInfoByName('sharePolicy')) || 1;
    this.updateShareMenu();
    this.showShareMenu();
    this.onShareAppMessage();
  };
  /**
   * 模拟分享系数数据初始化
   */
  getShareTimeInfo() {
    let that = this;
    if (!this._shareTimeInfo) {
      //分享方案
      if (this._sharePolicy == 1) {
        this._shareTimeInfo = cc.sys.localStorage.getItem('shareTimeInfo');
      } else if (this._sharePolicy == 2) {
        this._shareTimeInfo = cc.sys.localStorage.getItem('shareTimeInfoPolicy_2');
      }
      //分享成功次数
      this._shareCount = parseInt(cc.sys.localStorage.getItem('shareCount'));
      if (!this._shareCount) {
        this._shareCount = 0;
      }
      // 方案一 递减方案
      this._func = () => {
        this._shareTimeInfo = {};
        this._shareTimeInfo['shareFirstTime'] = parseInt(global.getUserDataInfoByName('shareFirstTime')) || 1500; // 默认基础时间 g
        this._shareTimeInfo['shareBaseTime'] = parseInt(global.getUserDataInfoByName('shareBaseTime')) || 3000; // 默认基础时间 A
        this._shareTimeInfo['shareReduce'] = parseInt(global.getUserDataInfoByName('shareReduceTime')) || 500;  // 每次消减时间 B
        this._shareTimeInfo['shareLowerTime'] = parseInt(global.getUserDataInfoByName('shareLowerTime')) || 1500; // 降低最小时间 c
        this._shareTimeInfo['shareMinTime'] = parseInt(global.getUserDataInfoByName('shareMinTime')) || 2000; // 配置最低时间 D
        this._shareTimeInfo['shareValueStr'] = global.getUserDataInfoByName('shareValueStr') || '3|5|7|10'; //新的失败变量 str需要解析 h
        this._shareTimeInfo['shareVal'] = {};
        let _svs = this._shareTimeInfo['shareValueStr'].split('|');
        _svs.forEach(element => {
          that._shareTimeInfo['shareVal'][parseInt(element)] = 1;
        });
        this._shareTimeInfo.shareProb = global.getUserDataInfoByName('sharefailprob') || 50; //失败概率 百分比 F
        this._shareTimeInfo.shareMode = 0;  // 模式判断，降低到最小时间，模式为1。使用shareMinTime时间
        cc.sys.localStorage.setItem('shareTimeInfo', JSON.stringify(this._shareTimeInfo));
      }
      // 方案二 递增方案
      this._func_2 = () => {
        this._shareTimeInfo = {};
        this._shareTimeInfo['shaTipTim_2'] = parseInt(global.getUserDataInfoByName('shaTipTim_2')) || 2000; // ‘分享无效’ Tips 无对话框提示, 默认最小时间 A;  
        this._shareTimeInfo['shaPolBasTim_2'] = parseInt(global.getUserDataInfoByName('shaPolBasTim_2')) || 3000; // 默认基础时间 B;
        this._shareTimeInfo['shaFirFailPro_2'] = parseInt(global.getUserDataInfoByName('shaFirFailPro_2')) || 50;  // 每日第一次分享失败概率 C
        this._shareTimeInfo['shaOneFailPro_2'] = parseInt(global.getUserDataInfoByName('shaOneFailPro_2')) || 30; // 连续分享第一次成功，下一次的失败概率 D
        this._shareTimeInfo['shaTwoFailPro_2'] = parseInt(global.getUserDataInfoByName('shaTwoFailPro_2')) || 50; // 连续分享第二次成功，下一次的失败概率 E
        this._shareTimeInfo['shaThrFailPro_2'] = parseInt(global.getUserDataInfoByName('shaThrFailPro_2')) || 100; // 连续分享第三次成功，下一次的失败概率 F
        this._shareTimeInfo['shaSucCou_2'] = parseInt(global.getUserDataInfoByName('shaSucCou_2')) || 4; //累计成功次数 G
        this._shareTimeInfo['shaPolBasUpTim_2'] = parseInt(global.getUserDataInfoByName('shaPolBasUpTim_2')) || 3800; // 累计成功G次后,基础时间提高到 H;
        this._shareTimeInfo['shaSucCouTwo_2'] = parseInt(global.getUserDataInfoByName('shaSucCouTwo_2')) || 7; //累计成功次数 I
        this._shareTimeInfo['shaPolBasUpTwoTim_2'] = parseInt(global.getUserDataInfoByName('shaPolBasUpTwoTim_2')) || 4500; // 累计成功I次后,基础时间提高到 J

        this._shareTimeInfo['couSucTimes_2'] = 0; // 连续成功次数；
        cc.sys.localStorage.setItem('shareTimeInfoPolicy_2', JSON.stringify(this._shareTimeInfo));
      }
      //处理
      this._doFunc = () => {
        if (this._sharePolicy == 1) {
          this._func();
        } else if (this._sharePolicy == 2) {
          this._func_2();
        }
        this._shareTimeInfo.timestamp = new Date().getTime();
        this._shareCount = 0;
        cc.sys.localStorage.setItem('shareCount', this._shareCount);

      }
      if (!this._shareTimeInfo) {
        this._doFunc();
      } else {
        this._shareTimeInfo = JSON.parse(this._shareTimeInfo);
        //每日清空
        if (new Date().toDateString() != new Date(this._shareTimeInfo.timestamp).toDateString()) {
          this._doFunc();
        }
      }
    }
    console.log(' this._shareTimeInfo', this._shareTimeInfo);
  };
  /**
   * 分享失败后数据更新
   */
  updateFailShareTimeInfo() {
    if (!this._shareTimeInfo.shareMode) {
      this._shareTimeInfo.shareBaseTime -= this._shareTimeInfo.shareReduce;
      if (this._shareTimeInfo.shareBaseTime < this._shareTimeInfo.shareLowerTime) {
        this._shareTimeInfo.shareBaseTime = this._shareTimeInfo.shareMinTime;
        this._shareTimeInfo.shareMode = 1;
      }
      cc.sys.localStorage.setItem('shareTimeInfo', JSON.stringify(this._shareTimeInfo));
    }

  };
  /**
   * 分享时间递增 数据更新
   * @param {*} flag 
   */
  updSucShaTimCouTimes(flag = false) {
    // 分享成功
    if (flag) {
      //累计成功次数 调整 分享成功时间
      if ((this._shareCount + 1) > this._shareTimeInfo.shaSucCou_2) {
        this._shareTimeInfo.shaPolBasTim_2 = this._shareTimeInfo.shaPolBasUpTim_2;
      };
      if ((this._shareCount + 1) > this._shareTimeInfo.shaSucCouTwo_2) {
        this._shareTimeInfo.shaPolBasTim_2 = this._shareTimeInfo.shaPolBasUpTwoTim_2;
      }
      //连续成功次数
      this._shareTimeInfo['couSucTimes_2'] += 1;

    } else {   // 分享失败
      ///连续成功次数 归零
      this._shareTimeInfo['couSucTimes_2'] = 0;
    }
    cc.sys.localStorage.setItem('shareTimeInfoPolicy_2', JSON.stringify(this._shareTimeInfo));
  };
  /**
   * 更新成功分享次数
   */
  updateShareTimesInfo() {
    this._shareCount++;
    cc.sys.localStorage.setItem('shareCount', this._shareCount);
  };
  /**
   *  游戏事件监听
   */
  gameEvent() {
    let selfs = this;
    if (cc.sys.platform == cc.sys.WECHAT_GAME) {
      wx.onHide(function () {
        selfs._hideTime = new Date().getTime();
        //console.log("selfs.shareMessageFlag EVENT_HIDE", selfs.shareMessageFlag)
      })
      wx.onShow(function (res) {
        //console.log("selfs.shareMessageFlag EVENT_SHOW", selfs.shareMessageFlag)
        if (selfs.shareMessageFlag) {
          selfs.shareMessageFlag = false
          if (CC_GMAE_ONSHOW_OPEN) {
            selfs.getShareTimeInfo();
            selfs.doShareEvent();
          }
        }
      })
    }
    // cc.game.on(cc.game.EVENT_HIDE, function () {
    //   selfs._hideTime = new Date().getTime();
    //   console.log("selfs.shareMessageFlag EVENT_HIDE", selfs.shareMessageFlag)
    // })
    // cc.game.on(cc.game.EVENT_SHOW, function () {
    //   console.log("selfs.shareMessageFlag EVENT_SHOW", selfs.shareMessageFlag)
    //   if (selfs.shareMessageFlag) {
    //     selfs.shareMessageFlag = false
    //     if (CC_GMAE_ONSHOW_OPEN) {
    //       selfs.getShareTimeInfo();
    //       selfs.doShareEvent();
    //     }
    //   }
    // })
  };
  /**
   * 显示提示框
   */
  _showModal(flag = false) {
    if (flag) {
      this._showModal_1();
      return;
    }
    wx.showModal({
      title: '提示',
      content: '分享失败，请换一个群再试试！',
      showCancel: true,
      cancelText: '知道了',
      confirmText: '重新分享',
      success: function (res) {
        if (res.confirm) {
          this._shareAppMessage(this._shareMsg.callBack, this._shareMsg.num, this._shareMsg.score, this._shareMsg.isSpecial, this._shareMsg.obj, this._shareMsg.isPeople, this._shareMsg.gold,
            this._shareMsg.wxAddLayer, this._shareMsg.isAssit, this._shareMsg.isRevive, this._shareMsg.isVip, this._shareMsg.groupWithTimes,
            this._shareMsg.isQQShare, this._shareMsg.inviteFriend, this._shareMsg.newInvite, this._shareMsg.inviteGroup, this._shareMsg.shareTag);
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }.bind(this)
    })
  };
  /**
   * 不飘提示框的提示
   */
  _showModal_1() {
    if (!this._showModalNode) {
      let canvas = cc.find('Canvas');
      let node = new cc.Node('showModal');
      let spr = node.addComponent(cc.Sprite);
      cc.loader.loadRes('share/shareBg', cc.SpriteFrame, function (err, sprts) {
        if (err) {
          console.error(err);
          return;
        }
        sprts.insetTop = 13;
        sprts.insetBottom = 13;
        sprts.insetLeft = 13;
        sprts.insetRight = 13;

        spr.spriteFrame = sprts;
        spr.type = cc.Sprite.Type.SLICED;
        node.setContentSize(480, 60);
      }.bind(this));
      let labeNode = new cc.Node();
      labeNode.setContentSize(480, 60);
      let label = labeNode.addComponent(cc.Label);
      label.string = '分享无效';
      label.fontSize = 46;
      label.lineHeight = 48;
      node.addChild(labeNode);
      this._showModalNode = node;
      canvas.addChild(this._showModalNode, 3000);
      this._showModalNode.setPosition(0, 0);
    }
    this._showModalNode.stopAllActions();
    this._showModalNode.y = 100;
    this._showModalNode.opacity = 0;
    this._showModalNode.active = true;
    this._showModalNode.runAction(cc.sequence(cc.spawn(cc.moveBy(0.4, cc.v2(0, 50)), cc.fadeIn(0.4)), cc.delayTime(1), cc.spawn(cc.moveBy(0.5, cc.v2(0, 100)), cc.fadeOut(0.5)), cc.callFunc(function () {
      this._showModalNode.active = false;
    }.bind(this))))

  }
  /** 
  * 策略方案
  */
  policyFunc() {
    let flag = false;
    let _curTime = new Date().getTime();
    if (this._sharePolicy == 1) {
      flag = this._policyFunc_1(_curTime);
    } else if (this._sharePolicy == 2) {
      flag = this._policyFunc_2(_curTime);
    }
    return flag;
  };
  /**
   * 方案1
   * @param {*} _showTime 
   */
  _policyFunc_1(_showTime) {
    if (this._shareCount == 0) {
      if (_showTime - this._hideTime < this._shareTimeInfo.shareFirstTime) {
        this._showModal();
        return false;
      }
    } else {
      if (this._shareTimeInfo.shareVal[this._shareCount]) {
        let rd = Math.floor(Math.random() * 100);
        let it = rd > this._shareTimeInfo.shareProb ? 1 : 0;
        if (!it) {
          this._showModal();
          return false;
        }
      } else {
        if (_showTime - this._hideTime < this._shareTimeInfo.shareBaseTime) {
          this.updateFailShareTimeInfo();
          this._showModal();
          return false;
        }
      }
    }
    return true;
  };
  /**
  * 方案2
  * @param {*} curTime 
  */
  _policyFunc_2(curTime) {
    let flag = true;
    let _time = curTime - this._hideTime
    //第一次判断
    if (this._shareCount == 0) {
      if (_time < this._shareTimeInfo.shaPolBasTim_2) {
        flag = false;
      } else {
        //概率判定
        let rand = Math.floor(Math.random() * 100);
        if (rand <= this._shareTimeInfo.shaFirFailPro_2) {
          flag = false;
        }
      }
    } else {
      //时间判断
      if (_time < this._shareTimeInfo.shaPolBasTim_2) {
        flag = false;
      } else {
        //概率判断
        let rand = Math.floor(Math.random() * 100);
        if (this._shareTimeInfo.couSucTimes_2 >= 3) {
          if (rand <= this._shareTimeInfo.shaThrFailPro_2) {
            flag = false;
          }
        } else if (this._shareTimeInfo.couSucTimes_2 >= 2) {
          if (rand <= this._shareTimeInfo.shaTwoFailPro_2) {
            flag = false;
          }
        } else if (this._shareTimeInfo.couSucTimes_2 >= 1) {
          if (rand <= this._shareTimeInfo.shaOneFailPro_2) {
            flag = false;
          }
        }
      }
    }
    if (!flag) {
      this._showModal(_time < this._shareTimeInfo['shaTipTim_2']);
    }
    //更新数据
    this.updSucShaTimCouTimes(flag);
    return flag;
  };

  /**
   * 处理分享事件
   * @param {*} flag 
   */
  doShareEvent(flag) {
    if (cc.sys.platform == cc.sys.WECHAT_GAME) {
      if (!this._shareMsg['shareTag'] && !this._shareMsg['score']) {
        if (!this.policyFunc()) {
          return;
        }
      }
    }
    this.updateShareTimesInfo();
    let res = {};
    //let callBack,score,isSpecial,isPeople,gold,wxAddLayer,isAssit,isRevive,isVip,groupWithTimes = this._shareMsg;
    let callBack = this._shareMsg.callBack;
    let score = this._shareMsg.score;
    let isSpecial = this._shareMsg.isSpecial;
    let obj = this._shareMsg.obj;
    let isPeople = this._shareMsg.isPeople;
    let gold = this._shareMsg.gold;
    let wxAddLayer = this._shareMsg.wxAddLayer;
    let isAssit = this._shareMsg.isAssit;
    let isRevive = this._shareMsg.isRevive;
    let isVip = this._shareMsg.isVip;
    let groupWithTimes = this._shareMsg.groupWithTimes;
    let isQQShare = this._shareMsg.isQQShare;

    let randString = this._shareMsg.randString;
    var shareHasCallBack = false;
    if (!!!config.gamecenter_link) {
      if (isSpecial) {
        self._setStorage();
        if (!!!shareHasCallBack && callBack && typeof callBack == "function") {
          shareHasCallBack = true
          callBack.call(obj);
        }
      }
    }
    if (gold) {
      let shareWithGold = false;
      if (wxAddLayer._isShareWithGold) {
        let isShareGold = Math.floor(Math.random() * 10) % 3;
        if (isShareGold === 1) {
          if (wxAddLayer.isVip()) {
            let val = wxAddLayer.getVipStableAbilityValue('s_gold');
            gold += val;
          }
          consume.addGold(gold);
          wxAddLayer._isShareWithGold = false;
          shareWithGold = true;
        };
      }
      //}
      if (!!!shareHasCallBack && callBack && typeof callBack == "function") {
        shareHasCallBack = true
        callBack.call(obj, shareWithGold, gold);
      }
    }
    if (isAssit) {
      global.addRandString(randString);
      if (!!!shareHasCallBack && callBack && typeof callBack == "function") {
        shareHasCallBack = true
        callBack.call(obj);
      }
    }
    if (isRevive) {
      global.addRandString(randString);
      if (!!!shareHasCallBack && callBack && typeof callBack == "function") {
        shareHasCallBack = true
        callBack.call(obj);
      }
    }
    var isGroup = 1;
    if (res.shareTickets && res.shareTickets[0]) {
      //if(config.gamecenter_link && tokenMgr.checkToken()){

      //}
      //保存shareTicket
      config.shareTicket = res.shareTickets[0];
      if (!!!shareHasCallBack && callBack && typeof callBack == "function") {
        shareHasCallBack = true;
        isGroup = 1;
        if (groupWithTimes) {
          this.getShareInfo(res.shareTickets[0], callBack);
        } else {
          callBack.call(obj, isGroup);
        }

        //callBack.call(obj,isGroup);
      }
    };
    if (isQQShare) {
      if (!!!shareHasCallBack && callBack && typeof callBack == "function") {
        shareHasCallBack = true
        callBack.call(obj, flag);
      }
    }

    if (isPeople) {
      //console.log("getShareInfo",isSpecial)
      if (!!!shareHasCallBack && callBack && typeof callBack == "function") {
        shareHasCallBack = true
        callBack.call(obj);
      }
    } else {
      if (!!!shareHasCallBack && callBack && typeof callBack == "function") {
        shareHasCallBack = true
        callBack.call(obj, isGroup);
      }
    }
    if (score) {
      if (!!!shareHasCallBack && callBack && typeof callBack == "function") {
        shareHasCallBack = true
        callBack.call(obj);
      }
    }
  };
  //存储
  _getStorage() {
    let _sharedGroupList;
    let sharedGroupListItem = cc.sys.localStorage.getItem('sharedGroupList');
    if (!sharedGroupListItem) {
      sharedGroupListItem = new Array();
      cc.sys.localStorage.setItem('sharedGroupList', JSON.stringify(sharedGroupListItem));

      _sharedGroupList = sharedGroupListItem;
    } else {
      _sharedGroupList = JSON.parse(sharedGroupListItem);
    }
    let i = _sharedGroupList.length;
    while (i--) {
      let groupInfo = _sharedGroupList[i];
      // 删除过期记录
      if (!self.isToday(groupInfo.timestamp)) {
        console.log('timestamp Invalid, not today:', groupInfo.timestamp);
        _sharedGroupList.splice(i, 1);
      }
    }
    config.shareGroupTime = _sharedGroupList.length;
    console.log("config.shareGroupTime", config.shareGroupTime, _sharedGroupList)
  }
  _setStorage() {
    let groupInfo = {
      timestamp: new Date().getTime()
    }
    let _sharedGroupList;
    let sharedGroupListItem = cc.sys.localStorage.getItem('sharedGroupList');
    if (!sharedGroupListItem) {
      sharedGroupListItem = new Array();
      cc.sys.localStorage.setItem('sharedGroupList', JSON.stringify(sharedGroupListItem));

      _sharedGroupList = sharedGroupListItem;
    } else {
      _sharedGroupList = JSON.parse(sharedGroupListItem);
    }
    _sharedGroupList.push(groupInfo);

    config.shareGroupTime = _sharedGroupList.length;
    console.log('config.shareGroupTime,  today:', config.shareGroupTime);
    cc.sys.localStorage.setItem('sharedGroupList', JSON.stringify(_sharedGroupList));
  }
  isToday(time) {
    return new Date(time).toDateString() === new Date().toDateString();
  }
  _getImgUrl(index) {
    return self._url[index].url;
  }
  // getShareTicket(){
  //   return this.shareTicket
  // };
  // 转发后； 点击 转发的卡片 会得到一个shareTicket 通过调用 wx.getShareInfo() 接口传入 shareTicket 可以获取群相关信
  updateShareMenu = function () {
    console.log("updateShareMenu")
    if (cc.sys.platform == cc.sys.WECHAT_GAME) {
      wx.updateShareMenu({
        withShareTicket: false,
        success: function (res) {
          console.log("updateShareMenu true res:", res)
        },
        fail: function (res) {
          console.log("updateShareMenu fail res:", res)
        },
        complete: function (res) { },
      })
    }
  };
  //  右上角可以点击转发按钮
  showShareMenu = function () {
    console.log("showShareMenu")
    if (cc.sys.platform == cc.sys.WECHAT_GAME) {
      wx.showShareMenu({
        withShareTicket: true,
        success: function (res) {
          console.log("showShareMenu true res:", res)
        },
        fail: function (res) {
          console.log("showShareMenu fail res:", res)
        },
        complete: function (res) { },
      })
    }
  };
  onShareAppMessage = function () {
    if (cc.sys.platform == cc.sys.WECHAT_GAME) {
      wx.onShareAppMessage(function (res) {
        // 用户点击了“转发”按钮
        var _index = (Math.floor(Math.random() * 10)) % self._url.length;
        var _imageUrl = self._getImgUrl(_index);
        var _title = 0;
        var _titleIndex = (Math.floor(Math.random() * 10)) % config.shareTitles['1'].length;
        _title = config.shareTitles['1'][_titleIndex].title;
        //服务器文案
        var _materialID = -1;
        if (typeof global.shareList['1'] != "undefined" && config.isShowyd) {
          console.log("shareList", global.shareList);
          console.log(global.shareList['1']);
          if (global.shareList['1'].length > 0) {
            var _random = Math.floor(Math.random() * global.shareList['1'].length);
            _title = global.shareList['1'][_random].content;
            _imageUrl = global.shareList['1'][_random].cdnurl;
            _materialID = global.shareList['1'][_random].materialID;
            console.log(_imageUrl);
          }
        }
        self.reportShare(_materialID);
        return {
          title: _title,
          imageUrl: _imageUrl,
          query: "uid=" + config.UID + "&materialID=" + _materialID,
          success: res => {
            console.log("onShareAppMessage success", res, self, this)
            if (res.shareTickets) {
              if (res.shareTickets && res.shareTickets[0] && self) {
                if (config.gamecenter_link) {
                  self.getShareInfo(res.shareTickets[0], self.shareGroup);
                }
              }
            }
          },
          fail: res => {
            console.log(res)
          }
        }
      })
    }
  };
  //分享群
  shareGroup = function (groupid) {
    var url = urls.user + "/add_group";
    var param = {
      groupid: groupid,
    };
    util.request({
      url: url,
      data: param,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      success: res => {
        var d = res.data;
      },
      fail: function (er) {
        console.error(er);
      }
    })
  };
  getShareOpenGid = function (res, callBack) {
    var url = urls.share + "/getShareInfo";
    var param = {
      sessionKey: config.sessionkey,
      encryptedData: res.encryptedData,
      iv: res.iv,
    }
    util.request({
      url: url,
      data: param,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      success: res => {
        //服务器存储的用户数据
        console.log("send getShareInfo ", res)
        if (res.data && res.data.data && res.data.data.openGId) {
          //保存群的openGID;
          config.groupOpenGID = res.data.data.openGId;
          if (callBack && typeof callBack == 'function') callBack(res.data.data.openGId)
        }

      },
      fail: res => {
        console.log("send getShareInfo fail ", res)
      },
    })
  };

  getShareOpenGidLocal = function (res, callBack) {
    util.decodeOpenId(res, function (openid) {
      if (openid && callBack && typeof callBack == 'function') {
        callBack(openid);
      }
    });
  };

  getShareInfo = function (_shareTicket, callBack) {
    wx.getShareInfo({
      shareTicket: _shareTicket,
      success: res => {
        //保存shareTicket
        config.shareTicket = _shareTicket;
        // if(config.gamecenter_link){
        //   this.getShareOpenGid(res,callBack);
        // }else{
        // 解密拿到群openid后保存到本地  
        util.getGroupDecode(res, function (gopenid) {
          console.log('get group open id:', gopenid);
          let isSave = shareUtil.setShareGroupInfo(gopenid);
          if (callBack) {
            callBack(isSave);
          }
        }, function () {
          //失败都返回1；
          if (callBack) {
            callBack(1);
          }
        })
        // this.getShareOpenGidLocal(res, function (gopenid) {
        //   console.log('get group open id:', gopenid);
        //   let isSave = shareUtil.setShareGroupInfo(gopenid);
        //   if(callBack){
        //       callBack(isSave);
        //   }
        // })
        //}

      },
      fail: res => {
        console.log('getShareInfo fail', res)
      }
    });
  };
  shareAppMessage = function (callBack, num = -1, score = false, isSpecial = false, obj = false, isPeople = false, wxAddLayer = false, gold = false, isAssit = false) {
    self._shareAppMessage(callBack, num, score, isSpecial, obj, isPeople, gold, wxAddLayer, isAssit)
  };

  shareAppMessageWithVip = function (callBack, num = -1, score = false, isSpecial = false, obj = false, isPeople = false, wxAddLayer = false, gold = false, isAssit = false) {
    self._shareAppMessage(callBack, num, score, isSpecial, obj, isPeople, gold, wxAddLayer, isAssit, false, true);
  }

  shareAppMessageWithRevived = function (callBack, num = -1, score = false, isSpecial = false, obj = false, isPeople = false, wxAddLayer = false, gold = false, isAssit = false) {
    self._shareAppMessage(callBack, num, score, isSpecial, obj, isPeople, gold, wxAddLayer, isAssit, true);
  }

  shareAppMessageWithAssit = function (callBack, num = -1, score = false, isSpecial = false, obj = false, isPeople = false, wxAddLayer = false, gold = false, isAssit = true) {
    self._shareAppMessage(callBack, num, score, isSpecial, obj, isPeople, gold, wxAddLayer, isAssit)
  }
  /**
   *  share 炫耀成绩获得金币
   * 
   */
  shareAppMessageWithGold = function (callBack, num = -1, score, gold, wxAddLayer, isSpecial = false, obj = false, isPeople = false, isAssit = false) {
    self._shareAppMessage(callBack, num, score, isSpecial, obj, isPeople, gold, wxAddLayer, isAssit)
  };
  /**
   *  share 个人/群
   * 
   */
  shareAppMessageWithImgUrl = function (callBack, num = -1, score = false, isSpecial = false, obj = false, isPeople = true, wxAddLayer = false, gold = false, isAssit = false) {
    self._shareAppMessage(callBack, num, score, isSpecial, obj, isPeople, gold, wxAddLayer, isAssit)
  };
  /**
   * share 分享给群
   */
  shareAppMessageForGroup = function (callBack, num = -1, score = false, isSpecial = false, obj = false, isPeople = false, wxAddLayer = false, gold = false, isAssit = false) {
    self._shareAppMessage(callBack, num, score, isSpecial, obj, isPeople, gold, wxAddLayer, isAssit)
  };
  /**
   * 分享到群
   * 判断不同的群
   * 有次数限制
   * 清除时间时间
   * 
   */
  shareBtnWithGroupAndTimes = function (callBack, num = -1) {
    self._shareAppMessage(callBack, num, false, false, false, false, false, false, false, false, false, true);
  }
  /**
   * 分享 特殊功能
   */
  shareAppMessageWithSpecial = function (callBack, num = -1, obj, score = false, isSpecial = true, isPeople = false, wxAddLayer = false, gold = false, isAssit = false) {
    self._shareAppMessage(callBack, num, score, isSpecial, obj, isPeople, gold, wxAddLayer, isAssit)
    console.log("shareAppMessageWithSpecial")
  };

  /**
   * 分享邀请好友  （分享卡片，好友点击卡片进入的需要统计）
   */
  shareWithInviteFriends(callBack, num = -1, tag = 1, newInvite = 0, inviteGroup = 0) {
    self._shareAppMessage(callBack, num, false, false, false, false, false, false, false, false, false, false, false, tag, newInvite, inviteGroup);
  }
  /**
    * 分享 玩一玩
    */
  shareQQPlay = function (callBack, num = -1) {
    self._shareAppMessage(callBack, num, false, false, false, false, false, false, false, false, false, false, true);
  }

  shareBtnWithGroupSpecialAndTimes(callBack, tag, num) {
    self._shareAppMessage(callBack, num, false, false, false, false, false, false, false, false, false, false, false, false, false, false, tag);
  }
  /**
   * 分享
   * @param {*回调} callBack 
   * @param {*分数} score 
   * @param {*特殊分享} isSpecial 
   * @param {*object} obj 
   * @param {*分享 不分群 人} isPeople 
   * @param {*分享获得金币 } gold 
   * @param {* object } wxAddLayer 
   * @param {*好友助力} isAssit 
   * @param {*好友助力复活} isRevive 
   * @param {*vip} isVip 
   * @param {*分享不同群 判次数，时间 } groupWithTimes 
   * @param {* 玩一玩分享到空间等消息} isQQShare
   */
  _shareAppMessage(callBack = false, num = -1, score = false, isSpecial = false, obj = false, isPeople = false, gold = false, wxAddLayer = false,
    isAssit = false, isRevive = false, isVip = false, groupWithTimes = false, isQQShare = false, inviteFriend = 0, newInvite = 0, inviteGroup = 0, shareTag = null) {
    console.log("_shareAppMessage", callBack, num, score, isSpecial, obj, isPeople, gold, wxAddLayer, isAssit, isRevive, isVip, groupWithTimes)

    var _index = (Math.floor(Math.random() * 10)) % self._url.length;
    var _imageUrl = self._getImgUrl(_index);
    var _materialID = -1;
    var _title = 0;
    var sharePoint = "";
    if (!!global.sharePoints && !!global.sharePoints[num.toString()]) {
      sharePoint = global.sharePoints[num.toString()];
    }
    num = num.toString();
    if (typeof score == 'number' || sharePoint == "score") {
      var _titleIndex = (Math.floor(Math.random() * 10)) % config.shareTitles['2'].length;
      _title = config.shareTitles['2'][_titleIndex].title;
      _title = globalFunc.getTextext({ title: _title, score: score })
      if (num == "-1") {
        num = "2";
      }
      console.log("分数分享", num, global.shareList[num]);
      if (typeof global.shareList[num] != "undefined" && config.isShowyd) {
        if (global.shareList[num].length > 0) {
          var _random = Math.floor(Math.random() * global.shareList[num].length);
          _title = global.shareList[num][_random].content;
          _title = globalFunc.getTextext({ title: _title, score: score })
          _imageUrl = global.shareList[num][_random].cdnurl;
          _materialID = global.shareList[num][_random].materialID;
        }
      }
    } else {
      var _titleIndex = (Math.floor(Math.random() * 10)) % config.shareTitles['1'].length;
      _title = config.shareTitles['1'][_titleIndex].title;
      if (num == "-1") {
        num = "1";
      }
      console.log("普通分享", num, global.shareList[num]);
      if (typeof global.shareList[num] != "undefined" && config.isShowyd) {
        if (global.shareList[num].length > 0) {
          var _random = Math.floor(Math.random() * global.shareList[num].length);
          _title = global.shareList[num][_random].content;
          _imageUrl = global.shareList[num][_random].cdnurl;
          _materialID = global.shareList[num][_random].materialID;
        }
      } else if (typeof global.shareList['0'] != "undefined" && config.isShowyd) {
        if (global.shareList['0'].length > 0) {
          var _random = Math.floor(Math.random() * global.shareList['0'].length);
          _title = global.shareList['0'][_random].content;
          _imageUrl = global.shareList['0'][_random].cdnurl;
          _materialID = global.shareList['0'][_random].materialID;
        }
      }
    }
    var randString = null;
    randString = util.randomString();
    if (isAssit || isRevive || sharePoint == "help") {
      var _titleIndex = (Math.floor(Math.random() * 10)) % config.shareTitles['3'].length;
      _title = config.shareTitles['3'][_titleIndex].title;
      if (num == "-1") {
        num = "3";
      }
      console.log("助力分享", global.shareList[num]);
      if (typeof global.shareList[num] != "undefined" && config.isShowyd) {
        if (global.shareList[num].length > 0) {
          var _random = Math.floor(Math.random() * global.shareList[num].length);
          _title = global.shareList[num][_random].content;
          _imageUrl = global.shareList[num][_random].cdnurl;
          _materialID = global.shareList[num][_random].materialID;
        }
      }
    }
    if (isVip || sharePoint == "vip") {
      var _titleIndex = (Math.floor(Math.random() * 10)) % config.shareTitles['4'].length;
      _title = config.shareTitles['4'][_titleIndex].title;
      if (num == "-1") {
        num = "4";
      }
      console.log("Vip分享", global.shareList[num]);
      if (typeof global.shareList[num] != "undefined" && config.isShowyd) {
        if (global.shareList[num].length > 0) {
          var _random = Math.floor(Math.random() * global.shareList[num].length);
          _title = global.shareList[num][_random].content;
          _imageUrl = global.shareList[num][_random].cdnurl;
          _materialID = global.shareList[num][_random].materialID;
        }
      }
    }

    var _query = "randStr=" + randString + "&uid=" + config.UID;
    _query = isVip ? _query + '&isVip=true&name=' + config.userInfo.nickName : _query + "&materialID=" + _materialID;
    if (inviteFriend) {
      _query += '&inviteFriend=' + inviteFriend + '&newInvite=' + newInvite + '&inviteGroup=' + inviteGroup;
    }
    //特别的数据更新
    if (shareTag) {
      _query += '&shareSpecialTag=' + shareTag + '&timestamp=' + (new Date().getTime());
      global.addRandString(randString);
    }

    this._shareMsg = {
      callBack: callBack, num: num, score: score, isSpecial: isSpecial, obj: obj, isPeople: isPeople, gold: gold,
      wxAddLayer: wxAddLayer, isAssit: isAssit, isRevive: isRevive, isVip: isVip, groupWithTimes: groupWithTimes,
      randString: randString, isQQShare: isQQShare, inviteFriend: inviteFriend, newInvite: newInvite, inviteGroup: inviteGroup,
      shareTag: shareTag,
    }
    this.shareMessageFlag = true;
    //qq 玩一玩 平台
    if (cc.sys.platform == cc.sys.QQ_PLAY) {
      this._hideTime = new Date().getTime();
      let _index = (Math.floor(Math.random() * 10)) % config.qqPlayUrl.length;
      let _urls = config.qqPlayUrl[_index];
      if (isQQShare) {
        qqPlay.share(_title, _urls, _query, null, function (flag) {
          if (flag) {
            self.doShareEvent(flag);
          }
        })
      } else {
        qqPlay.share(_title, _urls, _query, null, function (flag) {
          if (flag) {
            self.doShareEvent();
          }
        })
      }

      return;
    }
    //平台约束
    if (cc.sys.platform != cc.sys.WECHAT_GAME) {
      return;
    }
    //版本号判断
    let vs = global.getUserDataInfoByName('shareversion') || '2.3.0';
    if (global.wxBversionLess(vs)) {
      CC_GMAE_ONSHOW_OPEN = false;
    }
    self.reportShare(_materialID);
    wx.shareAppMessage({
      title: _title,
      imageUrl: _imageUrl,
      query: _query,
      success: res => {
        console.log("wx.shareAppMessage", res);
        if (CC_GMAE_ONSHOW_OPEN) {
          return;
        }
        var shareHasCallBack = false;
        if (!!!config.gamecenter_link) {
          if (isSpecial) {
            self._setStorage();
            if (!!!shareHasCallBack && callBack && typeof callBack == "function") {
              shareHasCallBack = true
              callBack.call(obj);
            }
          }
        }
        if (gold) {
          let shareWithGold = false;
          //let times = global.getStartGameTimes();
          //console.log(times,wxAddLayer._isShareWithGold);
          //if(times > config.startGameTimes){
          // 已获得一次金币,其他不获取
          if (wxAddLayer._isShareWithGold) {
            let isShareGold = Math.floor(Math.random() * 10) % 3;
            if (isShareGold === 1) {
              if (wxAddLayer.isVip()) {
                let val = wxAddLayer.getVipStableAbilityValue('s_gold');
                gold += val;
              }
              consume.addGold(gold);
              wxAddLayer._isShareWithGold = false;
              shareWithGold = true;
            };
          }
          //}
          if (!!!shareHasCallBack && callBack && typeof callBack == "function") {
            shareHasCallBack = true
            callBack.call(obj, shareWithGold, gold);
          }
        }
        if (isAssit) {
          global.addRandString(randString);
          if (!!!shareHasCallBack && callBack && typeof callBack == "function") {
            shareHasCallBack = true
            callBack.call(obj);
          }
        }
        if (isRevive) {
          global.addRandString(randString);
          if (!!!shareHasCallBack && callBack && typeof callBack == "function") {
            shareHasCallBack = true
            callBack.call(obj);
          }
        }
        var isGroup = 0;
        if (res.shareTickets && res.shareTickets[0]) {
          //if(config.gamecenter_link && tokenMgr.checkToken()){

          //}
          //保存shareTicket
          config.shareTicket = res.shareTickets[0];
          if (!!!shareHasCallBack && callBack && typeof callBack == "function") {
            shareHasCallBack = true;
            isGroup = 1;
            if (groupWithTimes) {
              this.getShareInfo(res.shareTickets[0], callBack);
            } else {
              callBack.call(obj, isGroup);
            }
            //callBack.call(obj,isGroup);
          }
        };

        if (isPeople) {
          //console.log("getShareInfo",isSpecial)
          if (!!!shareHasCallBack && callBack && typeof callBack == "function") {
            shareHasCallBack = true
            callBack.call(obj);
          }
        } else {
          if (!!!shareHasCallBack && callBack && typeof callBack == "function") {
            shareHasCallBack = true
            callBack.call(obj, isGroup);
          }
        }
        if (score) {
          if (!!!shareHasCallBack && callBack && typeof callBack == "function") {
            shareHasCallBack = true
            callBack.call(obj);
          }
        }

      },
      fail: res => {
        console.log("shareAppMessage fail", res)
      },
      complete: res => {
        console.log("shareAppMessage complete", res)
      }
    });
  };

  shareWithMeasure(callBack, offset_x, offset_y, width, height) {
    // x: 10,
    // y: 10,
    // width: 200,
    // height: 150,
    offset_x = offset_x || 0;
    offset_y = offset_y || 0;
    width = width || 200;
    height = height || 150;
    //var _index = (Math.floor(Math.random()*10)) %  self._url.length;
    var _title = 0;
    var _titleIndex = (Math.floor(Math.random() * 10)) % config.shareTitles['1'].length;
    _title = config.shareTitles['1'][_titleIndex].title;
    if (typeof global.shareList['1'] != "undefined") {
      if (global.shareList['1'].length > 0) {
        var _random = Math.floor(Math.random() * global.shareList['1'].length);
        _title = global.shareList['1'][_random].content;
      }
    }
    wx.shareAppMessage({
      title: _title,
      imageUrl: canvas.toTempFilePathSync({
        x: offset_x,
        y: offset_y,
        width: width,
        height: height,
        destWidth: 400,
        destHeight: 300
      }),
      success: res => {
        if (callBack) {
          callBack();
        }
      },
      fail: res => {
        console.log("shareAppMessage fail", res)
      }
    });
  }

  shareWithImageUrl(callBack, url, titleIndex = 1) {

    if (!!!url) {
      var _index = (Math.floor(Math.random() * 10)) % self._url.length;
      url = self._getImgUrl(_index);
    }
    var _title = 0;
    var _titleIndex = (Math.floor(Math.random() * 10)) % config.shareTitles[titleIndex].length;
    _title = config.shareTitles[titleIndex][_titleIndex].title;
    var _materialID = -1;
    if (typeof global.shareList[titleIndex] != "undefined") {
      if (global.shareList[titleIndex].length > 0) {
        var _random = Math.floor(Math.random() * global.shareList[titleIndex].length);
        _title = global.shareList[titleIndex][_random].content;
        url = global.shareList[titleIndex][_random].cdnurl;
        _materialID = global.shareList[titleIndex][_random].materialID;
      }

    }
    this._shareMsg = { callBack: callBack, score: false, isSpecial: false, obj: false, isPeople: false, gold: false, wxAddLayer: false, isAssit: false, isRevive: false, isVip: false, groupWithTimes: false, randString: false, isQQShare: false }
    this.shareMessageFlag = true;
    //qq 玩一玩 平台
    if (cc.sys.platform == cc.sys.QQ_PLAY) {
      this._hideTime = new Date().getTime();
      let _index = (Math.floor(Math.random() * 10)) % config.qqPlayUrl.length;
      let qqUrl = onfig.qqPlayUrl[_index];
      if (isQQShare) {
        qqPlay.share(_title, qqUrl, null, null, function (flag) {
          if (flag) {
            self.doShareEvent(flag);
          }
        })
      } else {
        qqPlay.share(_title, qqUrl, null, null, function (flag) {
          if (flag) {
            self.doShareEvent();
          }
        })
      }
      return;
    }
    self.reportShare(_materialID);
    wx.shareAppMessage({
      title: _title,
      imageUrl: url,
      query: "materialID=" + _materialID,
      success: res => {
        if (CC_GMAE_ONSHOW_OPEN) {
          return;
        }
        if (callBack) {
          callBack();
        }
      },
      fail: res => {
        console.log("shareAppMessage fail", res)
      }
    });
  }

  addFriend = function (_appID) {
    var url = urls.user + "/add_friend"
    var param = {
      frienduid: _appID,
    }//config.getParam();
    util.request({
      url: url,
      data: param,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      success: res => {
        console.log("addFriend Success")
      }
    })
  };

  //获取分享文案
  getShareText = function () {
    var url = urls.material + '/getMaterials';
    var param = {
      appid: config.config.appid,
    }
    util.wxRequest({
      url: url,
      data: param,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'GET',
      success: res => {
        console.log("get share material+++++++++++++++++++++++++++", res);
        if (res.data.ecode != 0) return;
        global.shareListCDN = res.data.data;
        global.sharePoints = res.data.sharePoints;
        self.ifDownLoadShareCDN();
      }, fail: res => {
        console.log("get share material fail", res);
      }
    })
  };

  /**
   * 判读是否要下载分享图片CDN
   */
  ifDownLoadShareCDN() {
    if (!!global.isDownloadShareCDN) {
      return;
    }
    if (typeof global.shareListCDN == "undefined") {
      return;
    }
    global.isDownloadShareCDN = true;
    var data = global.shareListCDN;
    this.shareKeyList = new Array();//获取所有分享类型点的key
    this.downLoadUrl = new Array(); //得到要下载的url
    this.shareUrlMap = {}; //要匹配下载url和本地的url
    this.shareUrlSto = new Array();
    this.shareDownUrlSto = new Array();
    this.shareUrlMapSto = cc.sys.localStorage.getItem("shareUrlMapGC");    //获取本地存储的下载信息
    // this.ifSaveFail = false;  //是否保存图片失败
    this.nowSaveFile = new Array(); //本次保存的图片
    for (var key in data) {
      this.shareKeyList.push(key);
    }
    for (var i = 0; i < this.shareKeyList.length; i++) {
      var tempArray = data[this.shareKeyList[i]];
      for (var j = 0; j < tempArray.length; j++) {
        var index = this.downLoadUrl.indexOf(tempArray[j].cdnurl);
        if (index < 0) {
          this.downLoadUrl.push(tempArray[j].cdnurl);
        }
      }
    }
    if (!!this.shareUrlMapSto) {
      this.shareUrlMapSto = JSON.parse(this.shareUrlMapSto);
      for (var key in this.shareUrlMapSto) {
        this.shareUrlSto.push(key);
        this.shareDownUrlSto.push(this.shareUrlMapSto[key]);
      }
    }

    if (this.shareUrlSto.toString() == this.downLoadUrl.toString()) {
      console.log("一致");
      self.judgeData();
    } else {
      console.log("不一致");
      that = self;
      self.downloadImgEvent();
    }
  };

  /**
   * 匹配数据 cdn与本地文件 
   * */
  matchShareData(shareMap) {
    var list = global.shareListCDN;
    for (var i = 0; i < this.shareKeyList.length; i++) {
      var tempArray = list[this.shareKeyList[i]];
      for (var j = 0; j < tempArray.length; j++) {
        tempArray[j].cdnurl = shareMap[tempArray[j].cdnurl];
      }
    }
    return list;
  };

  /**
   * 上报点击分享文案
   */
  reportShareText = function (options) {
    if (typeof options.query.materialID == "undefined") {
      return;
    }
    if (options.query.uid == config.UID) {
      return;
    }
    util.wxRequest({
      url: urls.material + '/reportClick',
      data: {
        appid: config.config.appid,
        materialID: options.query.materialID,
        uid: config.UID
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'GET',
      success: res => {
        console.log("shang bao share", res)
      },
      fail: res => {
        console.log("shang bao share2222", res);
      }
    })
  };

  /**
   * 上报分享文案 
   */
  reportShare = function (materialID) {
    util.wxRequest({
      url: urls.material + '/reportShare',
      data: {
        appid: config.config.appid,
        materialID: materialID,
        uid: config.UID,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'GET',
      success: res => {
        console.log("reportShare", res);
      },
    })
  };

  /**
    * 下载分享文案图片
    * @param {*文案类型} num1 
    * @param {*对应类型文案的index} num2 
    */
  downloadImgEvent(num = 0, num1 = 1, num2 = 0) {
    //下载后赋值
    if (typeof global.shareListCDN == "undefined") {
      return;
    }
    console.log(">>>>>>>>>>>>downLoad Url", num, that.downLoadUrl);
    if (num >= that.downLoadUrl.length && num != 0) {
      global.shareList = that.matchShareData(that.shareUrlMap);
      console.log("****************************************global shareList", global.shareList);
      var str = JSON.stringify(that.shareUrlMap);
      cc.sys.localStorage.setItem("shareUrlMapGC", str);
      // if (self.ifSaveFail) {
      //   self.getSaveFileList();
      // }
      return;
    }
    var tempData = that.downLoadUrl[num];
    let a = num;
    that.wxDownloader(tempData, function (res) {
      var url = res.tempFilePath;
      var _FileSystemManager = wx.getFileSystemManager();
      _FileSystemManager.saveFile({
        tempFilePath: url,
        success: function (res) {
          console.log(">>>>>>>downLoad res", res, that.shareUrlMap, tempData);
          that.shareUrlMap[tempData] = res.savedFilePath;
          that.nowSaveFile.push(res.savedFilePath);
          that.downloadImgEvent(a + 1);
        }, fail: function (res) {
          that.shareUrlMap[tempData] = that._url[0].url;  //保存失败
          that.downloadImgEvent(a + 1);
          // self.ifSaveFail = true;
        }
      })
    }, function () {
      that.shareUrlMap[tempData] = that._url[0].url;  //下载失败
      that.downloadImgEvent(a + 1);
    })
  };

  /**
   * 得到本地保存的文件 暂不用
   */
  getSaveFileList() {
    var _FileSystemManager = wx.getFileSystemManager();
    _FileSystemManager.getSavedFileList({
      success: function (res) {
        console.log("得到保存的文件列表", res);
        self.saveFileList = res.fileList;
        self.removeSavedFile();
      }
    })
  }

  /** 
   * 移除本地文件 暂不用
   * @param {*} num 
   */
  removeSavedFile(num = 0) {
    if (num >= self.saveFileList.length) {
      return;
    }
    var _FileSystemManager = wx.getFileSystemManager();
    var tempPath = self.saveFileList[num].filePath;
    var index = self.nowSaveFile.indexOf(tempPath);
    if (index >= 0) {
      self.removeSavedFile(num + 1);
      return;
    }
    _FileSystemManager.removeSavedFile({
      filePath: self.saveFileList[num].filePath,
      success: function (res) {
        self.removeSavedFile(num + 1);
      }
    })
  }

  /**
   * @param {*下载链接} url 
   * @param {*下载成功} sucCallback 
   * @param {*下载失败} faiCallback 
   */
  wxDownloader(url, sucCallback = null, faiCallback = null) {
    wx.downloadFile({
      url: url,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: res => {
        console.log("downLoad", res);
        if (sucCallback) {
          sucCallback(res);
        }
      }, fail: res => {
        console.log("downLoad fail ", res);
        if (faiCallback) {
          faiCallback();
        }
      }
    })
  };

  //判断是否存在本地分享图片
  judgeData(num = 0) {
    if (num >= this.shareDownUrlSto.length) {
      global.shareList = self.matchShareData(this.shareUrlMapSto);
      console.log("judgeData", global.shareList);
      //验证正确;
      return;
    }
    var path = this.shareDownUrlSto[num];
    if (typeof path != "string") {
      cc.sys.localStorage.removeItem("shareUrlMapGC");
      return;
    }

    var index = path.indexOf("store");
    if (index < 0) {
      cc.sys.localStorage.removeItem("shareUrlMapGC");
      return self.judgeData(num + 1);
    }
    let a = num;
    var _FileSystemManager = wx.getFileSystemManager();
    _FileSystemManager.getFileInfo({
      filePath: path,
      success: function (res) {
        self.judgeData(a + 1);
      }, fail: function (res) {
        self.downloadImgEvent();
      }
    })
  };


  getShareType(num) {
    if (typeof global.shareList[num.toString()] == "undefined") {
      return -1;
    }
    if (typeof global.shareList[num.toString()][0] == "undefined") {
      return -1;
    }
    if (typeof global.shareList[num.toString()][0].type == "undefined") {
      return -1;
    }
    var type = global.shareList[num.toString()][0].type;
    return Number(type);
  }

};
