const key = "__token__";

var token = null;

function getToken() {
    return token;
}

function checkToken() {
  if(!token){
      let _token = cc.sys.localStorage.getItem("wxToken");
      if(_token){
          token = JSON.parse(_token);
      }
  }
  if (!token) return false;
    return true;
}

function setToken(info) {
    token = info;
    cc.sys.localStorage.setItem("wxToken",JSON.stringify(token));
    console.log('setToken:' + token);
}

module.exports = {
    getToken: getToken,
    checkToken: checkToken,
    setToken: setToken
}