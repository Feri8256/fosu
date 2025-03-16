export class Spinner {
    constructor(game, scale, startTime, endTime) {
        this.game = game;
        this.scale = scale;
        this.circle = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("spinner-circle"));
        this.approach = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("spinner-approachcircle"));

        this.startTime = startTime;
        this.endTime = endTime;
        this.duration = this.endTime - this.startTime;

        // Use heights to scale
        this.circle.scale = (384 / (this.circle.spriteImage.h ?? 666)) * this.scale;
        this.approach.scale = (384 / (this.approach.spriteImage.h ?? 333)) * this.scale;

        // The spinner timeline is offseted by -200 ms!
        this.tl = new this.game.TL();
        this.tl.appendAnimation(
            new this.game.ANI(
                0,
                200,
                0,
                1,
                this.game.EASINGS.Linear,
                false,
                "F"
            )
        );
        this.tl.appendAnimation(
            new this.game.ANI(
                200,
                this.duration + 200,
                1,
                1,
                this.game.EASINGS.Linear,
                false,
                "F"
            )
        );
        this.tl.appendAnimation(
            new this.game.ANI(
                this.duration + 200,
                this.duration + 400,
                1,
                0,
                this.game.EASINGS.Linear,
                false,
                "F"
            )
        );
        this.tl.appendAnimation(
            new this.game.ANI(
                0,
                200,
                this.approach.scale,
                this.approach.scale,
                this.game.EASINGS.Linear,
                false,
                "A"
            )
        );
        this.tl.appendAnimation(
            new this.game.ANI(
                200,
                this.duration + 200,
                this.approach.scale,
                0.1,
                this.game.EASINGS.Linear,
                false,
                "A"
            )
        );

        this.tl.appendAnimation(
            new this.game.ANI(
                this.duration + 200,
                this.duration + 400,
                0.1,
                0.1,
                this.game.EASINGS.Linear,
                false,
                "A"
            )
        );

    }

    calculateLineAngle(pointA, pointB) {
        let diffX = pointA.x - pointB.x;
        let diffY = pointA.y - pointB.y;
        return - Math.atan2(diffX, diffY);
    }

    update(currentTime) {
        this.tl.update(currentTime);

        // The spinner timeline is offseted by -200 ms!
        if (currentTime >= this.startTime - 200 && currentTime <= this.endTime && !this.tl.playing) {
            this.tl.play();
        }

        this.circle.opacity = this.tl.getValueOf("F") ?? 0;
        this.approach.opacity = this.tl.getValueOf("F") ?? 0;
        this.approach.scale = this.tl.getValueOf("A") ?? 0.05;

        this.circle.x = this.game.canvas.width * 0.5;
        this.circle.y = this.game.canvas.height * 0.5;

        this.approach.x = this.game.canvas.width * 0.5;
        this.approach.y = this.game.canvas.height * 0.5;

        if (this.game.inputHandler.getMouse().down && currentTime >= this.startTime && currentTime <= this.endTime && this.tl.playing) {
            this.circle.rotation = this.calculateLineAngle({ x: this.circle.x, y: this.circle.y }, { x: this.game.cursor.currentX, y: this.game.cursor.currentY })
        }
    }

    render() {
        this.circle.render(this.game.ctx);
        this.approach.render(this.game.ctx);
    }
}