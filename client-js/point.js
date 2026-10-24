export class Point {
    /**
     * The point of this to represent a point in 2D coordinate space
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Distance between this point and that point
     * @param {Point} point 
     * @returns {Number} distance
     */
    distance(point) {
        let distX = Math.abs(this.x - point.x);
        let distY = Math.abs(this.y - point.y);
        let dist = Math.sqrt((distX * distX) + (distY * distY));
        return dist;
    }

    /**
     * Angle to this point to that point
     * @param {Point} point 
     * @returns {Number} angle value in Radian
     */
    angle(point) {
        let diffX = this.x - point.x;
        let diffY = this.y - point.y;
        return - Math.atan2(diffX, diffY);
    }

    /**
     * Is the position of this point equal to that point?
     * @param {Point} point 
     * @returns {Boolean}
     */
    equal(point) {
        return (this.x === point.x) && (this.y === point.y);
    }
}
