// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
//var self = null;
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
        mask :cc.Node,
        textPreb:cc.Prefab,
        sp: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //this = this;
        cc.game.addPersistRootNode(this.node);
        this._textList = new Array();
        this._speed = 150;
        this._flag = true;
        this._textNode = cc.instantiate(this.textPreb);
        this._maskSize = this.mask.getContentSize();
        this._textSize = this._textNode.getContentSize();
        this._x = this._maskSize.width/2+ this._textSize.width/2 ;
        this.mask.addChild(this._textNode);
        this._textNode.setPosition(cc.v2(this._x,0));
    },

    start () {

    },
    // 跑马灯
    addText(text){
        this._textList.push(text);
    },
    update (dt) {
        if(this._textList.length > 0){
            
            let point = this._textNode.getPosition();
            if(point.x < - this._x && this.sp.active){
                this._textList.splice(0,1);
                this._flag = true;
                //point.x = this._x;
            }else{
                point.x -= dt*this._speed;
            }
            if(this.updateTextInfo()){
                point.x = this._x;
            }
            this._textNode.setPosition(point);
        }else{
            this.sp.active = false;
            this._flag = true;
        }

    },
    updateTextInfo(){
        if(this._flag && this._textList[0] ){
            let _textNode = cc.find("text",this._textNode);
            _textNode.getComponent(cc.RichText).string = this._textList[0];
            let _size =  _textNode.getContentSize();
            //console.log("textNodeSize",_size)
            this._x = _size.width/2 + this._maskSize.width/2;
            this._textNode.setContentSize(_size.width,this._textSize.height);
            this._flag = false;
            this.sp.active = true;
            return true;
        }
        return false;
    },
    // 定时器
    addTimeInfo(callBack,times =1,levelTime = 1, delay = 0){
        this._levelTime = levelTime;
        this._callBack = callBack;
        this.schedule(this._mainTime,times);
        console.log(this._callBack,this._levelTime)
    },
    _mainTime(){
      if(this._levelTime <= 0){
        this.unschedule(this._mainTime);
        if(this._callBack){
            this._callBack()
            //this.node.emit(this._callBack);
            console.log("dispatchEvent ")
        }
        return;
      }  
      this._levelTime --
    }
});
