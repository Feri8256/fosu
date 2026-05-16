export class ComboMeter {
    constructor(game) {
        this.game = game;
        this.currentCombo = 0;
        this.previousCombo = 0;
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
            if (this.currentCombo >= 20) this.game.auMgr.playAudioClip("combobreak");
            this.currentCombo = 0;
        }

        this.game.events.emit("GameUI:ComboUpdate", this.currentCombo);

        this.previousCombo = this.currentCombo;
    }

    reset() {
        this.currentCombo = 0;
        this.maxCombo = 0;
        this.game.events.emit("GameUI:ComboUpdate", 0);
    }

    getResults() {
        return {
            max: this.maxCombo,
            finished: this.currentCombo
        }
    }
}