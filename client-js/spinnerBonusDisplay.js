export class SpinnerBonusDisplay {
    constructor(game) {
        this.game = game;

        this.maxScale = 2;

        this.fontRenderer = new this.game.SPRITEFONTRENDERER(
            "1000",
            this.game.skinResourceManager.scoreFontSet,
            -1,
            this.game.canvas.width * 0.5,
            this.game.canvas.height * 0.7,
            2,
            1,
            0.5,
            0.25
        );

        this.animation = new this.game.ANI();
    }

    bonus(count = 0) {
        this.fontRenderer.updateText(String(`${count}000`));
        this.animation = new this.game.ANI(
            this.game.clock,
            this.game.clock + 800,
            2,
            1.25,
            this.game.EASINGS.SineOut
        );
        
        this.game.auMgr.playAudioClip("spinnerbonus");
    }

    update() {

        this.animation.update(this.game.clock);

        this.fontRenderer.x = this.game.canvas.width * 0.5;
        this.fontRenderer.y = this.game.canvas.height * 0.7;
        this.fontRenderer.scale = this.animation.currentValue;
        this.fontRenderer.opacity = 1 - this.animation.amount;
    }

    render() {
        if (this.animation.amount === 1) return; 
        this.fontRenderer.render(this.game.ctx);
    }
}