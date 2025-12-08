export class ComboMeter {
    constructor(game) {
        this.game = game;
        this.currentCombo = 0;
        this.previousCombo = 0;
        this.maxCombo = 0;

        this.defaultScaling = 1 * window.devicePixelRatio;

        this.change = false;

        let initialValue = "0x",
            fontSet = this.game.skinResourceManager.scoreFontSet,
            defaultSpacing = -1,
            positionX = 8,
            positionY = this.game.canvas.height - 8,
            scaling = this.defaultScaling,
            opacity = 1,
            originX = 0,
            originY = 1;

        this.fontRenderer = new this.game.SPRITEFONTRENDERER(initialValue, fontSet, defaultSpacing, positionX, positionY, scaling, opacity, originX, originY);
        this.fontRendererBack = new this.game.SPRITEFONTRENDERER(initialValue, fontSet, defaultSpacing, positionX, positionY, scaling, opacity, originX, originY);

        this.tl = new this.game.TL();
        this.tl.appendAnimation(
            new this.game.ANI(
                0,
                250,
                this.defaultScaling * 1.5,
                this.defaultScaling,
                this.game.EASINGS.Linear,
                false,
                "SA"
            )
        );

        this.tl.appendAnimation(
            new this.game.ANI(
                0,
                200,
                0.5,
                0,
                this.game.EASINGS.Linear,
                false,
                "FA"
            )
        );

        this.tl.appendAnimation(
            new this.game.ANI(
                70,
                120,
                this.defaultScaling,
                this.defaultScaling * 1.1,
                this.game.EASINGS.SineIn,
                false,
                "S"
            )
        );
        this.tl.appendAnimation(
            new this.game.ANI(
                120,
                220,
                this.defaultScaling * 1.1,
                this.defaultScaling,
                this.game.EASINGS.Linear,
                false,
                "S"
            )
        );
    }

    update() {
        this.fontRenderer.y = this.game.canvas.height - 8;
        this.fontRendererBack.y = this.game.canvas.height - 8;
        this.tl.update(this.game.clock);
        this.fontRenderer.scale = this.tl.getValueOf("S") ?? this.defaultScaling;
        this.fontRendererBack.scale = this.tl.getValueOf("SA") ?? this.defaultScaling;
        this.fontRendererBack.opacity = this.tl.getValueOf("FA") ?? 0;

        if (this.tl.timelineCurrentTime > 100 && this.change) {
            this.fontRenderer.updateText(`${this.currentCombo}x`);
            this.change = false;
        }
    }

    /**
     * 
     * @param {Boolean} success 
     */
    addHit(success) {
        this.change = true;
        if (success) {
            this.currentCombo++;
            if (this.currentCombo > this.maxCombo) this.maxCombo = this.currentCombo;
            this.fontRenderer.updateText(`${this.previousCombo}x`);
            this.fontRendererBack.updateText(`${this.currentCombo}x`);
            this.tl.play();
        } else {
            if (this.currentCombo > this.maxCombo) this.maxCombo = this.currentCombo;
            if (this.currentCombo >= 20) this.game.auMgr.playAudioClip("combobreak");
            this.fontRenderer.updateText(`0x`);
            this.fontRendererBack.updateText(`0x`);
            this.currentCombo = 0;
        }
        this.previousCombo = this.currentCombo;
    }

    render() {
        this.fontRendererBack.render(this.game.ctx);
        this.fontRenderer.render(this.game.ctx);
    }

    reset() {
        this.currentCombo = 0;
        this.maxCombo = 0;
        this.previousCombo = 0;
        this.change = false;
        this.fontRenderer.updateText("0x");
        this.fontRendererBack.updateText(`0x`);

    }

    getResults() {
        return {
            max: this.maxCombo,
            finished: this.currentCombo
        }
    }
}