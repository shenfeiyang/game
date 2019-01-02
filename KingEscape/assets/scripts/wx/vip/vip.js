var urls = require('route').urls;
var config = require('config');
var util = require('util');

var Vip = cc.Class({
    statics: {
        instance: null,
        getInstance: function () {
            if (Vip.instance == null) {
                Vip.instance = new Vip();
            }
            return Vip.instance;
        }
    },

    ctor() {
        if (!!!config.gamecenter_link) return;
        if (cc.sys.platform != cc.sys.WECHAT_GAME) return;

        this.isVip = this.getVipInfo();
        this.setVip({
            bool: this.isVip
        });
        this.vipBtn = null;

        // if (!!!config.gamecenter_link) return;
        // if (cc.sys.platform != cc.sys.WECHAT_GAME) return;
        // this.checkEnter();
    },

    checkEnter(wxAddLayer) {
        if (!!!config.gamecenter_link) return;
        if (cc.sys.platform != cc.sys.WECHAT_GAME) return;

        let self = this;
        let launchOpt = wx.getLaunchOptionsSync();
        console.log('launch opt in vip check enter:', launchOpt);
        console.log('config uid in vip check enter:', config.UID);
        let uid = launchOpt.query.uid;
        let name = launchOpt.query.name;
        if (launchOpt.query.isVip) {
            console.log('is from vip card ...');
            wxAddLayer.callAuthView(function () {
                if (!!uid && typeof uid == 'string') {
                    console.log('to add share vip info ...');
                    self.addShareVipInfo(uid, res => {
                        if (res.data.ecode == 0) {
                            console.log('addShareVipInfo callback:', res);
                            let username = '好友';
                            if (name && name != '' && name != 'undefined') {
                                username = name;
                            }
                            wxAddLayer.addDMLDText('你帮助' + username + '开启了贵宾!');
                        }
                    });
                }
            }, 1);
        }
        // this.getShareVipInfo(res => {
        //     let dataLen = res.data.length;
        //     console.log('get share vip friend lens:', dataLen);
        // });
    },

    getVipInfo() {
        let _isVip = cc.sys.localStorage.getItem('vipActive');
        if (!_isVip) {
            _isVip = 0;
            cc.sys.localStorage.setItem('vipActive', _isVip);
        }
        console.log('_is vip: ', _isVip);
        console.log('type of _is vip: ', typeof _isVip);
        return _isVip;
    },

    isVipActive() {
        return this.isVip;
    },

    setVip(obj) {
        let bool = obj.bool;
        let success = obj.success;
        let fail = obj.fail;

        let val = bool ? 1 : 0;
        wx.setUserCloudStorage({
            KVDataList: [{
                key: 'isVip',
                value: val.toString()
            }],
            success: res => {
                console.log('set user cloud data isVip success:', res);

                this.isVip = bool;
                cc.sys.localStorage.setItem('vipActive', this.isVip);
                this.showRedPoint(!bool);

                if (success && typeof success == 'function') {
                    success();
                }
                // if (callback && typeof callback == 'function') {
                //     callback();
                // }
            },
            fail: res => {
                console.log('set user cloud data isVip fail:', res);
                if (fail && typeof fail == 'function') {
                    fail();
                }
            }
        });
    },

    getShareVipInfo(success, fail, target) {
        let url = urls.share + "/getShareVipInfo";
        let param = {};
        util.requestWithCheck({
            url: url,
            data: param,
            method: 'POST',
            success: res => {
                console.log('get share vip info success:', res);
                if (success && typeof success == 'function') {
                    success.call(target, res.data);
                }
            },
            fail: res => {
                console.log('get share vip info failed');
                if (fail && typeof fail == 'function') {
                    fail.call(target, res);
                }
            },
        });
    },

    addShareVipInfo(ownerId, callback) {
        let url = urls.share + "/addShareVipInfo";
        let param = {
            ownerId: ownerId
        };
        util.requestWithCheck({
            url: url,
            data: param,
            method: 'POST',
            success: res => {
                console.log('add share vip info success:', res);
                if (callback && typeof callback == 'function') {
                    callback(res);
                }
            },
            fail: res => {
                console.log('add share vip info failed');
            },
        });
    },

    setRedPoint(btn) {
        if (!!!config.gamecenter_link) return;
        if (cc.sys.platform != cc.sys.WECHAT_GAME) return;

        this.vipBtn = btn;
        cc.loader.loadRes("plugIn/vip/redPoint", cc.Prefab, (err, prefab) => {
            if (err) {
                console.error(err)
                return;
            }
            let redPoint = cc.instantiate(prefab);
            btn.addChild(redPoint);
            btn.redPoint = redPoint;

            redPoint.setPosition(btn.width / 2, btn.height / 2);
            redPoint.active = this.isVip ? false : true;
        });
    },

    showRedPoint(bool) {
        if (!this.vipBtn) return;
        this.vipBtn.redPoint.active = bool;
    },

    parseAbility(type, index) {
        let list = config.vipAbility[type];
        let value = null;
        if (index && typeof index == 'string') {
            list.forEach(ability => {
                if (ability.id === index) {
                    value = ability.value;
                    return;
                }
            });
        } else if (index && typeof index == 'number' && index >= 0) {
            value = list[index].value;
        }
        return value;
    },

    loadVipWidget(target, name) {
        cc.loader.loadRes("plugIn/vip/vipWidget", cc.Prefab, function (err, prefab) {
            if (err) {
                console.error(err)
                return;
            }
            let vipWidget = cc.instantiate(prefab);
            target.node.addChild(vipWidget);

            vipWidget.getComponent(cc.Widget).target = target.node;

            vipWidget.setPosition(cc.v2(0, 0));
            vipWidget.active = false;
            name = name || "vipWidget";
            target[name] = vipWidget;
        });
    }
});
