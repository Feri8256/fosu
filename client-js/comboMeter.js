export class ComboMeter {
    constructor(game) {
        this.game = game;
        this.currentCombo = 0;
        this.maxCombo = 0;
    }

    update() {

    }

    /**
     * 
     * @param {Boolean} success 
     */
    addHit(success) {
        if (success) {
            this.currentCombo++;
            if (this.currentCombo > this.maxCombo) this.maxCombo = this.currentCombo;
        } else {
            if (this.currentCombo > this.maxCombo) this.maxCombo = this.currentCombo;
            if (this.currentCombo >= 20) this.game.auMgr.playAudioClip("combobreak");
            this.currentCombo = 0;
        }
    }

    render() {
        this.game.ctx.fillStyle = "#fff";
        this.game.ctx.font = "60px Arial";
        this.game.ctx.textAlign = "left";
        this.game.ctx.fillText(`x${this.currentCombo} || ${this.maxCombo}`, 0, this.game.canvas.height - 10);
    }

    reset() {
        this.currentCombo = 0;
        this.maxCombo = 0;
    }

    getResults() {
        return {
            max: this.maxCombo,
            finished: this.currentCombo
        }
    }
}