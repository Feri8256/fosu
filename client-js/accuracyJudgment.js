export class AccuracyJudgment {
    /**
     * Visual feedback of the players hit accuracy
     * @param {*} game 
     * @param {Number} x x position value originating from the hit object
     * @param {Number} y y position value originating from the hit object
     * @param {Number} s scaling
     * @param {Number} type 0=hit0, 1=hit50, 2=hit100, 3=hit300, -1=not visible
     */
    constructor(game, x, y, s, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.s = s;
        this.type = type;
        this.markedForDeletion = false;

        this.duration = 750;

        this.sprite;

        if (this.type === -1) {
            return;
        }

        this.timeline = new this.game.TL();

        // Creating the animation for the timeline of the `hit0` judgment
        if (this.type === 0) {
            this.sprite = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("hit0"));
            this.timeline.appendAnimation(
                new this.game.ANI(this.game.clock, this.game.clock + 200, this.s * 1.25, this.s * 0.5, this.game.EASINGS.Linear, false, "S")
            );
            this.timeline.appendAnimation(
                new this.game.ANI(this.game.clock + 200, this.game.clock + this.duration, this.s * 0.5, this.s * 0.5, this.game.EASINGS.Linear, false, "S")
            );
            this.timeline.appendAnimation(
                new this.game.ANI(this.game.clock, this.game.clock + 200, 0, 1, this.game.EASINGS.Linear, false, "F")
            );
            this.timeline.appendAnimation(
                new this.game.ANI(this.game.clock + 200, this.game.clock + this.duration, 1, 0, this.game.EASINGS.Linear, false, "F")
            );
            this.timeline.appendAnimation(
                new this.game.ANI(this.game.clock + 200, this.game.clock + this.duration, this.y, this.y + 100, this.game.EASINGS.SineIn, false, "MY")
            );
            this.timeline.appendAnimation(
                new this.game.ANI(this.game.clock + 200, this.game.clock + this.duration, 0, (Math.random() * (Math.PI * 0.5)) - (Math.PI * 0.25), this.game.EASINGS.Linear, false, "R")
            );
        } else {
            // Animations of the rest of the judgments are identical
            this.timeline.appendAnimation(
                new this.game.ANI(this.game.clock + 300, this.game.clock + this.duration, 1, 0, this.game.EASINGS.Linear, false, "F")
            );
            this.timeline.appendAnimation(
                new this.game.ANI(this.game.clock, this.game.clock + 300, this.s * 0.5, this.s * 0.75, this.game.EASINGS.BounceOut, false, "S")
            );
            this.timeline.appendAnimation(
                new this.game.ANI(this.game.clock + 300, this.game.clock + this.duration, this.s * 0.75, this.s * 0.85, this.game.EASINGS.Linear, false, "S")
            );

            // Selecting the sprite based on type
            switch (this.type) {
                case 1:
                    this.sprite = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("hit50"));
                    break;
                case 2:
                    this.sprite = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("hit100"));
                    break;
                case 3:
                    this.sprite = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("hit300"));
                    break;
            }
        }

        this.timeline.play();
    }

    update() {
        if (this.type === -1) return;
        this.timeline.update(this.game.clock);

        // Update the properties of the sprite to the value of the animations. Don't forget the default values!
        this.sprite.opacity = this.timeline.getValueOf("F") ?? 1;
        this.sprite.rotation = this.timeline.getValueOf("R") ?? 0;
        this.sprite.scale = this.timeline.getValueOf("S") ?? 1;
        this.sprite.y = this.timeline.getValueOf("MY") ?? this.y;
        this.sprite.x = this.x;

        // When the timeline of the judgment is finished mark this to be deletable
        if (!this.timeline.playing) this.markedForDeletion = true;

    }

    render() {
        if (this.type === -1) return;
        this.sprite.render(this.game.ctx);
    }
}