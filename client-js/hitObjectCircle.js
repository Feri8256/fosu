export class HitCircle {
    constructor(game, x, y, scale, t, cs, timeWindow, hitSample, hitSound) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.t = t;
        this.timeWindow = timeWindow;
        this.hitSample = hitSample;
        this.hitSound = hitSound;
        //this.circleSize = (scale / cs);
        this.circleSize = scale / (cs * 0.5);
        this.approachSize = this.circleSize * 4;

        this.hitEffectDurationMs = 200;

        this.rad = (118 / cs) * scale;

        this.overlay = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("hitcircleoverlay"));
        this.overlay.x = this.x;
        this.overlay.y = this.y;
        this.overlay.scale = this.circleSize;

        this.hitCircle = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("hitcircle"));
        this.hitCircle.x = this.x;
        this.hitCircle.y = this.y;
        this.hitCircle.scale = this.circleSize;

        this.approachCircle = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("approachcircle"));
        this.approachCircle.x = this.x;
        this.approachCircle.y = this.y;
        this.approachCircle.scale = this.approachSize;

        this.fading = new this.game.ANI(
            this.t - this.timeWindow,
            this.t,
            0,
            1,
            this.game.EASINGS.Linear
        );

        this.approaching = new this.game.ANI(
            this.t - this.timeWindow,
            this.t,
            this.approachSize,
            this.circleSize,
            this.game.EASINGS.Linear
        );

        this.hitExpand = new this.game.ANI(
            0,
            0,
            this.circleSize,
            this.circleSize,
            this.game.EASINGS.Linear
        );

        this.hittedAt = 0;
        this.hitCheck = false;

        if (this.game.autoplay.activated) this.game.autoplay.add(this.t, this.x, this.y);
    }

    update(currentTime) {
        this.fading.update(currentTime);
        this.approaching.update(currentTime);
        this.hitExpand.update(currentTime);

        this.hitCircle.opacity = this.fading.currentValue;
        this.hitCircle.scale = this.hitExpand.currentValue;
        this.overlay.opacity = this.fading.currentValue;
        this.overlay.scale = this.hitExpand.currentValue;
        this.approachCircle.opacity = this.hitCheck ? 0 : this.fading.currentValue;
        this.approachCircle.scale = this.approaching.currentValue;
    }

    render() {
        this.approachCircle.render(this.game.ctx);
        this.hitCircle.render(this.game.ctx);
        this.overlay.render(this.game.ctx);

    }

    tap() {
        this.fading = new this.game.ANI(
            this.game.beatmapPlayer.currentTime,
            this.game.beatmapPlayer.currentTime + this.hitEffectDurationMs,
            1,
            0,
            this.game.EASINGS.Linear
        );

        this.hitExpand = new this.game.ANI(
            this.game.beatmapPlayer.currentTime,
            this.game.beatmapPlayer.currentTime + this.hitEffectDurationMs,
            this.circleSize,
            this.circleSize * 1.35,
            this.game.EASINGS.SineOut
        );
    }
}