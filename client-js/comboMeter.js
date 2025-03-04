export class ComboMeter {
    constructor(game) {
        this.game = game;
        this.currentCombo = 0;
        this.previousCombo = 0;
        this.maxCombo = 0;

        this.change = false;

        this.fontRenderer = new this.game.SPRITEFONTRENDERER(
            "0x",
            this.game.skinResourceManager.scoreFontSet,
            0,
            8,
            this.game.canvas.height - 8,
            1.5,
            1,
            0,
            1
        );

        this.fontRendererBack = new this.game.SPRITEFONTRENDERER(
            "0x",
            this.game.skinResourceManager.scoreFontSet,
            0,
            8,
            this.game.canvas.height - 8,
            2,
            0.4,
            0,
            1
        );

        this.tl = new this.game.TL();
        this.tl.appendAnimation(
            new this.game.ANI(
                0,
                250,
                2.5,
                1.5,
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
                1.5,
                1.85,
                this.game.EASINGS.SineIn,
                false,
                "S"
            )
        );
        this.tl.appendAnimation(
            new this.game.ANI(
                120,
                220,
                1.85,
                1.5,
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
        this.fontRenderer.scale = this.tl.getValueOf("S") ?? 1.5;
        this.fontRendererBack.scale = this.tl.getValueOf("SA") ?? 1.5;
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