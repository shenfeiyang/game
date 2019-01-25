var urls = require('route').urls
var config = require('config')
var util = require('util');

//// 类版本 全局函数太多可以使用类版本
var self = null;
export default class rank {
    // 类似构成函数
    constructor() {
        self = this;
    };
    /* *******添加rankLayer *******
    **target为self（this）
    **name 为你自己设置（默认rankWidget）
    */
    loadRankWidget = function (target, name) {
        cc.loader.loadRes("plugIn/rankRes/rankWidget", cc.Prefab, function (err, prefab) {
            if (err) {
                console.error(err)
                return;
            }
            var rankWidget = cc.instantiate(prefab);
            target.node.addChild(rankWidget, 1000);
            //适配高 宽
            var _size = rankWidget.getContentSize();
            var tagSize = target.node.getContentSize();

            var scaleX = tagSize.width / _size.width;
            var scaleY = tagSize.height / _size.height;
            console.log("rankWidget Size", tagSize, _size, target.node.getScale(), );
            if (scaleX || scaleY) {
                var _scale = scaleX;
                if (scaleX > scaleY) {
                    _scale = scaleY;
                }
                rankWidget.setScale(scaleX, scaleY);
                self.adapterHeight("top", rankWidget, scaleX, scaleY, _scale);
                self.adapterHeight("rankScroll", rankWidget, scaleX, scaleY, _scale, "true");
                self.adapterHeight("rankScroll2", rankWidget, scaleX, scaleY, _scale, "true");
                // }
            } else {
                rankWidget.setContentSize(tagSize.width, tagSize.height);
            }

            var widget = rankWidget.getComponent(cc.Widget);
            widget.target = target.node;
            rankWidget.setPosition(cc.v2(0, 0))

            rankWidget.active = false;
            name = name || "rankWidget"
            target[name] = rankWidget;
        })
    };
    // 获取群排行榜
    loadQunRankWidget = function (target, name) {
        cc.loader.loadRes("plugIn/rankRes/qunRank", cc.Prefab, function (err, prefab) {
            if (err) {
                console.error(err)
                return;
            }

            var qunRankWidget = cc.instantiate(prefab);
            target.node.addChild(qunRankWidget, 1000);
            //适配高 宽
            var _size = qunRankWidget.getContentSize();
            var tagSize = target.node.getContentSize();
            var scaleX = tagSize.width / _size.width;
            var scaleY = tagSize.height / _size.height;
            if (scaleX || scaleY) {
                var _scale = scaleX;
                if (scaleX > scaleY) {
                    _scale = scaleY;
                }
                console.log("qunRankWidget", scaleX, scaleY, _size, tagSize);
                qunRankWidget.setScale(scaleX, scaleY);
                self.adapterHeight("top", qunRankWidget, scaleX, scaleY, _scale);
                self.adapterHeight("rankScroll", qunRankWidget, scaleX, scaleY, _scale, "true");
                // var top = cc.find("top",qunRankWidget);
                // if(top){
                //     top.setScale(1/scaleX * _scale,1/scaleY *_scale);
                // }
                // var rankScroll = cc.find("rankScroll",qunRankWidget);
                // if(rankScroll){
                //     rankScroll.setScale(1/scaleX * _scale,1/scaleY *_scale);
                // }
            } else {
                qunRankWidget.setContentSize(tagSize.width, tagSize.height);
            }

            qunRankWidget.setPosition(cc.v2(0, 0))

            qunRankWidget.active = false;
            name = name || "qunRankWidget"
            target[name] = qunRankWidget;
        })
    };
    loadFriendRankWidget = function (target, name, callBack) {
        cc.loader.loadRes("plugIn/rankRes/friendRank", cc.Prefab, function (err, prefab) {
            if (err) {
                console.error(err)
                return;
            }
            var rankWidget = cc.instantiate(prefab);
            target.node.addChild(rankWidget, 1000);
            //适配高 宽
            var _size = rankWidget.getContentSize();
            var tagSize = target.node.getContentSize();

            var scaleX = tagSize.width / _size.width;
            var scaleY = tagSize.height / _size.height;
            console.log("friendRank Size", tagSize, _size, target.node.getScale(), );
            if (scaleX || scaleY) {
                var _scale = scaleX;
                if (scaleX > scaleY) {
                    _scale = scaleY;
                }
                rankWidget.setScale(scaleX, scaleY);
                self.adapterHeight("top", rankWidget, scaleX, scaleY, _scale);
                self.adapterHeight("myRankBg", rankWidget, scaleX, scaleY, _scale);
                self.adapterHeight("rankSp", rankWidget, scaleX, scaleY, _scale);

            } else {
                rankWidget.setContentSize(tagSize.width, tagSize.height);
            }

            rankWidget.setPosition(cc.v2(0, 0))

            rankWidget.active = false;
            name = name || "friendRank";
            target[name] = rankWidget;
            if (callBack && typeof callBack == 'function') callBack();
        })
    };
    loadFriendDoubleRankWidget = function (target, name, callBack) {
        cc.loader.loadRes("plugIn/rankRes/friendRankDouble", cc.Prefab, function (err, prefab) {
            if (err) {
                console.error(err)
                return;
            }
            var rankWidget = cc.instantiate(prefab);
            target.node.addChild(rankWidget, 1000);
            //适配高 宽
            var _size = rankWidget.getContentSize();
            var tagSize = target.node.getContentSize();

            var scaleX = tagSize.width / _size.width;
            var scaleY = tagSize.height / _size.height;
            console.log("friendRank Size", tagSize, _size, target.node.getScale(), );
            if (scaleX || scaleY) {
                var _scale = scaleX;
                if (scaleX > scaleY) {
                    _scale = scaleY;
                }
                rankWidget.setScale(scaleX, scaleY);
                self.adapterHeight("top", rankWidget, scaleX, scaleY, _scale);
                self.adapterHeight("myRankBg", rankWidget, scaleX, scaleY, _scale);
                self.adapterHeight("rankSp", rankWidget, scaleX, scaleY, _scale);

            } else {
                rankWidget.setContentSize(tagSize.width, tagSize.height);
            }

            rankWidget.setPosition(cc.v2(0, 0))

            rankWidget.active = false;
            name = name || "friendRankDouble";
            target[name] = rankWidget;
            if (callBack && typeof callBack == 'function') callBack();
        })
    };

    loadFriendRankMore = function (target, name, customData) {
        cc.loader.loadRes("plugIn/rankRes/friendRankMore", cc.Prefab, function (err, prefab) {
            if (err) {
                console.error(err)
                return;
            }
            var rankWidget = cc.instantiate(prefab);
            target.node.addChild(rankWidget, 1000);
            //适配高 宽
            var _size = rankWidget.getContentSize();
            var tagSize = target.node.getContentSize();

            var scaleX = tagSize.width / _size.width;
            var scaleY = tagSize.height / _size.height;
            console.log("friendRank Size", tagSize, _size, target.node.getScale(), );
            if (scaleX || scaleY) {
                var _scale = scaleX;
                if (scaleX > scaleY) {
                    _scale = scaleY;
                }
                rankWidget.setScale(scaleX, scaleY);
                self.adapterHeight("top", rankWidget, scaleX, scaleY, _scale);
                self.adapterHeight("myRankBg", rankWidget, scaleX, scaleY, _scale);
                self.adapterHeight("rankSp", rankWidget, scaleX, scaleY, _scale);

            } else {
                rankWidget.setContentSize(tagSize.width, tagSize.height);
            }

            rankWidget.setPosition(cc.v2(0, 0))

            rankWidget.active = false;
            name = name || "friendRankMore";
            target[name] = rankWidget;
            console.log("friendRankMore", rankWidget)
            if (customData) {
                rankWidget.active = true;
                var js = rankWidget.getComponent('friendMoreRankLayer');
                console.log("friendRankMore", js)
                js.initRank(0, customData);
            }
        })
    }

    loadQQFriendRankMore = function (target, name, ctmData1, ctmData2, callBack) {
        cc.loader.loadRes("plugIn/rankRes/rankQQRankLayer", cc.Prefab, function (err, prefab) {
            if (err) {
                console.error(err)
                return;
            }
            var rankWidget = cc.instantiate(prefab);
            target.node.addChild(rankWidget, 1000);
            //适配高 宽
            var _size = rankWidget.getContentSize();
            var tagSize = target.node.getContentSize();

            var scaleX = tagSize.width / _size.width;
            var scaleY = tagSize.height / _size.height;
            console.log("rankQQRankLayer Size", tagSize, _size, target.node.getScale(), );
            if (scaleX || scaleY) {
                var _scale = scaleX;
                if (scaleX > scaleY) {
                    _scale = scaleY;
                }
                rankWidget.setScale(scaleX, scaleY);
                self.adapterHeight("top", rankWidget, scaleX, scaleY, _scale);
                self.adapterHeight("myRankBg", rankWidget, scaleX, scaleY, _scale);
                self.adapterHeight("rankSp", rankWidget, scaleX, scaleY, _scale);

            } else {
                rankWidget.setContentSize(tagSize.width, tagSize.height);
            }

            rankWidget.setPosition(cc.v2(0, 0))

            rankWidget.active = false;
            name = name || "rankQQRankLayer";
            target[name] = rankWidget;
            console.log("rankQQRankLayer", rankWidget)
            if (ctmData1) {
                rankWidget.active = true;
                var js = rankWidget.getComponent('rankLayer');
                console.log("rankQQRankLayer", js)
                js.initRank(ctmData1, ctmData2, callBack);
            }
        })
    }

    adapterHeight = function (name, widget, scaleX, scaleY, _scale, isNeedSetContent = false) {
        var _widget = cc.find(name, widget);
        if (_widget) {
            _widget.setScale(1 / scaleX * _scale, 1 / scaleY * _scale);
            if (isNeedSetContent) {
                self.adapterHeightContent(name, widget, scaleX, scaleY, _scale);
                self.adapterHeightContent("viewport", _widget, scaleX, scaleY, _scale);
            }
        }
    };
    adapterHeightContent = function (name, widget, scaleX, scaleY, _scale) {
        var _widget = cc.find(name, widget);
        if (_widget) {
            var _widgetSize = _widget.getContentSize();
            _widgetSize.height = _widgetSize.height * scaleY / _scale;
            _widget.setContentSize(_widgetSize.width, _widgetSize.height);
        }
    };
    //获取好友rank
    getFriendRank = function (callBack) {
        var url = urls.user + "/friendrank"
        var param = {}//config.getParam();
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
    // 获取世界rank
    getWorldRank = function (callBack) {
        var url = urls.user + "/worldrank"
        var param = {}//config.getParam();
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
    // 获取rank  好友跟世界rank 一起
    // 现在使用此方法（以上两种弃用）
    // isWeek为true 就是获取周 排行
    getRank = function (callBack, isWeek) {
        var url = urls.user + "/rank";
        var _week = null;
        if (isWeek) {
            _week = 'isweek';
        }
        var param = {
            week: _week,
        }//config.getParam();
        util.request({
            url: url,
            data: param,
            method: 'GET',
            success: res => {
                //服务器存储的用户数据
                if (callBack && typeof callBack == 'function') callBack(res.data)
            },
            fail: res => {

            },
        })
    }
    // 获取群排名 isWeek为true 就是获取周群 排行
    getQunRank = function (groupid, callBack, isWeek) {
        var url = urls.user + "/grouprank";
        var _week = null;
        if (isWeek) {
            _week = 'isweek';
        }
        var param = {
            groupid: groupid,
            week: _week,
        }//config.getParam();
        util.request({
            url: url,
            data: param,
            method: 'GET',
            success: res => {
                //服务器存储的用户数据
                if (callBack && typeof callBack == 'function') callBack(res.data)
            },
            fail: res => {

            },
        })
    }
    // 获取周排名
    getWeekRank = function (callBack, isWeek) {
        var url = urls.user + "/rank";
        var _week = null;
        if (isWeek) {
            _week = 'isweek';
        }
        var param = {
            groupid: groupId,
            week: _week,
        }//config.getParam();
        util.request({
            url: url,
            data: param,
            method: 'GET',
            success: res => {
                //服务器存储的用户数据
                if (callBack && typeof callBack == 'function') callBack(res.data)
            },
            fail: res => {

            },
        })
    }
};
