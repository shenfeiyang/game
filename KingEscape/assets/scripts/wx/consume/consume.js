var urls = require('route').urls
var config = require('config')
var util = require('util');

var consume = cc.Class({
  statics: {
    instance: null,
    getInstance: function () {
      if (consume.instance == null) {
        consume.instance = new consume();
      }
      return consume.instance;
    }
  },

  ctor: function () {
    this._gold = parseInt(cc.sys.localStorage.getItem('Gold'));
    if (isNaN(this._gold)) {
      let _gold = config.gold;
      cc.sys.localStorage.setItem('Gold', _gold);
      this._gold = _gold;
    } else {
      this._gold = parseInt(this._gold);
    }
    //console.log("consume ctor",this._gold);
  },
  setGold(num) {
    console.log("setGold num", num)
    if (typeof num == 'number') {
      cc.sys.localStorage.setItem('Gold', num);
      this._gold = num;
    }
    console.log("setGold num", this._gold)

    // this._gold = parseInt( cc.sys.localStorage.getItem('Gold'));
    // if( isNaN(this._gold) ){
    //    let _gold = config.gold;
    //    cc.sys.localStorage.setItem('Gold',_gold);
    //    this._gold = _gold;
    // }else{
    //   this._gold = parseInt(this._gold);
    // }
  },
  getGold() {
    return this._gold;
  },
  addGold(num) {
    if (typeof num != 'number') {
      return;
    }
    this._gold += num;
    this._addGold(0, num);
    //console.log("addGold",this._gold);
    cc.sys.localStorage.setItem('Gold', this._gold);
  },
  subGold(num, callBack) {
    //console.log(num,callBack,this._gold)
    let flag = false;
    if (!!!num || num > this._gold) {
      if (callBack && typeof callBack == "function") {
        callBack(flag)
      }
      return;
    }
    flag = true;
    this._gold -= num;
    if (this._gold < 0) {
      this._gold = 0;
    }
    this._subGold(0, num);
    cc.sys.localStorage.setItem('Gold', this._gold);
    if (callBack && typeof callBack == "function") {
      //console.log(flag)
      callBack(flag)
    }
  },
  setGoldPlus(num, name = 'diamond') {
    if (typeof num != 'number') {
      return;
    }
    this[name] = num;
    cc.sys.localStorage.setItem(name, this[name]);
  },
  getGoldPlus(name = 'diamond') {
    if (!this[name]) {
      let goldPlus = parseInt(cc.sys.localStorage.getItem(name));
      if (isNaN(goldPlus)) {
        let _gold = 0;
        cc.sys.localStorage.setItem(name, _gold);
        goldPlus = _gold;
      }
      this[name] = goldPlus;
    }

    return this[name];
  },
  addGoldPlus(num, name = 'diamond') {
    if (typeof num != 'number') {
      return;
    }
    if (!this[name]) {
      this.getGoldPlus(name);
    }
    this[name] += num;
    //console.log("addGold",this._gold);
    cc.sys.localStorage.setItem(name, this[name]);
  },
  subGoldPlus(num, callBack, name = 'diamond') {
    //console.log(num,callBack,this._gold)
    let flag = false;
    if (!this[name]) {
      this.getGoldPlus(name);
    }
    if (!!!num || num > this[name]) {
      if (callBack && typeof callBack == "function") {
        callBack(flag)
      }
      return;
    }
    flag = true;
    this[name] -= num;
    if (this[name] < 0) {
      this[name] = 0;
    }
    cc.sys.localStorage.setItem(name, this[name]);
    if (callBack && typeof callBack == "function") {
      //console.log(flag)
      callBack(flag)
    }
  },
  _setGold(num) {
    var url = urls.user + "/set_gold";
    var param = {
      gold: num,
    };
    util.request({
      url: url,
      data: param,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      success: res => {
        console.log("setGold Success")

        console.log(res.data);
        //if (callBack && typeof callBack == 'function') callBack(res.data.data)
      },
      fail: function (er) {
        console.error(er);
      }
    })
  },

  _getGold(callBack) {
    let self = this;
    var url = urls.user + "/get_gold";
    var param = {
    };
    util.request({
      url: url,
      data: param,
      method: 'get',
      success: res => {
        console.log("getGold Success")

        console.log(res.data);
        if (res.data && typeof res.data.data.num == 'number') {
          self.setGold(res.data.data.num);
        }
        if (callBack && typeof callBack == 'function') callBack(res.data.data.num)
      },
      fail: function (er) {
        console.error(er);
      }
    })
  },
  _addGold(callBack, _num) {
    var url = urls.user + "/add_gold";
    var param = {
      num: _num,
    };
    util.request({
      url: url,
      data: param,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      success: res => {
        console.log("addGold Success")
        console.log(res.data);
        if (callBack && typeof callBack == 'function') callBack(res.data.data)
      },
      fail: function (er) {
        console.error(er);
      }
    })
  },
  _subGold(callBack, _num) {
    var url = urls.user + "/sub_gold";
    var param = {
      num: _num,
    };
    util.request({
      url: url,
      data: param,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      success: res => {
        console.log("getGold Success")

        console.log(res.data);
        if (callBack && typeof callBack == 'function') callBack(res.data.data)
      },
      fail: function (er) {
        console.error(er);
      }
    })
  },
})
