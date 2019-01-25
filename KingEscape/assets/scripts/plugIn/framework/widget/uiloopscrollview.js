/**
 * 排列方式枚举
 */
var ArrangeDirection = cc.Enum({
    LEFT_TO_RIGHT: 0,
    RIGHT_TO_LEFT: 1,
    UP_TO_DOWN: 2,
    DOWN_TO_UP: 3
});

var self = null; // WARNING: 可能以后会造成问题
cc.Class({
    extends: cc.Component,

    properties: {
        arrangeDirection: {
            default: ArrangeDirection.UP_TO_DOWN,
            type: ArrangeDirection,
            tooltip: 'item的排列方式, 暂不支持修改'
        },

        itemCountLimit: {
            default: 6,
            tooltip: 'item实际最大个数'
        },

        gapDis: {
            default: 20,
            tooltip: 'item 之间的间隙'
        },

        bufferZone: {
            default: 600,
            tooltip: '缓存区大小-应比显示区域大一点'
        },

        itemDataCount: {
            default: 0,
            visible: false
        },

        insertAnimation: {
            default: 0,
            visible: false
        },

        removeAnimation: {
            default: 0,
            visible: false
        },

        _createItemFunc: null,
        _updateItemFunc: null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        self = this;

        this.scrollView = this.node.getComponent(cc.ScrollView);
        this.content = this.scrollView.content;

        // 设置scrollview的滚动方向
        if (this.arrangeDirection == ArrangeDirection.LEFT_TO_RIGHT || this.arrangeDirection == ArrangeDirection.RIGHT_TO_LEFT) {
            this.scrollView.horizontal = true;
            this.scrollView.vertical = false;
        } else if (this.arrangeDirection == ArrangeDirection.UP_TO_DOWN || this.arrangeDirection == ArrangeDirection.DOWN_TO_UP) {
            this.scrollView.horizontal = false;
            this.scrollView.vertical = true;
        }

        // 根据滚动方向调整content锚点
        if (this.scrollView.vertical) {
            this.content.anchorX = 0.5;
            this.content.anchorY = 1;
        } else {
            this.content.anchorX = 0;
            this.content.anchorY = 0.5;
        }

        // 参数设置
        this.initParameter();

        // item对象池
        this.itemLoop = new cc.NodePool();

        // 当前显示的items
        this.itemList = new Array();
        this.toAddNum = 0;
    },

    /**
     * 初始化参数
     */
    initParameter() {
        // this.gapDis = 45;    // item间的间隙
        this.isScrolling = false;
    },

    start() {
        // this.initialize();
    },

    onDestroy() {
        this.itemLoop.clear();
    },

    /**
     * 注册创建item回调方法
     * @param {Function} func 
     */
    registerCreateItemFunc(func) {
        this._createItemFunc = func;
    },

    /**
     * 注册更新item回调方法
     * @param {Function} func 
     */
    registerUpdateItemFunc(func) {
        this._updateItemFunc = func;
    },

    /**
     * 设置列表item数量
     * @param {Number} count 
     */
    setTotalNum(count) {
        this.itemDataCount = count;
    },

    /**
     * 重置scrollview, 更新列表item
     */
    resetView(startIdx) {
        if (this.itemDataCount < 0) return;

        for (let i = 0; i < this.itemList.length; i++) {
            // this.itemList[i].destroy();
            this.itemLoop.put(this.itemList[i]);
        }
        this.itemList = [];
        // this.itemLoop.clear();

        this.content.width = 0;
        this.content.height = 0;

        this.isScrolling = false;
        this.initialize(startIdx);
    },

    /**
     * 滚动到最前面
     */
    moveToFront(time) {
        time = !!!time ? 0.5 : time;
        this.isScrolling = true;
        if (this.scrollView.vertical) {
            this.scrollView.scrollToTop(time);
        } else {
            this.scrollView.scrollToLeft(time);
        }
    },

    /**
     * 滚动到最后面
     */
    moveToEnd(time) {
        time = !!!time ? 0.5 : time;
        this.isScrolling = true;
        if (this.scrollView.vertical) {
            this.scrollView.scrollToBottom(time);
        } else {
            this.scrollView.scrollToRight(time);
        }
    },

    /**
     * 滚动到指定item
     * @param {Number} index item index
     * @param {Number} time 滚动时间
     */
    moveTo(index, time) {
        if (this.itemList.length <= 0) return;

        time = !!!time ? 0 : time;
        this.isScrolling = true;

        let item = this.itemList[0];
        if (this.scrollView.vertical) {
            this.scrollView.scrollToOffset(cc.p(0, (item.height + this.gapDis) * index), time);
        } else {
            this.scrollView.scrollToOffset(cc.p((item.width + this.gapDis) * index, 0), time);
        }
    },

    getItem() {
        let item = this.itemLoop.get();
        if (!item) {
            item = this.createItem();
        }
        return item;
    },

    /**
     * 调用回调方法生成item
     */
    createItem() {
        let item = this._createItemFunc();
        return item;
    },

    /**
     * 初始化item并更新显示的内容
     * @param {Node} item 
     * @param {Number} index item的序号
     */
    initItem(item, index) {
        item.dataIndex = index;
        this._updateItemFunc(item, index);
    },

    /**
     * 根据index 找到item;
     */
    getItemByIndex(index) {
        for (let i = 0; i < this.itemList.length; i++) {
            let item = this.itemList[i];
            if (item.dataIndex == index) {
                return item;
            }
        }
        return null;
    },

    /**
     * 更新所有item的显示
     */
    refreshViewItem() {
        if (this.itemList.length > 0) {
            this.itemList.forEach(item => {
                this._updateItemFunc(item, item.dataIndex);
            });
        }
    },

    update(dt) {
        if (this.itemList.length <= 0) return;
        if (this.toAddNum > 0) {  // 每帧添加节点
            let i = this.itemList.length - this.toAddNum;
            let item = this.itemList[i];
            this.content.addChild(item);
            if (this.scrollView.vertical) {
                item.setPosition(0, -item.height * (0.5 + i + this.startIdx) - this.gapDis * (i + this.startIdx));
            } else {
                item.setPosition(item.width * (0.5 + i + this.startIdx) + this.gapDis * (i + this.startIdx), 0);
            }
            this.initItem(item, this.startIdx + i);
            this.toAddNum--;
        } else {
            this.newValidate();
        }
        // this.newValidate();
    },

    initialize(startIndex) {
        let startIdx = !startIndex ? 0 : startIndex;

        this.updateTimer = 0;
        this.updateInterval = 0.1;
        this.lastContentPos = 0;
        // this.bufferZone = 600;

        let initNum = this.itemDataCount > this.itemCountLimit ? this.itemCountLimit : this.itemDataCount;
        if (startIdx + initNum > this.itemDataCount) {
            let delta = startIdx + initNum - this.itemDataCount;
            startIdx -= delta;
        }

        for (let i = 0; i < initNum; i++) {
            // let item = this.createItem();
            let item = this.getItem();
            // this.content.addChild(item);
            // item.setPosition(0, -item.height * (0.5 + i + startIdx) - this.gapDis * (i + startIdx));
            // this.initItem(item, startIdx + i);
            this.itemList.push(item);
        }

        this.startIdx = startIdx;
        this.toAddNum = initNum;

        if (this.itemList.length <= 0) return;
        if (this.scrollView.vertical) {
            let offset = this.itemList[0].height + this.gapDis;
            this.content.width = this.itemList[0].width;
            // this.content.height = this.itemDataCount * offset + this.gapDis;
            this.content.height = this.itemDataCount * offset;
        } else {
            let offset = this.itemList[0].width + this.gapDis;
            this.content.height = this.itemList[0].height;
            // this.content.height = this.itemDataCount * offset + this.gapDis;
            this.content.width = this.itemDataCount * offset;
        }


        // console.log('initialize finish, content size:', this.content.height);
        // console.log('initialize finish, itemlist length:', this.itemList.length);

        if (startIdx > 0) {
            this.moveTo(startIndex);
        }
    },

    getPositionInView(item) {
        let worldPos = item.parent.convertToWorldSpaceAR(item.position);
        let viewPos = this.scrollView.node.convertToNodeSpaceAR(worldPos);
        return viewPos;
    },

    newValidate() {
        if (this.scrollView.vertical) {
            if (this.content.y === this.lastContentPos) return;  // 没有动

            let buffer = this.bufferZone;

            let isDown = this.content.y < this.lastContentPos;
            let offset = (this.itemList[0].height + this.gapDis) * this.itemList.length;
            for (let i = 0; i < this.itemList.length; ++i) {
                let item = this.itemList[i];
                let viewPos = this.getPositionInView(item);
                if (isDown) {
                    if (viewPos.y < -buffer && item.y + offset < 0) {
                        item.setPosition(item.x, item.y + offset);
                        this.initItem(item, item.dataIndex - this.itemList.length);
                        // console.log('update item when down, index:', item.dataIndex);
                    }
                } else {
                    if (viewPos.y > buffer && item.y - offset > -this.content.height) {
                        item.setPosition(item.x, item.y - offset);
                        this.initItem(item, item.dataIndex + this.itemList.length);
                        // console.log('update item when up, index:', item.dataIndex);
                    }
                }
            }

            this.lastContentPos = this.content.y;
        } else {
            if (this.content.x === this.lastContentPos) return;  // 没有动

            let buffer = this.bufferZone;

            let isRight = this.content.x < this.lastContentPos;
            let offset = (this.itemList[0].width + this.gapDis) * this.itemList.length;
            for (let i = 0; i < this.itemList.length; ++i) {
                let item = this.itemList[i];
                let viewPos = this.getPositionInView(item);
                if (isRight) {
                    if (viewPos.x < -buffer && item.x + offset < 0) {
                        item.setPosition(item.x + offset, item.y);
                        this.initItem(item, item.dataIndex - this.itemList.length);
                        // console.log('update item when down, index:', item.dataIndex);
                    }
                } else {
                    if (viewPos.x > buffer && item.x - offset > -this.content.width) {
                        item.setPosition(item.x - offset, item.y);
                        this.initItem(item, item.dataIndex + this.itemList.length);
                        // console.log('update item when up, index:', item.dataIndex);
                    }
                }
            }

            this.lastContentPos = this.content.x;
        }
    }
});
