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

        this.disabled = this.firstHitObjectTime === -1;

        if (this.disabled) return;

        this.countSounds = ["gos", "count1s", "count2s", "count3s"];
        this.countSprites = [
            new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("go")),
            new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("count1")),
            new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("count2")),
            new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("count3")),
            new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("ready"))
        ];
        this.currentCountSoundIndex = 0;
        this.lastCountSoundIndex = 0;
        this.fourBeatsBehindAtMs = this.firstHitObjectTime - (this.beatLength * 4);
        this.sixBeatsBehindAtMs = this.firstHitObjectTime - (this.beatLength * 6);
    }

    /**
     * 
     * @param {Number} currentTime song clock
     * @returns 
     */
    update(currentTime) {
        if (this.disabled) return;

        this.currentCountSoundIndex = Math.floor((this.firstHitObjectTime - currentTime) / this.beatLength);
        if (
            this.currentCountSoundIndex !== this.lastCountSoundIndex &&
            currentTime >= this.fourBeatsBehindAtMs &&
            currentTime <= this.firstHitObjectTime &&
            this.currentCountSoundIndex < this.countSounds.length
        ) {
            this.game.auMgr.playAudioClip(this.countSounds[this.currentCountSoundIndex]);
            this.lastCountSoundIndex = this.currentCountSoundIndex;
        }

        this.countSprites.forEach((s, i) => {
            s.x = this.game.canvas.width * 0.5;
            s.y = this.game.canvas.height * 0.5;
            s.opacity = i === this.currentCountSoundIndex ? 1 : 0;
            s.scale = this.game.beatmapPlayer.globalScale;
        });

    }

    render() {
        if (this.disabled) return;

        this.countSprites.forEach((s) => {
            s.render(this.game.ctx);
        });
    }
}