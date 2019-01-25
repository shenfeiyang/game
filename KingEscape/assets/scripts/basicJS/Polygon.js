
let Polygon = cc.Class({
    extends: cc.Component,

    properties: {

    },

    //设置多边形当前各顶点坐标
    init(x, y, points, rotation) {
        this.x = x;
        this.y = y;
        this._points = new Array();
        if (rotation == 0) {
            this._points = points;
        } else {
            let distance;
            let alpha;
            let px, py;
            for (let i = 0; i < points.length; i++) {
                px = points[i][0];
                py = points[i][1];
                distance = Math.sqrt(Math.pow(px, 2), Math.pow(py, 2));
                alpha = Math.atan2(py, px);
                alpha += rotation * Math.PI / 180;
                this._points.push(cc.v2(distance * Math.cos(alpha), distance * Math.sin(alpha)));
            }
        }
    },

    //多边形与圆碰撞检测(返回碰撞的边的向量)
    collidesWithBall(ballPos, ) {
        let closestPointIndex = this.getPointIndexClosestToTarge(ballPos.x, ballPos.y);
        if (closestPointIndex >= 0) {
            let axes = this.getAxes();
            axes.unshift(this.getAxis(ballPos, this._points[closestPointIndex]));

            for (let axis of axes) {
                projection1 = polygon1.project(axis)
                projection2 = polygon2.project(axis)

                // 判断投影轴上的投影是否存在重叠，若检测到存在间隙则立刻退出判断，消除不必要的运算。
                if (!(projection1.max > projection2.min && projection2.max > projection1.min))
                    return false
            }
        }
    },

    //得到多边形距离目标点最近顶点的序号
    getPointIndexClosestToTarge(targetX, targetY) {
        let min = 1000000000;
        let length;
        let dx;
        let dy;
        let closestPointIndex = -1;
        for (var i = 0; i < this._points.length; i++) {
            dx = this._points[i].x + this.x - targetX;
            dy = this._points[i].y + this.y - targetY;
            length = dx * dx + dy * dy;
            if (length < min) {
                min = length;
                closestPointIndex = i;
            }
        }
        return closestPointIndex;
    },

    //用于得到多边形所有投影轴的方法
    getAxes() {
        let axes = [];
        for (var i = 0; i < this._points.length - 1; i++) {
            axes.push(this.getAxis(this._points[i], this._points[i + 1]));
        };

        axes.push(this.getAxis(this._points[this._points.length - 1], this._points[0]));
        return axes;
    },

    //获得投影轴
    getAxis(pos1, pos2) {
        let v = pos1.sub(pos2);
        let v1 = cc.v2(v.y, 0 - v.x);
        let v2 = cc.v2(0, 0);
        let m = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        if (m !== 0) {
            v2 = cc.v2(v1.x / m, v1.y / m);
        }
        return v2;
    },

    // 根据多边形的每个定点，得到投影的最大和最小值，以表示投影。
    project(axis) {
        let scalars = [];

        this.points.forEach(function (point) {
            scalars.push(point.x * axis.x + point.y * axis.y);
        });
        let projection = {
            min: Math.min.apply(null, scalars),
            max: Math.max.apply(null, scalars)
        }
        return projection;
    }
});
