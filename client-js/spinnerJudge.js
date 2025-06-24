export class SpinnerJudge {
/**
 * 
 * @param {Spinner} spinner 
 * @param {Number} od 
 * @param {Number} duration 
 */
    constructor(spinner, od, duration) {
        this.s = spinner;
        this.od = od;
        this.duration = duration;

        this.currentSpins = 0;

        this.minSpins = 0;

        let minSpinPerSec = 0;

        this.cleared = false;
        this.bonusCount = 0;

        // https://osu.ppy.sh/wiki/hu/Gameplay/Judgement/osu%21
        if (od < 5) minSpinPerSec = 1.5 + 0.2 * od;
        if (od >= 5) minSpinPerSec = 1.25 + 0.25 * od;

        this.minSpins = (this.duration / 1000) * minSpinPerSec + 0.5;
    }

    onFullRotation() {
        this.currentSpins += 1;

        if (this.currentSpins > this.minSpins) {
            this.cleared = true;
            this.bonusCount += 1;

            this.s.game.scoreMeter.add(7);
            this.s.game.spinnerBonusDisplay.bonus(this.bonusCount);

        } else {
            this.s.game.scoreMeter.add(6);
        }
    }

    onEnd() {
        this.s.game.comboMeter.addHit(true);
        console.log("it spind");
    }

}