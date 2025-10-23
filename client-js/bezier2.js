class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

export class Bezier2 {
    constructor(points, pixelLength) {
        // https://github.com/itdelatrisu/opsu/blob/master/src/itdelatrisu/opsu/objects/curves/Bezier2.java
        if (points.length < 2) {
            throw 'invalid data';
        }

        this.points = points;

        this.path = [];
        var nCurve = pixelLength / 5 | 0;
        for (let i = 0; i <= nCurve; i++) {
            this.path.push(
                this.pointAt(i / nCurve)
            )
        }
    }

    pointAt(t) {
        var n = this.points.length - 1,
            point = new Point(0, 0),
            combination = 1;
        for (var i = 0; i <= n; i++) {
            var bernstein = combination * Math.pow(t, i) * Math.pow(1 - t, n - i);
            point.x += this.points[i].x * bernstein;
            point.y += this.points[i].y * bernstein;
            combination = combination * (n - i) / (i + 1);
        }
        return point;
    };
}
