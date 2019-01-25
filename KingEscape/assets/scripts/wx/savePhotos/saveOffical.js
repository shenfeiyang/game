cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

    },

    start() {
        this.node.active = true;
    },

    saveMysteriousNewGameOffical() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            var path = cc.url.raw('resources/plugIn/savePhotos/res/ImgNewGame.png');
            if (cc.loader.md5Pipe) {
                path = cc.loader.md5Pipe.transformURL(path);
            }

            wx.saveImageToPhotosAlbum({
                filePath: path,//'res/raw-assets/resources/wx/savePhotos/res/ImgNewGame.png',
                success(result) {
                    console.log("success");
                    console.log(result)
                    wx.showModal({
                        title: '怎么扫描二维码？',
                        content: '图片保存相册后，点击微信中的扫一扫，然后点击右上角的相册，从相册中选取这张图片即可！',
                        showCancel: false,
                        success: function (res) { }
                    });
                },
                fail(result) {
                    console.log(result);
                    wx.getSetting({
                        success(res) {
                            if (!res.authSetting['scope.writePhotosAlbum']) {
                                wx.showModal({
                                    title: '保存失败',
                                    content: '是否打开保存相册权限？',
                                    success: function (res) {
                                        if (res.confirm) {
                                            wx.openSetting({})
                                        }
                                    }
                                })
                            } else {
                                //保存失败
                                wx.showModal({
                                    title: '保存失败',
                                    showCancel: false,
                                    success: function (res) { }
                                });
                            }
                        }
                    })
                }
            })
        }
    },

    saveHongbaoOffical() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            var path = cc.url.raw('resources/plugIn/savePhotos/res/ImgHongbao.png');
            if (cc.loader.md5Pipe) {
                path = cc.loader.md5Pipe.transformURL(path);
            }

            wx.saveImageToPhotosAlbum({
                filePath: path,//'res/raw-assets/resources/wx/savePhotos/res/ImgHongbao.png',
                success(result) {
                    console.log("success");
                    console.log(result)
                    wx.showModal({
                        title: '怎么扫描二维码？',
                        content: '图片保存相册后，点击微信中的扫一扫，然后点击右上角的相册，从相册中选取这张图片即可！',
                        showCancel: false,
                        success: function (res) { }
                    });
                },
                fail(result) {
                    console.log(result);
                    wx.getSetting({
                        success(res) {
                            if (!res.authSetting['scope.writePhotosAlbum']) {
                                wx.showModal({
                                    title: '保存失败',
                                    content: '是否打开保存相册权限？',
                                    success: function (res) {
                                        if (res.confirm) {
                                            wx.openSetting({})
                                        }
                                    }
                                })
                            } else {
                                //保存失败
                                wx.showModal({
                                    title: '保存失败',
                                    showCancel: false,
                                    success: function (res) { }
                                });
                            }
                        }
                    })
                }
            })
        }
    },

    saveOffical() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            var path = cc.url.raw('resources/plugIn/savePhotos/res/offical.png');
            if (cc.loader.md5Pipe) {
                path = cc.loader.md5Pipe.transformURL(path);
            }
            wx.saveImageToPhotosAlbum({
                filePath: path, //'res/raw-assets/resources/wx/savePhotos/res/offical.png',
                success(result) {
                    console.log("success");
                    console.log(result)
                    wx.showModal({
                        title: '怎么扫描二维码？',
                        content: '图片保存相册后，点击微信中的扫一扫，然后点击右上角的相册，从相册中选取这张图片即可！',
                        showCancel: false,
                        success: function (res) { }
                    });
                },
                fail(result) {
                    console.log(result);
                    wx.getSetting({
                        success(res) {
                            if (!res.authSetting['scope.writePhotosAlbum']) {
                                wx.showModal({
                                    title: '保存失败',
                                    content: '是否打开保存相册权限？',
                                    success: function (res) {
                                        if (res.confirm) {
                                            wx.openSetting({})
                                        }
                                    }
                                })
                            } else {
                                //保存失败
                                wx.showModal({
                                    title: '保存失败',
                                    showCancel: false,
                                    success: function (res) { }
                                });
                            }
                        }
                    })
                }
            })
        }
    },
    closeEvent() {
        this.node.active = false;
    }

    // update (dt) {},
});