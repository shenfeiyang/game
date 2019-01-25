// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

const config = require('config');
const global = require('global');

const compose = (f1, f2) => (x) => f1(f2(x));
const checkLink = (link) => (typeof link == "string") && link != "";
const id = x => x;
//广告类别
let bannerAdType = 0;

const any = "any";
let more = [];   //单例
let forward = false;
let adFrames = []; //悬浮广告
let adBigFrames = []; // 大的序列帧动画
let frameIdx = Number(0);
let bannerAdInfo = []; // 底部banner 模式1
let farvorPlayInfo = []; // 底部banner 模式2
let loopBannerInfo = [];// 底部banner 模式3
let justgdt = 0;
let edge = []; // 猜你爱玩
let adexp = []; // 抽屉广告
let adxiaochuinfo = []; //消除矩阵
let ad4Reborn = {};
let spriteFrameMap = {};//key:url, value: cc.spriteFrame
let eventListener = {};

const ios_andr_platform = (() => {
	if (cc.sys.platform == cc.sys.WECHAT_GAME) {
		return wx.getSystemInfoSync().platform == 'ios' ? 1 : 2;
	}
	return 2;
})();
const platform = (cc.sys.platform == cc.sys.WECHAT_GAME) ? require("platformAdc").wxAdc :
	((cc.sys.platform == cc.sys.QQ_PLAY) ? require("platformAdc").qqAdc : require("platformAdc").other);

const pullAdcInfo = (node) => {
	const param = config.getParam();
	param['sex'] = global.getGender();//1,2,0
	param['ptform'] = ios_andr_platform;
	console.log("pullAdcInfo", param);
	return (reject, result) => {
		const request = platform.request;
		const url = platform.root + node;
		request({
			url: url,
			data: param,
			method: 'POST',
			success: result,
			fail: reject,
		});
	};

};

const doEvents = (event) => {
	const events = eventListener[event];
	const list = events ? events : [];
	list.map(event => {
		if (typeof event == "function") event();
	})
}
const updateSpriteFrameMap = (key, val) => {
	spriteFrameMap[key] = val;
	doEvents(key);
	if (key != any) doEvents(any);
}
//proto::String -> Object -> a
const proto = (pro, obj) => obj[pro];
const pullRemoteRes = (url) => {
	if (!spriteFrameMap[url]) {
		platform.loadRes(url, (sf) => updateSpriteFrameMap(url, sf))
	}
};

const wait4Res = (url, event) => {
	eventListener[url] = eventListener[url] ? eventListener[url] : [];
	eventListener[url].push(event);
	//console.log("push event<<<<<<<<<<", url, event)
	if (spriteFrameMap[url] && typeof event == "function") event();
	else if (url == any && typeof event == "function") event();
	else if (!!!spriteFrameMap[url] && typeof event == "function") pullRemoteRes(url);
};
const wait4ResAny = (event) => wait4Res("any", event);

const unWait4Res = (url, event) => {
	const events = eventListener[url];
	if (events) {
		let list = [];
		events.map((e) => event != e ? list.push(e) : 0)
		eventListener[url] = list;
	}
}
const unWait4ResAny = (event) => unWait4Res(any, event);

const loadFromLocalFile = (path, cb) => {
	cc.loader.load(path, (err, clip) => {
		cb(new cc.SpriteFrame(clip));
	});
};

const getMore = (update) => {
	if (update) pullAdcInfo("/getMoreInfo")((res) => console.log(res),
		(res) => {
			console.log(res);
			const data = platform.getDataFromRes(res);
			more = (data && data.moreInfoList) ? data.moreInfoList : more;
			forward = data ? !!data['forward'] : forward;
			const list = more;
			//getUrl :: Object -> String
			const getIconUrl = (obj) => proto("icon", obj);
		});
	return more;
};
const getAdFrame = (update) => {
	if (update) pullAdcInfo("/getAdFrame")((res) => console.log(res),
		(res) => {

			const data = platform.getDataFromRes(res);
			adFrames = (data && Array.isArray(data.adFrames)) ? data.adFrames : adFrames;

			adBigFrames = (data && Array.isArray(data.adSequences)) ? data.adSequences : adBigFrames;
			console.log("adFrames res:", adFrames, data);
			adFrames.map((adFrame) => {
				if (checkLink(adFrame.url)) pullRemoteRes(adFrame.url), console.log("pull res@@@@@@@@@@@@@@@@@@@@");
			})
			adBigFrames.map((adFrame) => {
				if (checkLink(adFrame.url)) pullRemoteRes(adFrame.url), console.log("pull res@@@@@@@@@@@@@@@@@@@@");
			})
		});
	const len = adFrames.length;
	const idx = frameIdx % (len > 0 ? len : 1);
	frameIdx += 1;
	const ans = (typeof adFrames[idx] == "object") ? adFrames[idx] : {};
	return ans;
};

const getAdBigFrame = () => {
	const len = adBigFrames.length;
	if (len <= 0) {
		return;
	}
	const idx = Math.floor(Math.random() * len * 10) % len;
	const ans = (typeof adBigFrames[idx] == "object") ? adBigFrames[idx] : {};
	return ans;
};

const getAdEdge = () => {
	pullAdcInfo("/getLikeInfo")((res) => console.log(res),
		(res) => {

			const data = platform.getDataFromRes(res);
			edge = (data && data.likeInfoList) ? data.likeInfoList : edge;
			console.log("getLikeInfo", edge)
		});
	return edge;
}
const getAdEdges = () => { return edge };

const getAdText = () => {
	pullAdcInfo("/getNoticeAdInfo")((res) => console.log(res),
		(res) => {

			const data = platform.getDataFromRes(res);
			global.noticeAdInfo = (data && Array.isArray(data.noticeList)) ? data.noticeList : undefined;;
			console.log("getNoticeAdInfo", data)
		});
	return 0;
}

const getAdFrames = () => adFrames;
const getBannerAdInfo = (update) => {
	if (update) pullAdcInfo("/getBannerAdInfo")((res) => console.log(res),
		(res) => {
			const data = (typeof res.data == "object") ? platform.getDataFromRes(res) : {};
			const list = data['bannerAdInfo'] ? data['bannerAdInfo'] : [];
			justgdt = !!data['justgdt'];
			console.log("getBannerAdInfo res:", res);
			bannerAdType = data['bannerAdType'] || 0;
			list.map((e) => {
				if (e['url']) pullRemoteRes(e['url']);
			})
			if (bannerAdType == 1) {
				farvorPlayInfo = data['farvorPlayInfo'] ? data['farvorPlayInfo'] : [];
				farvorPlayInfo.map((e) => {
					if (e['url']) pullRemoteRes(e['url']);
				});
			} else if (bannerAdType == 2) {
				loopBannerInfo = data['loopBannerInfo'] ? data['loopBannerInfo'] : [];
				loopBannerInfo.map((e) => {
					if (e['url']) pullRemoteRes(e['url']);
				});
			}

			bannerAdInfo = list;
			console.log("getBannerAdInfo++++++++++++++++++++++++++++", farvorPlayInfo, loopBannerInfo, bannerAdInfo)
		});
	return bannerAdInfo;
}
const getBannerAdType = () => { return bannerAdType; }
const getFarvorPlayInfo = () => { return farvorPlayInfo; };
const getLoopBannerInfo = () => { return loopBannerInfo; };

const getSpriteFrame = (remoteUrl) => spriteFrameMap[remoteUrl] ? spriteFrameMap[remoteUrl].clone() : null;
//splitRect:: cc.Rect -> (Int, Int) -> [cc.Rect]
const splitRect = (rect, size) => {
	const c = size[0];//列数
	const r = size[1];//行数
	const dx = rect.width / c;
	const dy = rect.height / r;
	const ox = rect.x;
	const oy = rect.y;
	//console.log(c, r, dx, dy, ox, oy, rect);
	const split = (x, y) => new cc.rect(ox + dx * x, oy + dy * (r - y - 1), dx, dy);
	let list = new Array();
	for (let i = 0; i < r; i++)
		for (let j = 0; j < c; j++)
			list = list.concat(split(j, i));

	console.log(list)
	return list;
};
//createRemoteFrames:: String -> [cc.Rect] -> [cc.SpriteFrame]
const createRemoteFrames = (url, size) => {
	const spriteFrame = getSpriteFrame(url);
	const rects = splitRect(spriteFrame.getRect(), size);
	const frames = spriteFrame ? rects.map((rect) => {
		const sf = spriteFrame.clone();
		sf.setRect(rect);
		return sf;
	}) : [];
	return frames;
};
const logger = (x) => {
	console.log("logger >>>>>>>>", x)
	return x;
}
//createClipWithSpriteFrames:: Number -> ([cc.SpriteFrame] -> cc.AnimationClip
const createClipWithSpriteFrames = (dt) => (frames) => cc.AnimationClip.createWithSpriteFrames(logger(frames), dt);
//getRemoteClip :: String -> [cc.Rect] -> Number -> cc.AnimationClip
const getRemoteClip = (url, size, dt, len) => createClipWithSpriteFrames(dt)(createRemoteFrames(url, size).slice(0, len))

const getAdexpInfo = (update) => {
	if (update) pullAdcInfo("/getAdexpInfo")((res) => console.log("getAdexpInfo fail:", res),
		(res) => {
			const data = platform.getDataFromRes(res);
			console.log("getAdexpInfo success:", data);
			adexp = (data && data.adexpList) ? data.adexpList : adexp;
			const list = adexp;
			//getUrl :: Object -> String
			const getIconUrl = (obj) => proto("icon", obj);
			//list.map(compose(pullRemoteRes, getIconUrl));
		});
	return adexp;
};
const getAdXiaochuInfo = (update) => {
	if (update) pullAdcInfo("/getAdXiaochuInfo")((res) => console.log("getAdXiaochuInfo fail:", res),
		(res) => {
			const data = platform.getDataFromRes(res);
			console.log("getAdXiaochuInfo success:", data);
			adxiaochuinfo = (data && data.adXiaochuList) ? data.adXiaochuList : adxiaochuinfo;
			const list = adxiaochuinfo;
			list.map((e) => {
				if (e.icon) pullRemoteRes(e.icon)
			});
		});
	return adxiaochuinfo;
};
const getSvrAd4Reborn = () => {
	if (1) pullAdcInfo("/getAd4reborn")((res) => console.log(res),
		(res) => {
			const data = platform.getDataFromRes(res);
			console.log("getAd4Reborn", data)
			ad4Reborn = (data && data.tryInfo) ? data.tryInfo : ad4Reborn;
		});
	return ad4Reborn;
};
const getAdRebornInfo = () => { return ad4Reborn };
module.exports = {
	getMoreInfo: getMore,
	getSpriteFrame: getSpriteFrame,
	getRemoteClip: getRemoteClip,
	wait4Res: wait4Res,
	wait4ResAny: wait4ResAny,
	unWait4Res: unWait4Res,
	unWait4ResAny: unWait4ResAny,
	getAdFrame: getAdFrame,
	getAdBigFrame: getAdBigFrame,
	getBannerAdType: getBannerAdType,
	getBannerAdInfo: getBannerAdInfo,
	getFarvorPlayInfo: getFarvorPlayInfo,
	getLoopBannerInfo: getLoopBannerInfo,
	checkLink: checkLink,
	isForward: () => forward,
	getAdEdge: getAdEdge,
	getAdEdges: getAdEdges,
	justgdt: () => justgdt,
	getAdText: getAdText,
	getAdexpInfo: getAdexpInfo,
	getSvrAd4Reborn: getSvrAd4Reborn,
	getAdRebornInfo: getAdRebornInfo,
	getAdXiaochuInfo: getAdXiaochuInfo,
};
