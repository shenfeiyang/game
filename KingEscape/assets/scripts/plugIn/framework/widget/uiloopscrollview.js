var DoTweenManager = require('dotweenmanager').getInstance();
var DoTweenType = require('dotweendefine').DoTweenType;

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
        autoLayout: {
            default: false,
            tooltip: '是否使用Layout, 使用Layout将不能使用动画'
        },

        arrangeDirection: {
            default: ArrangeDirection.LEFT_TO_RIGHT,
            type: ArrangeDirection,
            tooltip: 'item的排列方式, RIGHT_TO_LEFT和DOWN_TO_UP暂时还不支持'
        },

        removeMinLimit: {
            default: 6,
            tooltip: '移除item时需要判断的数量'
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
        cc.log('UILoopScrollView onLoaded with autoLayout ' + this.autoLayout);
        self = this;

        this.scrollView = this.node.getComponent(cc.ScrollView);
        this.content = this.scrollView.content;

        // this.blockInputPanel = cc.find('blockInput', this.node);
        // this.blockInputPanel.active = false;

        // if (this.autoLayout) {
        //     this.content.getComponent(cc.Layout).enabled = true;
        // } else {
        //     this.content.getComponent(cc.Layout).enabled = false;
        // }

        // 设置scrollview的滚动方向
        if (this.arrangeDirection == ArrangeDirection.LEFT_TO_RIGHT || this.arrangeDirection == ArrangeDirection.RIGHT_TO_LEFT) {
            this.scrollView.horizontal = true;
            this.scrollView.vertical = false;
            this.scrollViewPanelScale = this.node.width;
        } else if (this.arrangeDirection == ArrangeDirection.UP_TO_DOWN || this.arrangeDirection == ArrangeDirection.DOWN_TO_UP) {
            this.scrollView.horizontal = false;
            this.scrollView.vertical = true;
            this.scrollViewPanelScale = this.node.height;
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

        // 监听scrollview事件
        // this.scrollView.node.on('scroll-began', this.scrollBegan, this);
        // this.scrollView.node.on('scroll-ended', this.scrollEnd, this);
    },

    /**
     * 初始化参数
     */
    initParameter() {
        this.firstIndex = 0;
        this.initNum = 0;
        this.curItemNum = 0; // 调整content大小用

        this.gapDis = 0;    // item间的间隙

        this.firstItem = null;
        this.lastItem = null;

        this.editItemInFront = false;

        this.isScrolling = false;
        this.sollValidate = false;

        this.startPos = cc.Vec2.ZERO;
        this.deltaPos = cc.Vec2.ZERO;
        if (this.arrangeDirection == ArrangeDirection.LEFT_TO_RIGHT) {
            // this.startPos.x = this.content.x - this.content.width / 2;
            this.deltaPos.x = 0.5;
        } else if (this.arrangeDirection == ArrangeDirection.RIGHT_TO_LEFT) {
            // this.startPos.x = this.content.x + this.content.width / 2;
            this.deltaPos.x = -0.5;
        } else if (this.arrangeDirection == ArrangeDirection.UP_TO_DOWN) {
            // this.startPos.y = this.content.y + this.content.height / 2;
            this.deltaPos.y = -0.5;
        } else if (this.arrangeDirection == ArrangeDirection.DOWN_TO_UP) {
            // this.startPos.y = this.content.y - this.content.height / 2;
            this.deltaPos.y = 0.5;
        }

        // cc.log('content onload pos: ' + this.content.getPosition());
        // cc.log('item start pos: ' + this.startPos);
    },

    start() {
        // 当使用Layout时一次性生成所有item
        // if (this.autoLayout && this.itemList.length == 0 && this.itemDataCount > 0) {

        // for (let i = 0; i < this.itemDataCount; i++) {
        //     this.createItemAuto();
        // }
        //     this.createAutoLayoutFirstPageView();
        //     this.scrollView.scrollToTop(0);
        // }

        // 手动管理item
        // if (!this.autoLayout && this.itemDataCount > 0) {
        //     this.createFirstPageView();
        // }

        // this.initialize();
    },

    createItemAuto() {
        if (this.itemList.length >= this.itemDataCount) return;

        let item = this.createItem();
        this.content.addChild(item);
        item.setPosition(cc.Vec2.ZERO);
        this.itemList.push(item);
        this.initItem(item, this.itemList.length - 1);
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
     * 设置插入动画
     * @param {ScrollAnimation} type 
     */
    setInsertAnimation(type) {
        this.insertAnimation = type;
    },

    /**
     * 设置移除动画
     * @param {ScrollAnimation} type 
     */
    setRemoveAnimation(type) {
        this.removeAnimation = type;
    },

    createAutoLayoutFirstPageView() {
        this.createItemAuto();
        if (this.scrollView.vertical) {
            this.initNum = Math.floor(this.node.height / this.itemList[0].height);
        } else {
            this.initNum = Math.floor(this.node.width / this.itemList[0].width);
        }
        console.log('init num: ' + this.initNum);

        for (let i = 0; i < this.initNum; i++) {
            this.createItemAuto();
        }
    },

    /**
     * 生成首页
     */
    createFirstPageView() {
        this.validate();
        if (this.itemList.length > 0) {
            // var num = 0;
            if (this.scrollView.vertical) {
                this.initNum = Math.floor(this.node.height / this.itemList[0].height);
            } else {
                this.initNum = Math.floor(this.node.width / this.itemList[0].width);
            }
            for (let i = 0; i < this.initNum; i++) {
                this.validate();
            }
            console.log('init num: ' + this.initNum);
        }
    },

    /**
     * 设置列表item数量
     * @param {Number} count 
     */
    setTotalNum(count) {
        this.itemDataCount = count;

        if (this.arrangeDirection == ArrangeDirection.LEFT_TO_RIGHT || this.arrangeDirection == ArrangeDirection.UP_TO_DOWN) {
            this.firstIndex = 0;
        } else if (this.arrangeDirection == ArrangeDirection.RIGHT_TO_LEFT || this.arrangeDirection == ArrangeDirection.DOWN_TO_UP) {
            this.firstIndex = count - 1;
        }
        if (this.firstIndex < 0) this.firstIndex = 0;
    },

    /**
     * 重置scrollview, 更新列表item
     */
    resetView() {
        if (this.itemDataCount < 0) return;

        for (let i = 0; i < this.itemList.length; i++) {
            this.itemList[i].destroy();
        }
        this.itemList = [];
        this.itemLoop.clear();

        this.content.width = 0;
        this.content.height = 0;

        this.editItemInFront = false;
        this.isScrolling = false;

        this.sollValidate = false;
        // this.scrollView.enabled = true;
        // this.blockInputPanel.active = false;

        // this.scrollView.stopAutoScroll();
        if (this.autoLayout) {
            // this.createAutoLayoutFirstPageView();
        } else {
            // this.createFirstPageView();
        }
        // this.validate();
        // this.scrollView.scrollToTop(0);
        this.initialize();
    },

    /**
     * 调整content的大小
     * @param {Node} newItem 
     * @param {Number} ior - 表示增加或减少 值为: -1, 1
     */
    resizeContent(newItem, ior) {
        // 前端增减不调整content大小
        if (this.editItemInFront) return;

        if (ior == 1) {
            this.curItemNum++;
        } else {
            this.curItemNum--;
        }

        let offset = 0;
        if (this.scrollView.vertical) {
            offset = newItem.height + this.gapDis;
            this.content.height = offset * this.itemDataCount;
            this.content.width = newItem.width;

            // 保证content最小高度, 使它能拉动
            if (this.itemDataCount <= this.initNum && this.content.height < this.node.height) {
                this.content.height = this.node.height;
            }

            /*             offset = newItem.height + this.gapDis;
                        this.content.height += ior * offset;
                        this.content.width = newItem.width;
            
                        // 保证content高度不大于item总高度
                        if (this.content.height > offset * this.curItemNum) {
                            this.content.height = offset * this.curItemNum;
                        }
            
                        // 保证content最小高度, 使它能拉动
                        if (this.itemDataCount <= this.initNum && this.content.height < this.node.height) {
                            this.content.height = this.node.height;
                        } */
        } else {
            offset = newItem.width + this.gapDis;
            this.content.width = offset * this.itemDataCount;
            this.content.height = newItem.height;

            // 保证content最小宽度, 使它能拉动
            if (this.itemDataCount <= this.initNum && this.content.width < this.node.width) {
                this.content.width = this.node.width;
            }

            /*             offset = newItem.width + this.gapDis;
                        this.content.width += ior * offset;
                        this.content.height = newItem.height;
            
                        // 保证content宽度不大于item总宽度
                        if (this.content.width > offset * this.curItemNum) {
                            this.content.width = offset * this.curItemNum;
                        }
            
                        // 保证content最小宽度, 使它能拉动
                        if (this.itemDataCount <= this.initNum && this.content.width < this.node.width) {
                            this.content.width = this.node.width;
                        } */
        }
    },

    /**
     * 调整item的位置, 在手动添加或删除item后调用
     * @param {Number} index - 需要调整的item的起始位置
     * @param {Number} fob - 往前或者往后移动, 值为: -1, 1
     */
    resetItemsPosition(index, fob, func) {
        let toMoveList = this.itemList.slice(index);
        if (toMoveList.length <= 0) {
            // this.inAnimation(false);
            if (!!func) {
                func(index);
            } else {
                this.inAnimation(false);
            }
            return;
        }

        let callback = cc.callFunc(function () {
            // this.inAnimation(false);
            if (!!func) {
                func(index);
            } else {
                this.inAnimation(false);
            }
        }, this);

        if (this.scrollView.vertical) {
            let offset = this.itemList[0].height + this.gapDis;
            DoTweenManager.moveListUp(toMoveList, 0.3, fob * offset, callback);
        } else {
            let offset = this.itemList[0].width + this.gapDis;
            DoTweenManager.moveListLeft(toMoveList, 0.3, -fob * offset, callback);
        }
    },

    /**
     * 移除item用, item列表和itemDataCount需要被更新
     * @param {Number} index 
     */
    removeItem(index) {
        this.editItemInFront = false;

        this.inAnimation(true);

        let pos = this.findItem(index);
        let item = this.itemList.splice(pos, 1);

        this.firstItem = this.itemList[0];
        this.lastItem = this.itemList[this.itemList.length - 1];

        // 更新item的dataIndex
        for (let i = pos; i < this.itemList.length; i++) {
            let item = this.itemList[i];
            item.dataIndex -= 1;
        }

        // 在最后面补上一个item
        if (!!this.lastItem && this.firstItem != this.lastItem && this.lastItem.dataIndex < this.itemDataCount - 1) {
            // cc.log('new item add to back when remove');
            // cc.log('last index: ' + this.lastItem.dataIndex);
            // cc.log('data count: ' + this.itemDataCount);
            let newItem = this.getItemFromLoop();
            this.addToBack(this.lastItem, newItem);
            this.lastItem = newItem;
            this.itemList.push(newItem);
        }

        // 播放删除动画
        if (this.removeAnimation == 0) {
            this.putItemToLoop(item[0]);
            this.resetItemsPosition(pos, 1);
        } else {
            let callback = cc.callFunc(function (item) {
                this.putItemToLoop(item);
                this.resetItemsPosition(pos, 1);
            }, this, item[0]);
            DoTweenManager.playScrollAnimation(this.removeAnimation, item[0], 0.4, callback);
        }

        // this.putItemToLoop(item[0]);
        // this.resetItemsPosition(pos, 1);
    },

    /**
     * 插入新的item到指定位置, 最好添加到首尾
     * @param {Number} index 
     */
    insertItem(index) {
        let pos = this.findItem(index);
        cc.log('insert to pos: ' + pos);
        if (pos == -1) return;

        this.editItemInFront = false;
        // this.inAnimation(true);
        this.inserting = true;

        this.resetItemsPosition(pos, -1, this.doInsertAnimation);
    },

    /**
     * 插入item时播放动画 -- 暂时只有这个方法用到self
     * @param {Number} index 
     */
    doInsertAnimation(index) {
        // 更新item的dataIndex
        for (let i = index; i < self.itemList.length; i++) {
            let item = self.itemList[i];
            item.dataIndex += 1;
        }

        let newItem = self.getItemFromLoop();
        self.itemList.splice(index, 0, newItem);

        // 设置位置
        if (self.itemList.length == 1) {
            self.initItem(newItem, self.firstIndex);
            let pos = self.startPos.add(cc.v2(self.deltaPos.x * newItem.width, self.deltaPos.y * newItem.height));
            newItem.setPosition(pos);
        } else {
            let preIndex = index - 1;
            if (preIndex < 0) {
                self.addToFront(self.itemList[index + 1], newItem);
            } else {
                self.addToBack(self.itemList[preIndex], newItem);
            }
        }

        // self.moveToEnd();

        self.refreshViewItem();

        self.firstItem = self.itemList[0];
        self.lastItem = self.itemList[self.itemList.length - 1];

        // 播放插入动画
        if (self.insertAnimation == null) {
            self.inserting = false;
            // self.inAnimation(false);
        } else {
            let callback = cc.callFunc(function () {
                self.inserting = false;
                // self.inAnimation(false);
            }, self);
            DoTweenManager.playScrollAnimation(self.insertAnimation, newItem, 0.4, callback);
        }
    },

    /**
     * 设置播放动画时一些flag
     * @param {Boolean} bool - true or false 
     */
    inAnimation(bool) {
        this.scrollView.enabled = !bool;
        this.sollValidate = bool;
        this.blockInputPanel.active = bool;
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

        time = !!!time ? 0.5 : time;
        this.isScrolling = true;

        let item = this.itemList[0];
        if (this.scrollView.vertical) {
            this.scrollView.scrollToOffset(cc.v2(0, item.height * index), time);
        } else {
            this.scrollView.scrollToOffset(cc.v2(item.width * index, 0), time);
        }
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
     * 自动暂时删除item, 只被validate调用
     * @param {Number} index item的序号
     */
    deleteItem(index) {
        let item = this.itemList.splice(index, 1);

        this.putItemToLoop(item[0]);

        this.firstItem = this.itemList[0];
        this.lastItem = this.itemList[this.itemList.length - 1];
    },

    /**
     * 查找item在当前itemList的位置
     * @param {Number} index - 要寻找的item的序号
     * @returns {Number}
     */
    findItem(index) {
        for (let i = 0; i < this.itemList.length; i++) {
            let item = this.itemList[i];
            if (item.dataIndex == index) {
                return i;
            }
        }

        if (index == this.itemList.length) {
            return index;
        }

        return -1;
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

    /**
     * 从对象池获取item
     */
    getItemFromLoop() {
        let item = this.itemLoop.get();
        if (item == null) {
            item = this.createItem();
            console.log('new item be instaniated .....');
        }

        this.content.addChild(item);
        // item.setPosition(cc.Vec2.ZERO);

        // 调整content的size
        this.resizeContent(item, 1);

        return item;
    },

    /**
     * 将要移除的item放入对象池中,
     * 对象池中对象不超过3个
     * @param {Node} item 
     */
    putItemToLoop(item) {
        // 调整content的size
        this.resizeContent(item, -1);

        if (this.itemLoop.size >= 3) {
            console.log('item will be destoryed, index: ' + item.dataIndex);
            item.destroy();
            return;
        }
        item.dataIndex = -1;
        this.itemLoop.put(item);
    },

    /**
     * 判断item是否可见
     * @param {Node} item 
     */
    isVisible(item) {
        if (item.x + this.content.x + item.width / 2 < -this.node.width / 2 ||
            item.x + this.content.x - item.width / 2 > this.node.width / 2 ||
            item.y + this.content.y + item.height / 2 < -this.node.height / 2 ||
            item.y + this.content.y - item.height / 2 > this.node.height / 2) {

            return false;
        } else {
            return true;
        }
    },

    /**
     * 判断指定数量的item是否不可见
     * @param {Number} index 判断的起始位置
     * @param {Number} count 需要判断的数量
     * @param {Number} dir 判断的方向, 值为: -1, 1
     */
    isItemsUnVisible(index, count, dir) {
        if (this.itemList.length < count) return false;
        for (let i = 0; i < count; i++) {
            let item = this.itemList[index + dir * i];
            if (this.isVisible(item)) {
                return false;
            }
        }
        return true;
    },

    /**
     * 检查items两端是否需要增删
     */
    validate() {
        if (this.inserting == true) return;
        if (this.itemDataCount <= 0 || this.autoLayout) return;

        // console.log('content pos:', this.content.y);
        // console.log('item list length: ', this.itemList.length);

        // if (this.lastItem && this.lastItem.dataIndex == this.itemDataCount - 1) {
        //     if (this.lastItem.y + this.content.y - this.node.height / 2 > 0) {
        //         console.log('last item soll back >>>');
        //         this.scrollView.scrollToBottom(0.3);
        //     }
        // }

        // 添加第一个item
        if (this.itemList.length == 0) {
            let item = this.getItemFromLoop();
            this.initItem(item, this.firstIndex);

            // 设置位置
            let pos = this.startPos.add(cc.v2(this.deltaPos.x * item.width, this.deltaPos.y * item.height));
            // cc.log('item true start pos: ' + pos);
            // cc.log('content validate pos: ' + this.content.getPosition());
            item.setPosition(pos);

            this.firstItem = item;
            this.lastItem = item;
            this.itemList.push(item);
        }

        // this.sollValidate = false;

        // 判断前端是否要增减
        if (this.isVisible(this.firstItem)) {
            if (this.firstItem.dataIndex > 0) {
                // 添加新的item
                this.editItemInFront = true;

                let item = this.getItemFromLoop();
                this.addToFront(this.firstItem, item);
                this.firstItem = item;
                this.itemList.unshift(item);
                console.log('new item add to front, index: ' + item.dataIndex);
            }
        } else {
            let delta = this.firstItem.y + this.content.y + this.firstItem.height / 2 + this.node.height / 2;
            if (delta < 0) {
                console.log('first item unvisible and unter the viewport:', delta);
                let num = Math.floor((this.node.height - delta) / this.lastItem.height);

                for (let i = 0; i < num; i++) {
                    if (this.firstItem.dataIndex > 0) {
                        // 添加新的item
                        this.editItemInFront = true;

                        let item = this.getItemFromLoop();
                        this.addToFront(this.firstItem, item);
                        this.firstItem = item;
                        this.itemList.unshift(item);
                        console.log('new item add to front in unvisible, index: ' + item.dataIndex);
                    }
                }
                return;
            }

            // this.sollValidate = false;
            // 判断是否要移除
            if (this.isItemsUnVisible(0, this.removeMinLimit, 1)) {
                this.editItemInFront = true;
                console.log('first item be deleted, index: ' + this.firstItem.dataIndex);
                this.deleteItem(0);
                // this.firstItem = this.itemList[0];
            }
        }

        // 判断后端是否要增减
        // var preLastIndex = this.itemList.length - 2
        // preLastIndex = preLastIndex < 0 ? 0 : preLastIndex;
        // var preLastItem = this.itemList[preLastIndex];

        if (this.isVisible(this.lastItem)) {
            // if (this.isVisible(preLastItem)) {
            if (this.lastItem.dataIndex < this.itemDataCount - 1) {
                // 添加新的item
                this.editItemInFront = false;

                let item = this.getItemFromLoop();
                this.addToBack(this.lastItem, item);
                this.lastItem = item;
                this.itemList.push(item);
                console.log('new item add to back, index: ' + item.dataIndex);
            }
        } else {
            let delta = this.lastItem.y + this.content.y - this.lastItem.height / 2 - this.node.height / 2;
            if (delta > 0) {
                console.log('last item unvisible and over the viewport:', delta);
                let num = Math.floor((this.node.height + delta) / this.lastItem.height);

                for (let i = 0; i < num; i++) {
                    if (this.lastItem.dataIndex < this.itemDataCount - 1) {
                        // 添加新的item
                        this.editItemInFront = false;

                        let item = this.getItemFromLoop();
                        this.addToBack(this.lastItem, item);
                        this.lastItem = item;
                        this.itemList.push(item);
                        console.log('new item add to back in unvisible, index: ' + item.dataIndex);
                    }
                }
                return;
            }

            // this.sollValidate = false;
            // 判断是否要移除
            if (this.isItemsUnVisible(this.itemList.length - 1, this.removeMinLimit, -1)) {
                this.editItemInFront = false;
                console.log('last item be deleted, index: ' + this.lastItem.dataIndex);
                this.deleteItem(this.itemList.length - 1);
                // this.lastItem = this.itemList[this.itemList.length - 1];
            }
        }

        // this.sollValidate = false;
    },

    /**
     * 添加新item到item列表的前端
     * @param {Node} priorItem - 当前第一个item
     * @param {Node} newItem - 新的item
     */
    addToFront(priorItem, newItem) {
        // cc.log('item will be add to front, index: ' + newItem.dataIndex);
        this.initItem(newItem, priorItem.dataIndex - 1);
        // 计算新item的位置, 要求item的Anchor在中心
        if (this.scrollView.vertical) {
            let offsetY = priorItem.height / 2 + this.gapDis + newItem.height / 2;
            newItem.x = priorItem.x;
            newItem.y = priorItem.y + offsetY;
        } else {
            let offsetX = priorItem.width / 2 + this.gapDis + newItem.width / 2;
            newItem.x = priorItem.x - offsetX;
            newItem.y = priorItem.y;
        }
    },

    /**
     * 添加新item到item列表的末尾
     * @param {Node} backItem - 当前最后一个item
     * @param {Node} newItem - 新的item
     */
    addToBack(backItem, newItem) {
        this.initItem(newItem, backItem.dataIndex + 1);
        // 计算新item的位置, 要求item的Anchor在中心
        if (this.scrollView.vertical) {
            let offsetY = backItem.height / 2 + this.gapDis + newItem.height / 2;
            newItem.x = backItem.x;
            newItem.y = backItem.y - offsetY;
        } else {
            let offsetX = backItem.width / 2 + this.gapDis + newItem.width / 2;
            newItem.x = backItem.x + offsetX;
            newItem.y = backItem.y;
        }

        console.log('new item pos:', newItem.getPosition());
    },

    /**
     * scrollview开始滚动时调用
     */
    scrollBegan() {
        this.isScrolling = true;
    },

    /**
     * scrollview停止滚动时调用
     */
    scrollEnd() {
        this.isScrolling = false;
    },

    update(dt) {
        // scrollview滚动时或播放动画时调用
        // if (this.isScrolling || this.sollValidate) {
        //     this.validate();
        // }

        // this.validate();

        // if (this.autoLayout) {
        //     for (let i = 0; i < 5; i++) {
        //         if (this.itemList.length < this.itemDataCount) {
        //             this.createItemAuto();
        //         }
        //     }
        // } else {
        //     this.validate();
        // }

        // if (this.scrollView.isScrolling() || this.scrollView.isAutoScrolling() || this.sollValidate) {
        //     if (this.autoLayout) {
        //         for (let i = 0; i < 5; i++) {
        //             if (this.itemList.length < this.itemDataCount) {
        //                 this.createItemAuto();
        //             }
        //         }
        //     } else {
        //         this.validate();
        //     }
        // }

        this.updateTimer += dt;
        if (this.updateTimer < this.updateInterval) return;
        this.updateTimer = 0;

        this.newValidate();
    },

    initialize() {
        console.log('scroll view be initialized >>>');

        this.updateTimer = 0;
        this.updateInterval = 0.2;
        this.lastContentPosY = 0;
        this.bufferZone = 600;

        // this.content.width = 640;
        // this.content.height = 9700;

        let initNum = this.itemDataCount > 15 ? 15 : this.itemDataCount;

        for (let i = 0; i < initNum; i++) {
            let item = this.createItem();
            this.content.addChild(item);
            if (this.scrollView.vertical) {
                item.setPosition(0, -item.height * (0.5 + i) - this.gapDis * (i + 1));
            } else {
                item.setPosition(item.width * (0.5 + i) + this.gapDis * (i + 1), 0);
            }
            this.initItem(item, i);
            this.itemList.push(item);
        }

        if (this.itemList.length <= 0) return;
        if (this.scrollView.vertical) {
            let offset = this.itemList[0].height + this.gapDis;
            this.content.width = this.itemList[0].width;
            this.content.height = this.itemDataCount * offset + this.gapDis;

            console.log('initialize finish, content size:', this.content.height);
            console.log('initialize finish, itemlist length:', this.itemList.length);
        } else {
            let offset = this.itemList[0].width + this.gapDis;
            this.content.height = this.itemList[0].height;
            this.content.width = this.itemDataCount * offset + this.gapDis;

            console.log('initialize finish, content size:', this.content.width);
            console.log('initialize finish, itemlist length:', this.itemList.length);
        }
    },

    getPositionInView(item) {
        let worldPos = item.parent.convertToWorldSpaceAR(item.position);
        let viewPos = this.scrollView.node.convertToNodeSpaceAR(worldPos);
        return viewPos;
    },

    newValidate() {
        if (this.itemList.length <= 0) return;

        let buffer = this.bufferZone;
        if (this.scrollView.vertical) {
            let isDown = this.content.y < this.lastContentPosY;
            let offset = (this.itemList[0].height + this.gapDis) * this.itemList.length;
            for (let i = 0; i < this.itemList.length; ++i) {
                let item = this.itemList[i];
                let viewPos = this.getPositionInView(item);
                if (isDown) {
                    if (viewPos.y < -buffer && item.y + offset < 0) {
                        item.setPosition(item.x, item.y + offset);
                        this.initItem(item, item.dataIndex - this.itemList.length);
                        console.log('update item when down, index:', item.dataIndex);
                    }
                } else {
                    if (viewPos.y > buffer && item.y - offset > -this.content.height) {
                        item.setPosition(item.x, item.y - offset);
                        this.initItem(item, item.dataIndex + this.itemList.length);
                        console.log('update item when up, index:', item.dataIndex);
                    }
                }
            }

            this.lastContentPosY = this.content.y;
        } else {
            let isLeft = this.content.x > this.lastContentPosY;
            let offset = (this.itemList[0].width + this.gapDis) * this.itemList.length;
            for (let i = 0; i < this.itemList.length; ++i) {
                let item = this.itemList[i];
                let viewPos = this.getPositionInView(item);
                if (isLeft) {
                    if (viewPos.x > buffer && item.x - offset > 0) {
                        item.setPosition(item.x - offset, item.y);
                        this.initItem(item, item.dataIndex - this.itemList.length);
                        console.log('update item when left, index:', item.dataIndex);
                    }
                } else {
                    if (viewPos.x < -buffer && item.x + offset < this.content.width) {
                        item.setPosition(item.x + offset, item.y);
                        this.initItem(item, item.dataIndex + this.itemList.length);
                        console.log('update item when right, index:', item.dataIndex);
                    }
                }
            }

            this.lastContentPosY = this.content.x;
        }
    }
});
