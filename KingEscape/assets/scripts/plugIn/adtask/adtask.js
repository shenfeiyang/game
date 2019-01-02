var util = require("util");
var config = require("config");

var adtask = module.exports

adtask.setData = (data) => {
    adtask.data = data;
};

adtask.getData = () => {
    console.log(">>>>>>>>>>")
    console.log(adtask.data);
    console.log(">>>>>>>>>>")
    return adtask.data;
};

adtask.inTaskList = (id, callback) => {
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
                }

                console.log(">>>" + id);
                console.log(res.data.tskList);
            }
        }, fail: res => {
            console.log("报错了");
        }
    })
};

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