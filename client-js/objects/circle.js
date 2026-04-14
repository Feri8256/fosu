import { HitObject } from "./hitObject.js";

export class Circle extends HitObject {
    /**
     * 
     * @param {Game} game 
     * @param {Point} position 
     * @param {Number} time 
     * @param {Number} scaling 
     * @param {*} hitSample 
     * @param {*} hitSound 
     * @param {Number} timeWindow
     * @param {Number} comboNumber
     */
    constructor(game, position, time, scaling, circleSize, hitSample, hitSound, timeWindow, comboNumber) {
        super(game, position, time, scaling, circleSize, hitSample, hitSound);
        this.timeWindow = timeWindow;

        this.circleScale = this.scaling / (this.circleSize * 0.5);
        this.approachSize = this.circleScale * 3.5;

        this.hitEffectDurationMs = 200;

        this.rad = (118 / this.circleSize) * this.scaling;

        this.overlay = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("hitcircleoverlay"));
        this.overlay.x = this.position.x;
        this.overlay.y = this.position.y;
        this.overlay.scale = this.circleScale;

        this.hitCircle = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("hitcircle"));
        this.hitCircle.x = this.position.x;
        this.hitCircle.y = this.position.y;
        this.hitCircle.scale = this.circleScale;

        this.approachCircle = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("approachcircle"));
        this.approachCircle.x = this.position.x;
        this.approachCircle.y = this.position.y;
        this.approachCircle.scale = this.approachSize;


        this.ani = new this.game.ANI(
            this.time - this.timeWindow,
            this.time,
            this.approachSize,
            this.circleScale,
        );

        this.comboNumber = comboNumber;

        this.hitCheck = false;
        this.currentTime = 0;

        if (this.game.autoplay.activated) this.game.autoplay.add(this.time, this.position.x, this.position.y);
    }

    update(currentTime) {
        this.currentTime = currentTime;
        this.ani.update(currentTime);

        this.hitCircle.opacity = this.hitCheck ? 1 - this.ani.amount : this.ani.amount;
        this.hitCircle.scale = this.hitCheck ? this.ani.currentValue : this.circleScale;

        this.overlay.opacity = this.hitCircle.opacity;
        this.overlay.scale = this.hitCircle.scale;

        this.approachCircle.opacity = this.hitCheck ? 0 : this.ani.amount;
        this.approachCircle.scale = this.ani.currentValue;
    }

    render() {
        this.approachCircle.render(this.game.ctx);
        this.hitCircle.render(this.game.ctx);
        this.overlay.render(this.game.ctx);

        //this.game.ctx.fillText(String(this.comboNumber), this.position.x, this.position.y);
    }

    tap() {
        if (this.hitCheck) return;

        this.ani = new this.game.ANI(
            this.currentTime,
            this.currentTime + this.hitEffectDurationMs,
            this.circleScale,
            this.circleScale * 1.35,
            this.game.EASINGS.SineOut
        );
        this.hitCheck = true;

        this.playHitSound();
    }
}