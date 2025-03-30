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

    getDistance: (ax, ay, bx, by) => {
        let distX = Math.abs(ax - bx);
        let distY = Math.abs(ay - by);
        let dist = Math.sqrt((distX * distX) + (distY * distY));
        return dist;
    }
}

export { utils }