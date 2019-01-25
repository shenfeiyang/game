var util = require("util");
var config = require("config");
var global = require("global");

var adtask = module.exports

adtask.setData = (data) => {
    adtask.data = data;
};

adtask.getData = () => {
    return adtask.data;
};

adtask.setReceive = (data) => {
    
    if(!adtask.haskTask)
        adtask.haskTask = [];
    adtask.rData = data;
};

adtask.addReceive = (id) => {
    adtask.rData.push(id);
}

adtask.getReceive = () => {
    return adtask.rData;
};

adtask.getHasReceive = (id) => {
    return adtask.rData.indexOf(id) != -1;
}

adtask.hasGetReWard = (id) => {
    return adtask.haskTask.indexOf(id) != -1;
}

adtask.addHasTsk = (id) => {
    adtask.haskTask.push(id);
} 

adtask.getHasTask = (id) => {
    return adtask.haskTask
}

adtask.setHasTask = (data) => {
    adtask.haskTask = data;
}

adtask.checkReceive = () => {
    console.log("--------")
    console.log(adtask.rData)
    console.log(adtask.haskTask);
    console.log("--------")
    if(adtask.rData && adtask.rData.length > 0) {
        for(var i = 0; i < adtask.rData.length; i++) {
            if(adtask.haskTask.indexOf(adtask.rData[i]) === -1) {
                global.receiveCall1();
                return;
            }
        }
    }
    global.receiveCall2();
};

adtask.inTaskList = (id, callback) => {
    if(adtask.hasGetReWard(id))
        return;
    util.request({
        url: config.base_url + "/taskWall/getTaskList",
        data: {
            appid:config.getParam().appid,
        },
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        method: 'POST',
        success: res => {
            if(res.data.tskList) {
                if(res.data.tskList.indexOf(id) != -1) {
                    callback();
                } else { 
                    wx.showModal({
                        title:"提示",
                        content:"体验时间不足"
                    });
                }

                console.log(">>>" + id);
                console.log(res.data.tskList);
            }
        }, fail: res => {
            console.log("报错了");
        }
    })
};

adtask.rewardTask = (sUid ,srcId, tskId) => {
    console.log(">>>上报tskid" + tskId);
    util.request({
        url: config.base_url + "/adc/rewardTask",
        data: {
            appid:srcId,
            uid:sUid,
            tskid:tskId,
        },
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        method: 'POST',
        success: res => {
            if(res.data) {
                console.log(">>>suid=" + sUid + "srcid=" + srcId + "tskid="+tskId);
                console.log(res.data);
            }
        }, fail: res => {
            console.log("报错了");
        }
    });
}



adtask.completeTask = (sUid ,srcId, tskId) => {
    console.log(">>>上报tskid" + tskId);
    util.request({
        url: config.base_url + "/adc/completeTask",
        data: {
            srcid:srcId,
            suid:sUid,
            tskid:tskId,
        },
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        method: 'POST',
        success: res => {
            if(res.data) {
                console.log(">>>suid=" + sUid + "srcid=" + srcId + "tskid="+tskId);
                console.log(res.data);
            }
        }, fail: res => {
            console.log("报错了");
        }
    })
};