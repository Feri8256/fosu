export class AccuracyMeter {
    constructor(game, od = 1) {
        this.game = game;
        this.od = od;

        // https://osu.ppy.sh/wiki/hu/Gameplay/Judgement/osu%21
        this.hitWindowValues = {
            GREAT: 80 - 6 * this.od,
            OK: 140 - 8 * this.od,
            MEH: 200 - 10 * this.od,
            MISS: 400
        };

        this.currentAcc = 100.0;
        this.correctHits = 0;
        this.totalHits = 0;

        this.results = [0, 0, 0, 0, 100];

        this.fontRenderer = new this.game.SPRITEFONTRENDERER(
            "100.00%",
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

        // 50 points (MEH)
        if (hitDeltaTime < this.hitWindowValues.MEH) {
            hitResult = 1;
        }
        
        // 100 point (OK)
        if (hitDeltaTime < this.hitWindowValues.OK) {
            hitResult = 2;
        }

        // 300 points (GREAT)
        if (hitDeltaTime < this.hitWindowValues.GREAT) {
            hitResult = 3;
        }
        if(!success) hitResult = 0;

        if (hitResult === 3) this.correctHits++;


        this.results[hitResult]++;

        this.currentAcc = this.fix(100 - (100 * (1 - (this.correctHits / this.totalHits))));
        this.results[4] = this.currentAcc;

        this.fontRenderer.updateText(`${this.currentAcc}%`);

        return hitResult;
    }

    render() {
        this.fontRenderer.render(this.game.ctx);
    }

    reset() {
        this.currentAcc = 100;
        this.correctHits = 0;
        this.totalHits = 0;
        this.results = [0, 0, 0, 0, 100];
        this.fontRenderer.updateText("100.00%");
    }

    getResults() {
        return this.results;
    }

    setOverallDifficulty(od = 1) {
        this.hitWindowValues = {
            GREAT: 80 - 6 * od,
            OK: 140 - 8 * od,
            MEH: 200 - 10 * od,
            MISS: 400
        };
    }

    fix(x) {
        return Number.parseFloat(x).toFixed(2);
    }
}