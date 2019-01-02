var globalFunc ={
    getTextext(text){
        if(!!!text || !!!text["title"] || text.title.length === 0){
            return "";
        }
        console.log(text);
        var num = text.title.indexOf('#');
        if(num == -1){
            return text.title;
        }
        var nextNum = text.title.indexOf('#',num + 1);
        if(nextNum == -1){
            return text.title;
        }
        var beforeStr = text.title.slice(0,num);
        var curStr = text.title.slice(num+1,nextNum);
        var nextStr = text.title.slice(nextNum+1);
        console.log(beforeStr,"curStr",curStr,"next",nextStr);
        text.title = beforeStr+ text[curStr] + nextStr;
        console.log(text.title);
        return text.title;
    },

    compareVersion(v1, v2) {
        v1 = v1.split('.');
        v2 = v2.split('.');
        var len = Math.max(v1.length, v2.length);
        while (v1.length < len) {
            v1.push('0');
        }
        while (v2.length < len) {
            v2.push('0');
        }
        for (var i = 0; i < len; i++) {
            var num1 = parseInt(v1[i]);
            var num2 = parseInt(v2[i]);
            if (num1 > num2) {
                return 1;
            } else if (num1 < num2) {
                return -1;
            }
        }
        return 0;
    },
    myEval(str){
        let length = str.length;
        let object = {};
        let objPos1 = str.indexOf("{",0);
        let objPos2 = str.lastIndexOf("}",length - 1 );
        if(objPos1 == -1 || objPos2 == -1 ){
            return null;
        }
        let list = str.split(',');
        //console.log(list);

        for(let i = 0; i < list.length; i++){
            let info = list[i];
            let sStr = new String();
            let eStr = new String();
            let flag = true;
            info = info.replace(/(^\s*)|(\s*$)/g, ""); 
            sStr = info.match(/text\d/g);
            let _index = info.indexOf(':');
            _index = info.indexOf('"', _index+1);
            let _end = info.lastIndexOf('"');
            eStr = info.substring(_index + 1, _end);
            //console.log(sStr,eStr);
            object[sStr[0]] = eStr;
        }
        return object;

    },
}

module.exports = globalFunc;