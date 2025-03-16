export class SongAudioHandler {
    constructor(game) {
        this.game = game;
        this.audio = document.querySelector("audio");
        this.currentVolume = this.game.CONFIG.musicVolume;
        this.audio.volume = this.currentVolume;
        this.audio.muted = false;
        this.audio.preservesPitch = false;
        // Fun fact: 0.075 is the minimum supported playback rate

        this.volumeAutomation = new this.game.ANI(0, 0, this.currentVolume, this.currentVolume, this.game.EASINGS.Linear);
        this.currentPreviewPoint = 0;

    }

    /**
     * Loads an audio file
     * @param {String} url whole URL of the audio file
     */
    load(url) {
        this.audio.src = url;
        this.audio.load();
    }

    update() {
        this.volumeAutomation.update(this.game.clock);
        this.audio.volume = this.volumeAutomation.currentValue;
    }

    /**
     * Starts playing the audio and jumps to the specified time point
     * @param {Number} time ms
     */
    startPreview(time) {
        if (!time || time === -1) time = 0;
        this.currentPreviewPoint = time;
        this.audio.play();
        this.audio.currentTime = this.currentPreviewPoint / 1000; // HTML Audio counts in seconds!

        this.volumeAutomation = new this.game.ANI(this.game.clock, this.game.clock + 1000, 0, this.game.CONFIG.musicVolume, this.game.EASINGS.Linear);

        this.audio.onended = () => {
            this.repeatPreview();
        }
    }

    repeatPreview() {
        this.audio.play();
        this.audio.currentTime = this.currentPreviewPoint / 1000;
        this.volumeAutomation = new this.game.ANI(this.game.clock, this.game.clock + 1000, 0, this.game.CONFIG.musicVolume, this.game.EASINGS.Linear);
    }

    reset() {
        this.audio.currentTime = 0;
        this.audio.pause();
        this.volumeAutomation = new this.game.ANI(0, 0, this.game.CONFIG.musicVolume, this.game.CONFIG.musicVolume, this.game.EASINGS.Linear);
        this.audio.onended = () => { }
    }

    /**
     * Change to volume in time
     * @param {Number} value between 0-1
     * @param {Number} duration rate of volume change in ms
     */
    changeVolume(value, duration = 100) {
        this.volumeAutomation = new this.game.ANI(this.game.clock, this.game.clock + duration, this.audio.volume, value, this.game.EASINGS.Linear);
    }

    /**
     * Returns the timestamp of current playback position (in ms!)
     * @returns { Number }
     */
    getCurrentTime() {
        return Math.floor(this.audio.currentTime * 1000);
    }

    play() {
        this.audio.play();
    }

    pause() {
        this.audio.pause();
    }

    setPlaybackTime(ms) {
        this.audio.currentTime = ms / 1000;
    }
}