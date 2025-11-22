const utils = {
    convertRange: (value, inMin, inMax, outMin, outMax) => {
        let ratio = (value - inMin) / (inMax - inMin)
        return outMin + (outMax - outMin) * ratio;
    },

    clamp: (value, min, max) => {
        return Math.max(min, Math.min(value, max));
    },

    getLineAngle: (ax, ay, bx, by) => {
        let diffX = ax - bx;
        let diffY = ay - by;
        return - Math.atan2(diffX, diffY);
    },

    getLineAngleP: (point_A, point_B) => {
        let diffX = point_A.x - point_B.x;
        let diffY = point_A.y - point_B.y;
        return - Math.atan2(diffX, diffY);
    },

    getDistance: (ax, ay, bx, by) => {
        let distX = Math.abs(ax - bx);
        let distY = Math.abs(ay - by);
        let dist = Math.sqrt((distX * distX) + (distY * distY));
        return dist;
    },

    getDistanceP: (point_A, point_B) => {
        let distX = Math.abs(point_A.x - point_B.x);
        let distY = Math.abs(point_A.y - point_B.y);
        let dist = Math.sqrt((distX * distX) + (distY * distY));
        return dist;
    }
}

export { utils }