export class Linear {
    /**
     * 
     * @param {[Point]} curvePoints 
     */
    constructor(curvePoints) {
        this.path = curvePoints;
    }

    getPath() {
        return this.path;
    }
}