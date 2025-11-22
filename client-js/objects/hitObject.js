export class HitObject {
    constructor(game, position, time, scaling, circleSize, hitSample, hitSound) {
        this.game = game;
        this.position = position,
        this.time = time;
        this.scaling = scaling;
        this.circleSize = circleSize
        this.hitSample = hitSample;
        this.hitSound = hitSound;
    }

    playHitSound() {
        this.game.hitSoundPlayer.playHitSound(this.hitSample.normalSet, this.hitSample.additionSet, this.hitSound);
    }
}
