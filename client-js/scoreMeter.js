const HIT_VALUE_ENUM = {
    CIRCLE_PERFECT: 3,
    CIRCLE_OKAY: 2,
    CIRCLE_MEH: 1,
    SLIDER_EDGE: 4,
    SLIDER_TICK: 5,
    SPINNER_REVOLUTION: 6,
    SPINNER_BONUS: 7
}

const HIT_VALUE_POINTS = {
    CIRCLE_PERFECT: 300,
    CIRCLE_OKAY: 100,
    CIRCLE_MEH: 50,
    SLIDER_EDGE: 30,
    SLIDER_TICK: 10,
    SPINNER_REVOLUTION: 100,
    SPINNER_BONUS: 1100
}

export class ScoreMeter {
    constructor(game) {
        this.game = game;
        this.currentScore = 0;
        this.displayedValue = 0;

        this.scoreNumberRenderer = new this.game.SPRITEFONTRENDERER(
            "0",
            this.game.skinResourceManager.scoreFontSet,
            16,
            this.game.canvas.width,
            this.game.canvas.height - 8,
            1.5,
            1,
            1,
            1
        );

        this.scoreRolling = new this.game.ANI();
    }

    update() {
        this.scoreRolling.update(this.game.clock);

        this.scoreNumberRenderer.x = this.game.canvas.width;
        this.scoreNumberRenderer.y = this.game.canvas.height - 8;

        this.displayedValue = Math.floor(this.scoreRolling.currentValue);
        this.scoreNumberRenderer.updateText(String(this.displayedValue));
    }

    render() {
        this.scoreNumberRenderer.render(this.game.ctx);
    }

    add(hit) {
        switch (hit) {
            case HIT_VALUE_ENUM.CIRCLE_PERFECT:
                this.calculate(HIT_VALUE_POINTS.CIRCLE_PERFECT, true);
                break;

            case HIT_VALUE_ENUM.CIRCLE_OKAY:
                this.calculate(HIT_VALUE_POINTS.CIRCLE_OKAY, true);
                break;

            case HIT_VALUE_ENUM.CIRCLE_MEH:
                this.calculate(HIT_VALUE_POINTS.CIRCLE_MEH, true);
                break;

            case HIT_VALUE_ENUM.SLIDER_EDGE:
                this.calculate(HIT_VALUE_POINTS.SLIDER_EDGE, false);
                break;

            case HIT_VALUE_ENUM.SLIDER_TICK:
                this.calculate(HIT_VALUE_POINTS.SLIDER_TICK, false);
                break;

            case HIT_VALUE_ENUM.SPINNER_REVOLUTION:
                this.calculate(HIT_VALUE_POINTS.SPINNER_REVOLUTION, false);
                break;

            case HIT_VALUE_ENUM.SPINNER_BONUS:
                this.calculate(HIT_VALUE_POINTS.SPINNER_BONUS, false);
                break;
        }
    }

    /**
     * 
     * @param {Number} pointValue
     * @param {Boolean} comboDependent 
     */
    calculate(pointValue, comboDependent) {
        // Score = Hit value * (1 + (Combo multiplier * Difficulty multiplier * Mod multiplier / 25))
        let previousScoreValue = this.currentScore;

        if (comboDependent) {
            this.currentScore += pointValue * (1 + (this.game.comboMeter.currentCombo * this.game.beatmapPlayer.difficultyMultiplier * 1 / 25));
        } else {
            this.currentScore += pointValue;
        }

        this.scoreRolling = new this.game.ANI(
            this.game.clock,
            this.game.clock + 300,
            previousScoreValue,
            this.currentScore,
            this.game.EASINGS.SineOut
        );

        //this.scoreNumberRenderer.updateText(String(this.currentScore));
    }

    reset() {
        this.currentScore = 0;
        this.scoreNumberRenderer.updateText("0");
    }
}