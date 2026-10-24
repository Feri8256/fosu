import { Animation } from "../animationEngine.js";

export class HitObject {
    /**
     * 
     * @param {import("../main.js").Game} game 
     * @param {import("../point.js").Point} position 
     * @param {Number} time 
     * @param {Number} scaling 
     * @param {Number} circleSize 
     * @param {*} hitSample 
     * @param {*} hitSound 
     * @param {Number} approachTime 
     */
    constructor(game, position, time, scaling, circleSize, hitSample, hitSound, approachTime) {
        this.game = game;
        this.position = position,
        this.time = time;
        this.scaling = scaling;
        this.circleSize = circleSize
        this.hitSample = hitSample;
        this.hitSound = hitSound;
        this.approachTime = approachTime;

        this.approachFadingAni = new Animation(
            this.time - approachTime,
            this.time - (approachTime * 0.4),
            0, 1
        );

        this.approachScalingAni = new Animation(
            this.time - approachTime,
            this.time,
            0, 1
        );
    }

    playHitSound() {
        this.game.hitSoundPlayer.playHitSound(this.hitSample.normalSet, this.hitSample.additionSet, this.hitSound);
    }

    updateApproachAnimation(currentTime) {
        this.approachFadingAni.update(currentTime);
        this.approachScalingAni.update(currentTime);
    }

    getApproachFadingValue() {
        return this.approachFadingAni.currentValue;
    }

    getApproachScalingValue() {
        return this.approachScalingAni.currentValue;
    }
}
