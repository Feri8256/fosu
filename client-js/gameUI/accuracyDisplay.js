export class AccuracyDisplay {
    constructor(game) {
        this.game = game;

        let initialValue = "100.00%",
            fontSet = this.game.skinResourceManager.scoreFontSet,
            defaultSpacing = -1,
            positionX = this.game.canvas.width * 0.5,
            positionY = 8,
            scaling = 0.75 * window.devicePixelRatio,
            opacity = 1,
            originX = 0.5,
            originY = 0;

        this.fontRenderer = new this.game.SPRITEFONTRENDERER(initialValue, fontSet, defaultSpacing, positionX, positionY, scaling, opacity, originX, originY);

        this.game.events.on("GameUI:AccuracyUpdate", (value) => {
            this.fontRenderer.updateText(`${value}%`);
        });
    }

    update() {
        this.fontRenderer.x = this.game.canvas.width * 0.5;
    }

    render() {
        this.fontRenderer.render(this.game.ctx);
    }
}