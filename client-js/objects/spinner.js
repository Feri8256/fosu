import { HitObject } from "./hitObject.js";
import { SpinnerJudge } from "../spinnerJudge.js";

export class Spinner extends HitObject {
    constructor(game, position, time, scaling, hitSample, hitSound, endTime, od) {
        super(game, position, time, scaling, 1, hitSample, hitSound);

        this.scaling = scaling;
        this.endTime = endTime;
        let duration = endTime - time;

        this.judge = new SpinnerJudge(this, od, duration);

        this.circle = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("spinner-circle"));
        this.approach = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("spinner-approachcircle"));
        this.cleared = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("spinner-clear"));

        this.circle.scale = (384 / (this.circle.spriteImage.h ?? 666)) * this.scaling;
        this.approach.scale = (384 / (this.approach.spriteImage.h ?? 333)) * this.scaling;

        this.fadingAni = new this.game.ANI(this.time - 200, this.time, 0, 1);
        this.approachAni = new this.game.ANI(this.time, this.endTime, this.approach.scale, 0.1);

        this.ended = false;

        this.currentAngle = 0;
        this.previousAngle = 0;
        this.angleCheck = 0;

        this.autoplayRotateRadius = 80;
        this.autoplayRotateSpeed = 0.85;
    }

    update(currentTime) {
        this.circle.x = this.approach.x = this.game.canvas.width * 0.5;
        this.circle.y = this.approach.y = this.game.canvas.height * 0.5;

        this.fadingAni.update(currentTime);
        this.approachAni.update(currentTime);

        this.circle.opacity = this.approach.opacity = this.fadingAni.currentValue;
        this.approach.scale = this.approachAni.currentValue;

        let angleDelta = 0;

        if ((this.game.inputValidator.isAnyInputDown() || this.game.autoplay.activated) &&
            currentTime >= this.time &&
            currentTime <= this.endTime &&
            !this.ended
        ) {
            if (this.game.autoplay.activated) {
                this.currentAngle += (this.autoplayRotateSpeed * (this.game.songDeltaTime / 16)) / this.game.deltaTime;
                this.game.cursor.setPosition(
                    this.circle.x + Math.cos(this.currentAngle) * this.autoplayRotateRadius,
                    this.circle.y + Math.sin(this.currentAngle) * this.autoplayRotateRadius
                );
                this.circle.rotation = this.currentAngle;
            } else {
                this.currentAngle = this.game.utils.getLineAngle(this.circle.x, this.circle.y, this.game.cursor.currentX, this.game.cursor.currentY);
                this.circle.rotation = this.currentAngle;
            }
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
            this.fadingAni = new this.game.ANI(currentTime, currentTime + 200, 1, 0);
        }


    }

    render() {
        this.circle.render(this.game.ctx);
        this.approach.render(this.game.ctx);
        this.cleared.render(this.game.ctx);
    }
}