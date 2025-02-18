/**
 * Easing functions to use with Animation class
 * https://easings.net/
 */
export let EASING = {
    Flashing: (x) => {
        if (x > 0 && x < 0.24) {
            return 1;
        }
        if (x > 0.25 && x < 0.49) {
            return 0;
        }
        if (x > 0.5 && x < 0.74) {
            return 1;
        }
        if (x > 0.75 && x <= 1) {
            return 0;
        }
    },
    Linear: (x) => {
        return x;
    },
    SineIn: (x) => {
        return 1 - Math.cos((x * Math.PI) / 2);
    },
    SineOut: (x) => {
        return Math.sin((x * Math.PI) / 2);
    },
    SineInOut: (x) => {
        return -(Math.cos(Math.PI * x) - 1) / 2;
    },
    BackIn: (x) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;

        return c3 * x * x * x - c1 * x * x;
    },
    BackOut: (x) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;

        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    },
    ExpoOut: (x) => {
        return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    },
    QuartOut: (x) => {
        return 1 - Math.pow(1 - x, 4);
    },
    CubicIn: (x) => {
        return x * x * x;
    },
    BounceOut:(x) => {
        const n1 = 7.5625;
        const d1 = 2.75;

        if (x < 1 / d1) {
            return n1 * x * x;
        } else if (x < 2 / d1) {
            return n1 * (x -= 1.5 / d1) * x + 0.75;
        } else if (x < 2.5 / d1) {
            return n1 * (x -= 2.25 / d1) * x + 0.9375;
        } else {
            return n1 * (x -= 2.625 / d1) * x + 0.984375;
        }
    },
    BounceIn: (x) => {
        return 1 - EASING.BounceOut(1 - x);
    }
};

export class Animation {
    /**
     * Use `currentValue` to get the animated value between `startValue` and `endValue` after calling update on this.
     * This can be used as a standalone animation, or in a timeline
     * @param {Number} startTime timestamp of animation start
     * @param {Number} endTime timestamp of animation end
     * @param {Number} startValue start value
     * @param {Number} endValue end value
     * @param {Function} easing easing function
     * @param {Boolean} looped animation looped
     * @param {String} id identifier for timeline
     */
    constructor(startTime, endTime, startValue, endValue, easing, looped, id) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.startValue = startValue;
        this.endValue = endValue;
        this.currentValue = this.startValue;
        this.duration = this.endTime - this.startTime;
        this.amount = 0;
        this.easing = easing;
        this.looped = looped === true ? true : false;
        this.id = id ?? "nah";
        this.timelineDelta = startTime;
    }
    /**
     * update. It's literally that!
     * @param {Number} currentTime timestamp
     */
    update(currentTime) {
        let checkProgress = (currentTime - this.startTime) / this.duration;
        this.amount = Math.max(0, Math.min(checkProgress, 1));
        this.currentValue = this.startValue + (this.endValue - this.startValue) * this.easing(this.amount);

        if (this.looped && this.amount === 1) {
            this.startTime = currentTime;
            this.endTime = currentTime + this.duration;
            this.amount = 0;
            this.currentValue = this.startValue;
        }
    }
}


export class Timeline {
    /**
     * Manage a collection of animations at once
     */
    constructor() {
        this.animations = [];

        this.currentTime = 0;
        this.timelineCurrentTime = 0;

        this.latestEndTime = 0;
        this.startedAt = 0;

        this.loop = false;
        this.playing = false;
    }

    /**
     * Add an animation to the timeline
     * @param {Animation} animation 
     */
    appendAnimation(animation) {
        this.animations.push(animation);

        // Check the list of animations and find the one with the latest `endTime`
        // Therefore we know when the timeline is finished playing
        // and loop can be triggered if it is enabled
        let endTimes = this.animations.map(e => {
            return e.endTime;
        });
        this.latestEndTime = endTimes.sort((a, b) => { return a - b }).at(-1);

    }

    /**
     * Start playing the entire thing
     */
    play() {
        this.playing = true;
        this.startedAt = this.currentTime;
        this.timelineCurrentTime = 0;
    }

    /**
     * Update the timeline and every animation of it
     * @param {Number} currentTime 
     */
    update(currentTime) {
        this.currentTime = currentTime;
        if (!this.playing) return;
        this.timelineCurrentTime = this.currentTime - this.startedAt;

        this.animations.forEach((an) => {
            an.update(this.timelineCurrentTime);
        });

        if (this.timelineCurrentTime >= this.latestEndTime && this.loop) this.play();
        if (this.timelineCurrentTime >= this.latestEndTime && !this.loop) this.playing = false;
    }

    /**
     * Get the current value of an animation that matches the id.
     * Keep in mind that this method returns `undefined` after all the animations played out!!
     * @param {String} id 
     */
    getValueOf(id) {
        if(!this.playing) return;
        let f = this.animations.findIndex((fa) => { return fa.id === id && fa.startTime <= this.timelineCurrentTime && fa.endTime >= this.timelineCurrentTime });
        if (f === -1) return;
        return this.animations[f].currentValue;
    }
}