export class AccuracyMeter {
    constructor(game) {
        this.game = game;
        this.currentAcc = 100;
        this.correctHits = 0;
        this.totalHits = 0;

        this.results = [0,0,0,0,100];
    }

    update() {

    }

    /**
     * Update accuracy value and return the result
     * @param {Boolean} success 
     * @param {Number} hitDeltaTime difference between the hit objects timestamp and the timestamp of the hit 
     * @returns {Number} 0=hit0, 1=hit50, 2=hit100, 3=hit300
     */
    addHit(success, hitDeltaTime) {
        this.totalHits++;

        let hitResult = 0;
        // 300 points
        if (hitDeltaTime >= 0 && hitDeltaTime <= 100) {
            hitResult = 3;
        }

        // 100 point
        if (hitDeltaTime > 100 && hitDeltaTime <= 200) {
            hitResult = 2;
        }

        // 50 points
        if (hitDeltaTime > 200 && hitDeltaTime <= 300) {
            hitResult = 1;
        }

        if (hitResult === 3) this.correctHits++;

        this.results[hitResult]++;

        this.currentAcc = 100 - (100 * (1 - (this.correctHits / this.totalHits)));
        this.results[4] = this.currentAcc;

        return hitResult;
    }

    render() {
        this.game.ctx.fillStyle = "#fff";
        this.game.ctx.font = "40px Arial";
        this.game.ctx.textAlign = "center";
        this.game.ctx.fillText(`${String(this.currentAcc).slice(0,5)}%`, this.game.canvas.width * 0.5, 50);
    }

    reset() {
        this.currentAcc = 100;
        this.correctHits = 0;
        this.totalHits = 0;
        this.results = [0,0,0,0,100];
    }

    getResults() {
        return this.results;
    }
}