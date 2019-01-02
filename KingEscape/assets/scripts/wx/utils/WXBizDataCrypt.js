//var Crypto = require('Crypto'); 想解密请网上重新下载 crypto 插件

function WXBizDataCrypt(appId, sessionKey) {
  this.appId = appId;
  this.sessionKey = sessionKey;
}

WXBizDataCrypt.prototype.decryptData = function (encryptedData, iv) {
  var encryptedData = Crypto.util.base64ToBytes(encryptedData);
  var key = Crypto.util.base64ToBytes(this.sessionKey);
  var iv = Crypto.util.base64ToBytes(iv);

  var mode = new Crypto.mode.CBC(Crypto.pad.pkcs7);

  try {
    // 解密
    var bytes = Crypto.AES.decrypt(encryptedData, key, {
      asBpytes: true,
      iv: iv,
      mode: mode
    });

    var decryptResult = JSON.parse(bytes);

  } catch (err) {
    console.log(err);
  }

  if (decryptResult && decryptResult["watermark"] && decryptResult.watermark.appid !== this.appId) {
    console.log(err);
  }

  return decryptResult;
}

module.exports = WXBizDataCrypt;
