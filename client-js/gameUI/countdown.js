import { Sprite } from "../graphics/sprite.js";
import { Animation, EASING } from "../animationEngine.js";

export class Countdown {
    /**
     * *"Are You ready?... 3-2-1-GO!"*
     * @param {*} game 
     * @param {Number} firstHitObjectTime put `-1` here for disable the countdown
     * @param {Number} beatLength beat length from uninherited timing point
     */
    constructor(game, firstHitObjectTime, beatLength = 0) {
        this.game = game;
        this.firstHitObjectTime = firstHitObjectTime;
        this.beatLength = beatLength;
        this.currentCountSoundIndex = 0;
        this.lastCountSoundIndex = 0;
        this.disabled = this.firstHitObjectTime === -1;

        this.ani = new Animation();

        if (this.disabled) return;

        this.countSounds = ["gos", "count1s", "count2s", "count3s"];
        this.countSprites = [
            new Sprite(this.game.skinResourceManager.getSpriteImage("go")),
            new Sprite(this.game.skinResourceManager.getSpriteImage("count1")),
            new Sprite(this.game.skinResourceManager.getSpriteImage("count2")),
            new Sprite(this.game.skinResourceManager.getSpriteImage("count3")),
            new Sprite(this.game.skinResourceManager.getSpriteImage("ready"))
        ];

        // The "ready" sprite starts off as invisible until the animation touches its opacity value!
        this.countSprites[4].opacity = 0;

        this.fourBeatsBehindAtMs = this.firstHitObjectTime - (this.beatLength * 4);
        this.sixBeatsBehindAtMs = this.firstHitObjectTime - (this.beatLength * 6);

        this.currentCountIndex = 4;
    }

    /**
     * 
     * @param {Number} currentTime song clock
     * @returns 
     */
    update(currentTime) {
        if (this.disabled) return;

        this.ani.update(currentTime);

        this.currentCountSoundIndex = Math.floor((this.firstHitObjectTime - currentTime) / this.beatLength);

        if (this.currentCountIndex !== this.currentCountSoundIndex && this.currentCountSoundIndex > -1) {

            if (this.currentCountSoundIndex === 6) {
                this.ani = new Animation(
                    currentTime, currentTime + this.beatLength,
                    0, 1,
                    EASING.BackOut
                );
            }

            if (this.currentCountSoundIndex === 5) {
                this.game.auMgr.playAudioClip("readys");
            }

            if (this.currentCountSoundIndex < 4) {
                this.game.auMgr.playAudioClip(this.countSounds[this.currentCountSoundIndex]);

                this.ani = new Animation(
                    currentTime, currentTime + 200,
                    0, 1,
                    EASING.BackOut
                );
            }

            this.currentCountIndex = this.currentCountSoundIndex;
        }

        if (this.currentCountSoundIndex < 4) {
            this.countSprites.forEach((s, i) => {
                s.x = this.game.canvas.width * 0.5;
                s.y = this.game.canvas.height * 0.5;
                s.opacity = i === this.currentCountSoundIndex ? this.ani.amount : 0;
                s.scale = this.ani.currentValue;
            });

        }
        if (this.currentCountSoundIndex > 4) {
            let readySprite = this.countSprites[4];
            readySprite.opacity = this.game.utils.clamp(this.ani.currentValue, 0, 1);
            readySprite.scale = 1;
            readySprite.x = this.game.canvas.width * 0.5 * this.ani.currentValue;
        }


    }

    render() {
        if (this.disabled) return;

        this.countSprites.forEach((s) => {
            s.render(this.game.ctx);
        });
    }
}