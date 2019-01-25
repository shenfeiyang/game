// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

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
        title: cc.Label,
        title2: cc.Node,
        select: cc.Node,
        qqSelectSp: [cc.SpriteFrame],
        qqUnSecletSp:[ cc.SpriteFrame],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() { },

    start() {

    },
    init(data, index, js, isQQ, length) {
        console.log("rankMoreItem", data, index, js);

        if (!data) {
            return;
        }
        this.isQQ = isQQ;
        this.length = length;
        this._choise = 0;
        if( index === 0){
            this._choise = 0;
        }else if( index  ===  length - 1){ 
            this._choise = 2
        }else{
            this._choise = 1;
        }
        this._data = data;
        this._index = index;
        this._js = js;
        this.title.string = this._data.title;
        this.title2.getComponent(cc.Label).string = this._data.title;
        if (index == this._js._select) {
            if (this.isQQ) {
                this.loadQQSP(1,this._choise);
            } else {
                this.select.active = true;
            }
            this.title2.active = false;
        } else {
            if (this.isQQ) {
                this.loadQQSP(0,this._choise);
            } else {
                this.select.active = false;
            }

            this.title2.active = true;
        }
    },
    loadQQSP(flag = false) {
        if (flag) {
            this.select.getComponent(cc.Sprite).spriteFrame = this.qqSelectSp[this._choise];
        } else {
            this.select.getComponent(cc.Sprite).spriteFrame = this.qqUnSecletSp[this._choise];
        }
    },
    btn() {
        if (this._js._select != this._index) {
            this._js.updataCellInfo(false);
            this._js._select = this._index;
            this._js.updateOpenData();
        }
    },
    setSelet(flag = false) {
        if (this.isQQ) {
            this.loadQQSP(flag,this._choise);
        } else {
            this.select.active = flag;
        }
        this.title2.active = !flag;
    }
    // update (dt) {},
});
