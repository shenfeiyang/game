const route = require('route');
const checkPath = (path) => (typeof path == "string") && path != "";
let resFileMap;		//Sington
//const resFileDir = "/res";
const resFileKey = "resFileMap";
const getStorageSync = (key) => {
	let data = cc.sys.localStorage.getItem(key);
	if (data) return JSON.parse(data);

}
//getResFileMap :: String->Obj
const getResFileMap = (url) => {
	if (typeof resFileMap != "object") {
		resFileMap = getStorageSync(resFileKey);
		resFileMap = (typeof resFileMap == "object") ? resFileMap : {};
	}
	return typeof resFileMap[url] == "object" ? resFileMap[url] : {};
};
const setStorageSync = (key, value) => {
	cc.sys.localStorage.setItem(key, JSON.stringify(value));
}
const saveResFileMap = () => {
	setStorageSync(resFileKey, resFileMap);
}
const mapResFile = (url, path) => {
	if (typeof resFileMap != "object") getResFileMap("");
	resFileMap[url] = path;
	saveResFileMap();
}
const cleanResFileMap = ()=>(resFileMap = {}) && saveResFileMap();

//=====================weChat=======================
let wxAdc = {};
{
	wxAdc.root = route.urls.adc;
	wxAdc.request = (d)=>wx.request({
		url: d.url,
		data: d.data,
		method: d.method,
		success: d.success,
		fail: d.fail,
	});
	wxAdc.loadRes = (url, cb)=>{
		const downloadUrl = () => {
			//console.log("#######################download file#################### ", url);
			wx.downloadFile({
				url: url,
				success: (res) => {
					console.log(res);
					if (res.statusCode === 200) {
						mapResFile(url, { "path": res.tempFilePath, }, );
						cc.loader.load(res.tempFilePath, (err, texture) => {
							cb(new cc.SpriteFrame(texture));
						})
					}
				}
			})
		}
		const temp = getResFileMap(url);
		const localFilePath = temp['path'];
		//const timeStamp = temp['timeStamp'] ? temp['timeStamp'] : 0;
		//const date = new Date();
		//const dt = (date.getTime() - Number(timeStamp)) / (1000 * 3600 * 24);//day
		if (checkPath(localFilePath)) 
			wx.getFileSystemManager().access({
				path: localFilePath,
				success: ()=>cc.loader.load(localFilePath, (err, texture) => {
					if(!err)
					cb(new cc.SpriteFrame(texture));
				}),
					fail: downloadUrl,
			});
		else downloadUrl();
	};
	wxAdc.getDataFromRes = (res)=>res.data;
	wxAdc.clean = cleanResFileMap;
}
//==========================end weChat==========================

//==========================qqPlay============================
let qqAdc = {};
{
	const util = require('qqUtil');
	qqAdc.root = route.qUrls.adc;
	qqAdc.request = (d)=>util.qqRequest({
		url: d.url,
		data: d.data,
		method: d.method,
		success: d.success,
		fail: d.fail,
	});
	qqAdc.loadRes = (url, cb)=>{
		cc.loader.load(url, function (err, tex) {
			if (!err) 
			cb(new cc.SpriteFrame(tex));
			else 
			console.log(err);
		});
	};
	qqAdc.getDataFromRes = (res)=>JSON.parse(res.readAsString());
	qqAdc.clean = cleanResFileMap;
};
//=============================end qqPlay===========================

//==========================other============================
let other = {};
{
	other.root = "";
	other.request = ()=>{};
	other.loadRes = (url, cb)=>{
		cc.loader.load(url, function (err, tex) {
			if (!err) 
			cb(new cc.SpriteFrame(tex));
			else 
			console.log(err);
		});
	};
	other.getDataFromRes = (res)=>res;
	other.clean = cleanResFileMap;
};
//=============================end other===========================
module.exports = {
	wxAdc: wxAdc,
	qqAdc: qqAdc,
	other:other,
};
