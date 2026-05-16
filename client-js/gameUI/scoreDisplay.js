
export class ScoreDisplay {
    constructor(game) {
        this.game = game;
        this.currentScore = 0;
        this.displayedValue = 0;

        let initialValue = "0",
            fontSet = this.game.skinResourceManager.scoreFontSet,
            defaultSpacing = 32,
            positionX = this.game.canvas.width,
            positionY = this.game.canvas.height - 8,
            scaling = 1 * window.devicePixelRatio,
            opacity = 1,
            originX = 1,
            originY = 1;

        this.scoreNumberRenderer = new this.game.SPRITEFONTRENDERER(initialValue, fontSet, defaultSpacing, positionX, positionY, scaling, opacity, originX, originY);

        this.scoreRolling = new this.game.ANI();

        this.game.events.on("GameUI:ScoreUpdate", this.updateValue.bind(this));
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

    /**
     * 
     * @param {Number} pointValue
     */
    updateValue(value) {
        let previousScoreValue = this.currentScore;
        this.currentScore = value;

        this.scoreRolling = new this.game.ANI(
            this.game.clock,
            this.game.clock + 400,
            previousScoreValue,
            value,
            this.game.EASINGS.SineOut
        );

    }

    reset() {
        this.currentScore = 0;
        this.scoreNumberRenderer.updateText("0");
        this.scoreRolling = new this.game.ANI();
    }
}