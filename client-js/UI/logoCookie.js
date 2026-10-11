import { Sprite, SpriteImage } from "../graphics/sprite.js";
import { Animation, EASING } from "../animationEngine.js";
import { utils } from "../utils.js";

export class LogoCookie {
    constructor(game) {
        this.game = game;
        this.clickDebounceMs = 2000;
        this.transitionDurationMs = 750;
        this.logoSpirteImage = new SpriteImage("client-files/fosu.png");
        this.waveSpirteImage = new SpriteImage("client-files/wave.png");
        this.logoSprite = new Sprite(this.logoSpirteImage);
        this.logoSpriteOver = new Sprite(this.logoSpirteImage);
        this.waveSprite = new Sprite(this.waveSpirteImage);
        this.waveSprite.additiveColor = true;

        this.logoSprite.x = this.game.canvas.width * 0.5;
        this.logoSprite.y = this.game.canvas.height * 0.5;
        this.LogoBaseScale = (this.game.canvas.height / 1000) * 0.85;

        this.currentLogoScale = 1;

        this.easingFn = EASING.ExpoInOut;

        this.movementAni = new Animation(0, 0, 0.5, 0.5);
        this.scalingAni = new Animation(0, 0, 1, 1);

        this.beatTickAnimation = new Animation(0, 1000, 0, 1, EASING.SineOut, true);

        this.clicked = false;
        this.clickedTimestamp = 0;

        this.game.events.on("UI:BeatmapTimingData", this.getUninheritedTimingPoints.bind(this));

        this.currentTimingPoint = {
            time: 0, beatLength: 1000
        }

        this.uninheritedTimingPoints = [];

        this.currentBeatIndex = 0;
    }

    getUninheritedTimingPoints(timingPoints) {
        this.uninheritedTimingPoints = timingPoints.filter((p) => {
            return p.uninherited === 1;
        });
    }

    updateTimingPoint(t) {
        let tPoint = this.uninheritedTimingPoints.filter((p) => {
            return p.time <= t;
        }).at(-1);

        if (!tPoint) return;
        if (tPoint.time === this.currentTimingPoint.time) return;

        this.currentTimingPoint = tPoint;
    }

    resetTimingPoint() {
        this.currentTimingPoint = {
            time: 0, beatLength: 1000
        }
    }

    update() {
        this.updateTimingPoint(this.game.songClock);

        let m = this.game.inputHandler.getMouse();
        this.LogoBaseScale = (this.game.canvas.height / 1000) * 0.85 * this.scalingAni.currentValue;

        this.movementAni.update(this.game.clock);
        this.scalingAni.update(this.game.clock);
        this.beatTickAnimation.update(this.game.clock);

        let b = Math.floor((this.currentTimingPoint.time - this.game.songClock) / this.currentTimingPoint.beatLength);
        if (b !== this.currentBeatIndex) {
            this.beatTickAnimation.startTime = this.game.clock;
            this.beatTickAnimation.endTime = this.game.clock + this.currentTimingPoint.beatLength;
            this.beatTickAnimation.duration = this.currentTimingPoint.beatLength;

            this.currentBeatIndex = b;
        }

        this.currentLogoScale = this.movementAni.currentValue * this.scalingAni.currentValue;

        this.logoSprite.x = this.game.canvas.width * this.movementAni.currentValue;
        this.logoSprite.y = this.game.canvas.height * this.movementAni.currentValue;

        let d = utils.getDistance(m.x, m.y, this.logoSprite.x, this.logoSprite.y);
        let hovering = d < (this.currentLogoScale * this.LogoBaseScale * 920);
        let scaleEffectSize = hovering ? 100 : 30;

        this.logoSprite.scale = this.LogoBaseScale - (this.beatTickAnimation.currentValue / scaleEffectSize);

        this.logoSprite.rotation = this.logoSpriteOver.rotation = 2 * Math.PI * utils.convertRange(
            this.scalingAni.currentValue, 
            0.45, 
            1, 
            0.95, 
            -1
        );

        this.logoSpriteOver.x = this.logoSprite.x;
        this.logoSpriteOver.y = this.logoSprite.y;
        this.logoSpriteOver.scale = this.LogoBaseScale;
        this.logoSpriteOver.opacity = utils.clamp(0.5 - this.beatTickAnimation.amount, 0, 0.4);

        this.waveSprite.x = this.logoSprite.x;
        this.waveSprite.y = this.logoSprite.y;
        this.waveSprite.scale = hovering ? (this.LogoBaseScale + this.beatTickAnimation.currentValue * 0.07) : this.LogoBaseScale;
        this.waveSprite.opacity = hovering ? 1 - this.beatTickAnimation.amount : 0;

        if (hovering && m.down && !this.clicked) {
            this.game.events.emit("UI:CookieClicked");
            this.clickedTimestamp = this.game.clock;
            this.clicked = true;
        }

        if (this.clicked && this.clickedTimestamp + this.clickDebounceMs < this.game.clock) {
            this.clicked = false;
        }
    }

    transition(out = false) {
        if (out) {
            this.movementAni = new Animation(this.game.clock, this.game.clock + this.transitionDurationMs, 0.5, 0.95, this.easingFn);
            this.scalingAni = new Animation(this.game.clock, this.game.clock + this.transitionDurationMs, 1, 0.45, this.easingFn);
        } else {
            this.movementAni = new Animation(this.game.clock, this.game.clock + this.transitionDurationMs, 0.95, 0.5, this.easingFn)
            this.scalingAni = new Animation(this.game.clock, this.game.clock + this.transitionDurationMs, 0.45, 1, this.easingFn);

        }
    }

    render() {
        this.waveSprite.render(this.game.ctx);
        this.logoSprite.render(this.game.ctx);
        this.logoSpriteOver.render(this.game.ctx);
    }
}