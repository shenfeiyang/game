var localStorage = {
    getLocalStorage(name){
        let storage = cc.sys.localStorage.getItem(name);
        if(storage){
            storage = JSON.parse(storage);
        }
        return storage;
    },
    setLocalStorage(name,info){
        cc.sys.localStorage.setItem(name,JSON.stringify(info));
    }
}

module.exports = localStorage;