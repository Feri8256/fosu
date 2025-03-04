export class AccuracyMeter {
    constructor(game) {
        this.game = game;
        this.currentAcc = 100;
        this.correctHits = 0;
        this.totalHits = 0;

        this.results = [0,0,0,0,100];

        this.fontRenderer = new this.game.SPRITEFONTRENDERER(
            "100%",
            this.game.skinResourceManager.scoreFontSet, 
            0, 
            this.game.canvas.width * 0.5, 
            8, 
            1,
            1,
            0.5,
            0
        );
    }

    update() {
        this.fontRenderer.x = this.game.canvas.width * 0.5;
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

        this.fontRenderer.updateText(`${String(this.currentAcc).slice(0,5)}%`);

        return hitResult;
    }

    render() {
        this.fontRenderer.render(this.game.ctx);
    }

    reset() {
        this.currentAcc = 100;
        this.correctHits = 0;
        this.totalHits = 0;
        this.results = [0,0,0,0,100];
        this.fontRenderer.updateText("100%");
    }

    getResults() {
        return this.results;
    }
}