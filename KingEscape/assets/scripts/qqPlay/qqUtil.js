const md5 = require('md5');
const config = require('config');

const qqRequest = p => {
    var url = p.url;
    var data = p.data || {};
    var header = p.header || {};
    var method = p.method || 'GET';
    var success = p.success || function (res) { };
    var fail = p.fail || function (err) { };

    console.log("qqRequest")
    var httppost2 = new BK.HttpUtil(url);
    httppost2.setHttpMethod(method)
    httppost2.setHttpHeader(header); //设置header
    //获取data格式
    let qDataList = getQQData(data);
    let sign = qqSign(qDataList);
    qDataList.push('sign='+sign);
    let res = qDataList.join('&');
    console.log("qqRequest" + res);

    httppost2.setHttpPostData(res);
    //设置referer,cookie
    // httppost2.setHttpReferer("www.abc.com");
    // httppost2.setHttpCookie("cookie1=value1; cookie2=value2; cookie3=value3;");

    httppost2.requestAsync((res, code) =>{
        var string = res.readAsString();
        console.log("httpLog  response code= " + code);
        console.log("httpLog  callback  :" + string);
        if( string == '1'){
            if(success && typeof success == 'function') success(res);
        }else{
            if(fail && typeof fail == 'function') fail(res);
        }
    });
};

/**
 * 处理 qq 数据
 * @param {*} p 
 */
const getQQData = p =>{

    var list = new Array();
    for (var item in p) {
        var type = typeof p[item];
        if (type == "string" || type == "number") {
            var tmp = item + "=" + p[item];
            list.push(tmp);
        }
    }
    
    // list.sort(function (o0, o1) {
    //     return o0 < o1;
    // }); 
    for(let i = 0 ; i < list.length; i ++){
        let info = list[i];
        for(let j = i + 1 ; j < list.length; j++ ){
            if(info > list[j]){
                let temp = info;
                info = list[j];
                list[j] = temp;
            }
        }
        list[i] = info;
    }

    console.log("getQQData" + JSON.stringify(list));
    //let res = list.join('&');
    //return res;  
    return list;
};
const qqSign = p => {
    let res = p.join('&');
    res += config.qqGameKey;
    return md5.md5(res);
};

module.exports = {
    qqRequest:qqRequest
}