var config = require('config');
var util = require('util');
// var Share = require('share');

var ShareUtil = cc.Class({
    statics: {
        instance: null,
        getInstance: function () {
            if (ShareUtil.instance == null) {
                ShareUtil.instance = new ShareUtil();
            }
            return ShareUtil.instance;
        }
    },

    ctor: function () {
        this.sharedGroupList = null;
        this.loadShareGroupInfo();
    },

    loadShareGroupInfo: function () {
        // let _sharedGroupList = JSON.parse(cc.sys.localStorage.getItem('sharedGroupList'));
        let _sharedGroupList;
        let sharedGroupListItem = cc.sys.localStorage.getItem('sharedGroupList');
        if (!sharedGroupListItem) {
            sharedGroupListItem = new Array();
            cc.sys.localStorage.setItem('sharedGroupList', JSON.stringify(sharedGroupListItem));

            _sharedGroupList = sharedGroupListItem;
        } else {
            _sharedGroupList = JSON.parse(sharedGroupListItem);
        }

        console.log('loadShareGroupInfo group:', _sharedGroupList);
        let i = _sharedGroupList.length;
        while (i--) {
            let groupInfo = _sharedGroupList[i];
            // 删除过期记录
            if (!this.isToday(groupInfo.timestamp)) {
                console.log('timestamp Invalid, not today:', groupInfo.timestamp);
                _sharedGroupList.splice(i, 1);
            }
        }

        this.sharedGroupList = _sharedGroupList;
        config.shareGroupTime = _sharedGroupList.length;
        cc.sys.localStorage.setItem('sharedGroupList', JSON.stringify(this.sharedGroupList));

        console.log('loaded shareGroupTime:', config.shareGroupTime);
    },

    setShareGroupInfo: function (openGID) {
        let i = this.sharedGroupList.length;
        while (i--) {
            let groupInfo = this.sharedGroupList[i];
            // 删除过期记录
            if (!this.isToday(groupInfo.timestamp)) {
                console.log('timestamp Invalid, not today, will be delete:', groupInfo.timestamp);
                this.sharedGroupList.splice(i, 1);
            }
        }

        let exist = false;
        let index = 0;
        let isSave = false;
        for (let i = 0; i < this.sharedGroupList.length; i++) {
            if (this.sharedGroupList[i].openGID == openGID  ) {
                if (this.sharedGroupList[i].times >= config.groupTimes){
                    exist = true;
                    break;
                }
                index = i;
                isSave = true;
                break;
            }
        }

        // 新的群id
        if (!exist) {
            
            if(isSave){
                this.sharedGroupList[index].times += 1; 
            }else{
                console.log('group open id will be saved:', openGID);
                let groupInfo = {
                    openGID: openGID,
                    timestamp: new Date().getTime(),
                    times:1,
                }
                this.sharedGroupList.push(groupInfo);
            }
            config.shareGroupTime = this.sharedGroupList.length;
            cc.sys.localStorage.setItem('sharedGroupList', JSON.stringify(this.sharedGroupList));
            return 1;
        } else {
            console.log('group open id already exist:', openGID);
        }
        return 2;
    },

    isToday (time) {
        return new Date(time).toDateString() === new Date().toDateString();
    },
});
