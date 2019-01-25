// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html
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
        image:{
            default:null,
            type:cc.Node,
        },
        nameUser:{
            default:null,
            type:cc.Node,
        },
        score:{
            default:null,
            type:cc.Node,
        },
        rankk : cc.Node,
        rankSp:cc.Node,
        rs:[cc.SpriteFrame],

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
    },

    start () {

    },
    init(data, index, target, key, isDoubleRank = false){
        if(isDoubleRank){
            this.node.setContentSize(540,100);
            let line = cc.find('line',this.node);
            line.setContentSize(500,2);
        }
        let self = this;
        //console.log("items"+ JSON.stringify(data) + index + key);
        var nameLabel = this.nameUser.getComponent(cc.Label);
        //console.log("namelabel"+nameLabel);
        var scoreLabel = this.score.getComponent(cc.Label);
        //console.log("scoreLabel"+scoreLabel);
        var sprite = this.image.getComponent(cc.Sprite);
        //console.log("sprite"+sprite);
        let _ranks = this.rankk.getComponent(cc.Label);
       // //console.log("ranks" + this.rankk + nameLabel + this.rankk.active + this.rankSp + this.rs[index]);
        _ranks.string = index + 1
        if(index < 3){
            this.rankk.active = false;
            this.rankSp.active = true;
            this.rankSp.getComponent(cc.Sprite).spriteFrame = this.rs[index];
        }else{
            this.rankk.active = true;
            this.rankSp.active = false;
        }
        //console.log("111")
        
        let str = data.nick || "";
        
        if( str.length > 5){
            str = str.slice(0,5) + "...";
        }
        //console.log("+++++++++++++++++ ",str,str.length);
        nameLabel.string = str;//data.nick || "";
        scoreLabel.string = data[key] || 0 ;
        
        //获取人物头像
        var texture = data.url;
        if (!texture){
            return
        }
        //console.log("111")
        // texture = texture.split("/0",1); 
        // texture = texture + "/64";
        cc.loader.load({url:texture, type:'png'},function(err,texture){
            ////console.log("loadUrl",texture instanceof cc.Texture2D)
            var spriteFrame = new cc.SpriteFrame();
            spriteFrame.setTexture(texture)
            sprite.spriteFrame = spriteFrame;
            self.image.setContentSize(64,64);
            //console.log("333")

        })
    }

    // update (dt) {},
});
