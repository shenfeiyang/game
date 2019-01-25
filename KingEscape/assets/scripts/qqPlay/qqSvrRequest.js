var config = require('config');
var urls = require('route').qUrls;
var util = require('qqUtil');
var qqPlay = require('qqPlay');

const login = p => {
    let channel;
    if (p.info.gameParam && p.info.gameParam['from']) {
        channel = p.info.gameParam['from']
    } else {
        channel = 1078;
    }
    let param = {
        game_id: config.qqGameID,
        channel_id: channel,
        openid: p.info.openId,
        server_id: '1',
        roleid: '1',
    }
    let url = urls.baseUrl + '/login.php';
    util.qqRequest({
        url: url,
        data: param,
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        method: 'POST',
        success: res => {
            console.log("login", res)
            if (p['success'] && typeof p.success == 'function') p.success(res);
        },
        fail: res => {
            console.log(" login fail", res)
            if (p['fail'] && typeof p.fail == 'function') p.fail(res);
        }
    })

};

const createRole = p => {
    qqPlay.getNick(p.info.openId, (openid, nick) => {
        let channel;
        if (p.info.gameParam && p.info.gameParam['from']) {
            channel = p.info.gameParam['from']
        } else {
            channel = 1078;
        }
        let param = {
            game_id: config.qqGameID,
            channel_id: channel,
            openid: p.info.openId,
            server_id: '1',
            rolename: nick,
            roleid: '1',
        }
        let url = urls.baseUrl + '/create.php';
        util.qqRequest({
            url: url,
            data: param,
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            method: 'POST',
            success: res => {
                console.log("createRole", res)
                if (p['success'] && typeof p.success == 'function') p.success(res);
            },
            fail: res => {
                console.log(" createRole fail", res)
                if (p['fail'] && typeof p.fail == 'function') p.fail(res);
            }
        })
    });
};
const getCDNMsgByUrl = (url, callback) => {
    util.qqRequest({
        url: url,
        data: '',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        method: 'get',
        success: res => {
            console.log("getCDNMsgByUrl", res)
            if (callback && typeof callback == 'function') callback(res);
        },
        fail: res => {
            console.log(" getCDNMsgByUrl fail", res)
        }
    })
};
//好友邀请分享点击上报
const reportShare = p => {
    let func = (name, icon) => {
        let param = {
            appid: config.gameId,
            tag: p.gameParam.inviteFriend,
            share_serverid: 0,
            share_roleid: 0,
            share_uid: p.gameParam.uid,
            uid: p.openId,
            name: name,
            avatarUrl: icon,
            gender: p.sex,
            city: '',
        }
        let url = urls.cpFriend + '/cp_reportShare';
        util.qqRequest({
            url: url,
            data: '',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            method: 'post',
            success: res => {
                console.log("reportShare", res)
                if (callback && typeof callback == 'function') callback(res);
            },
            fail: res => {
                console.log(" reportShare fail", res)
            }
        })
    }
    qqPlay.getNick(p.openId, (name) => {
        qqPlay.getHead(p.openid, (icon) => func(name, icon))
    });
};
const getFriends = (tag, callback) => {
    let url = urls.cpFriend + '/cp_getFriends';
    let param = {
        appid: config.config.appid,
        uid: GameStatusInfo.openId,
        tag: tag,
    }
    util.qqRequest({
        url: url,
        data: '',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        method: 'get',
        success: res => {
            console.log("getReportFriends", res)
            if (res.data.ecode == 114) {
                if (callBack && typeof callBack == 'function') callBack();
                return;
            }
            if (callBack && typeof callBack == 'function') callBack(res.data.data);
        },
        fail: res => {
            console.log(" reportShare fail", res)
        }
    })
};
module.exports = {
    login: login,
    createRole: createRole,
    getCDNMsgByUrl: getCDNMsgByUrl,
    reportShare: reportShare,
    getFriends: getFriends,
}
