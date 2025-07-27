export class Spinner {
    constructor(game, scale, startTime, endTime, od) {
        this.game = game;
        this.scale = scale;
        this.circle = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("spinner-circle"));
        this.approach = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("spinner-approachcircle"));

        this.startTime = startTime;
        this.endTime = endTime;
        this.od = od;
        this.duration = this.endTime - this.startTime;

        this.autoplayRotateRadius = 80;
        this.autoplayRotateSpeed = 0.45;

        this.ended = false;

        this.judge = new this.game.SPINNERJUDGE(this, this.od, this.duration);

        this.currentAngle = 0;
        this.previousAngle = 0;
        this.angleCheck = 0;

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

        if (this.game.autoplay.activated) {
            this.game.autoplay.add(this.startTime, this.game.canvas.width * 0.5, this.game.canvas.height * 0.5);
            this.game.autoplay.add(this.endTime, this.game.canvas.width * 0.5, this.game.canvas.height * 0.5);
        }
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

        let angleDelta = 0;

        if (this.game.inputValidator.isAnyInputDown() &&
            currentTime >= this.startTime &&
            currentTime <= this.endTime &&
            this.tl.playing
        ) {
            this.currentAngle = this.game.utils.getLineAngle(this.circle.x, this.circle.y, this.game.cursor.currentX, this.game.cursor.currentY);
            this.circle.rotation = this.currentAngle;
        }

        if (this.game.autoplay.activated && currentTime >= this.startTime) {
            this.currentAngle += this.autoplayRotateSpeed;
            this.game.cursor.setPosition(
                this.circle.x + Math.cos(this.currentAngle) * this.autoplayRotateRadius,
                this.circle.y + Math.sin(this.currentAngle) * this.autoplayRotateRadius
            );
            this.circle.rotation = this.currentAngle;
        }

        angleDelta = this.currentAngle - this.previousAngle;

        if (angleDelta > Math.PI) angleDelta -= Math.PI * 2;
        if (angleDelta < -Math.PI) angleDelta += Math.PI * 2;

        // The spinner may count normally even if the player not making full rotations because of this...
        this.angleCheck += this.game.utils.clamp(Math.abs(angleDelta), 0, 1);

        if (this.angleCheck > Math.PI * 2) {
            this.judge.onFullRotation();
            this.angleCheck = 0;
        }

        this.previousAngle = this.currentAngle;

        if (!this.ended && currentTime > this.endTime) {
            this.ended = true;
            this.judge.onEnd();
        }
    }

    render() {
        this.circle.render(this.game.ctx);
        this.approach.render(this.game.ctx);
    }
}