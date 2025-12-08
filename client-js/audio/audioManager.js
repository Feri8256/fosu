class AudioClip {
    constructor(url, a, connectTo) {
        this.a = a;
        this.url = url;
        this.playable = false;
        this.decodeSuccess = (aBuff) => { this.audioBuffer = aBuff; this.playable = true; }
        this.decodeFail = () => { this.playable = false; }

        this.clipVolume = this.a.createGain();
        this.clipVolume.connect(connectTo);

        fetch(url)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => this.a.decodeAudioData(arrayBuffer, this.decodeSuccess, this.decodeFail))
            .catch(error => { this.playable = false; console.error(error, url) });
    }

    play(loop, start_delay_s) {
        if (!this.playable) return;

        this.clipVolume.gain.value = 1;
        this.source = this.a.createBufferSource();
        this.source.loop = loop === true ? true : false;
        this.source.buffer = this.audioBuffer;
        this.source.connect(this.clipVolume);
        this.source.start(start_delay_s ? start_delay_s : 0);
    }

    stop(stop_delay_s) {
        this.source.stop(stop_delay_s);
    }
}

export class AudioManager {
    constructor() {
        this.a = new AudioContext();

        this.masterVolume = this.a.createGain();
        this.masterVolume.connect(this.a.destination);

        this.audioClips = {};
    }

    /**
     * The audio context is suspended after creating it, so it needs to be resumed before performing playback!
     */
    resumeContext() {
        this.a.resume();
    }

    setMasterVolume(value) {
        this.masterVolume.gain.value = value;
    }

    /**
     * Loading an audio file. The supported formats are determined by your browser
     * @param {String} url URL of the audio file
     * @param {String} id custom id for the audio clip
     */
    loadFile(url, id) {
        this.audioClips[id] = new AudioClip(url, this.a, this.masterVolume);
    }

    /**
     * 
     * @param {String} id custom id of the audio clip
     * @param {Boolean} loop `true` or `false` if looped or not
     * @param {Number} start_delay_s delaying the start of the playback (seconds)
     * @param {Number} volume volume of the audio clip (separated from master volume)
     */
    playAudioClip(id, loop = false, start_delay_s = 0, volume = 1) {
        let c = this.audioClips[id];
        c.play(loop, this.a.currentTime + start_delay_s);
    }

    /**
     * Stop the playback
     * @param {String} id custom id of the audio clip
     */
    stopAudioClip(id) {
        let c = this.audioClips[id];
        c.clipVolume.gain.cancelScheduledValues(this.a.currentTime);
        c.stop();
    }

    /**
     * Fading out the audio, then stopping it
     * @param {String} id custom id of the audio clip
     * @param {Number} fadeout_length_s duration of the fade out (seconds)
     */
    stopWithFadeOut(id, fadeout_length_s) {
        let c = this.audioClips[id];
        let endTime = this.a.currentTime + fadeout_length_s;
        c.clipVolume.gain.linearRampToValueAtTime(0, endTime);
        c.clipVolume.gain.cancelScheduledValues(endTime);
        c.stop(endTime);
    }
}