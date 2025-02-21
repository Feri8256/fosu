export class BeatmapPlayer {
    constructor(game) {
        this.game = game;
        this.playFieldWidth = 512;
        this.playFieldHeight = 384;
        this.globalScale = 1;
        this.xOffset = 0;
        this.yOffset = 0;
        this.yScale = 1;
        this.xScale = 1;

        this.hitCircles = [];
        this.hitCirclesToRender = [];
        this.sliders = [];
        this.slidersToRender = [];

        this.accJudgments = [];

        this.currentTime = 0;
        this.timeWindow = 0;

        this.playing = false;
        this.loading = false;

        this.introSkipable = false;
        this.introSkipped = false;
        this.skipToTime = 0;

        this.progressBarHeightPx = 8;
        this.progressBarCurrentWidth = 0;
        this.lastHitObjectTime = 0;

        this.parsedOSU = {};

    }

    /**
     * Projects a number to output range based on the input range.
     * @param {Number} value 
     * @param {Number} inMin 
     * @param {Number} inMax 
     * @param {Number} outMin 
     * @param {Number} outMax 
     * @returns 
     */
    mapToRange(value, inMin, inMax, outMin, outMax) {
        let ratio = (value - inMin) / (inMax - inMin)
        let amount = Math.max(0, Math.min(ratio, 1));
        return outMin + (outMax - outMin) * amount;
    }

    createHitObjects(parsedOSU) {
        this.parsedOSU = parsedOSU;

        this.timeWindow = this.calculateApproachRate(parsedOSU.Difficulty.ApproachRate);
        this.globalScale = (this.game.canvas.height / this.playFieldHeight) * 0.9;
        this.xScale = this.game.canvas.width / this.playFieldWidth;
        this.yScale = this.game.canvas.height / this.playFieldHeight;
        this.xOffset = (this.game.canvas.width - (this.playFieldWidth * this.globalScale)) * 0.5;
        this.yOffset = (this.game.canvas.height - (this.playFieldHeight * this.globalScale)) * 0.5;

        parsedOSU.HitObjects.forEach((element) => {

            const timingPoint = this.getTimingPointAtTime(element.time);

            // Using the timing points sample set setting instead of the hit objects hit sample setting
            element.hitSample.additionSet = timingPoint.inherited?.sampleSet || timingPoint.uninherited?.sampleSet || element.hitSample.additionSet
            element.hitSample.normalSet = timingPoint.inherited?.sampleSet || timingPoint.uninherited?.sampleSet || element.hitSample.normalSet

            if (typeof element.curveType === "string") {
                let scaledCurvePoints = [];
                element.curvePoints.forEach((cp) => {
                    scaledCurvePoints.push(
                        [
                            this.mapToRange(cp[0], 0, 512, this.xOffset, (this.playFieldWidth * this.xScale) - this.xOffset),
                            this.mapToRange(cp[1], 0, 384, this.yOffset, (this.playFieldHeight * this.yScale) - this.yOffset)

                        ]
                    )
                });
                this.sliders.push(
                    new this.game.SLIDER(
                        this.game,
                        this.mapToRange(element.x, 0, 512, this.xOffset, (this.playFieldWidth * this.xScale) - this.xOffset),
                        this.mapToRange(element.y, 0, 384, this.yOffset, (this.playFieldHeight * this.yScale) - this.yOffset),
                        this.globalScale,
                        element.time,
                        parsedOSU.Difficulty.CircleSize,
                        this.timeWindow,
                        scaledCurvePoints,
                        element.slides,
                        element.length,
                        this.parsedOSU.Difficulty.SliderMultiplier,
                        timingPoint.inherited?.beatLength, // Inherited `beatLength` actually holds `sliderVelocity` value! (i think i was lazy)
                        timingPoint.uninherited?.beatLength,
                    )
                )
            }

            this.hitCircles.push(
                new this.game.HITCIRCLE(
                    this.game,
                    this.mapToRange(element.x, 0, 512, this.xOffset, (this.playFieldWidth * this.xScale) - this.xOffset),
                    this.mapToRange(element.y, 0, 384, this.yOffset, (this.playFieldHeight * this.yScale) - this.yOffset),
                    this.globalScale,
                    element.time,
                    parsedOSU.Difficulty.CircleSize,
                    this.timeWindow,
                    element.hitSample,
                    element.hitSound
                )
            )


        });

        // Needs fix for instances where a hit objects time is too close to 0 (the first hit object spawn immediately)
        // Possible solution is to start a timer, that can go negative if needed and then switching back to the audio playback time (stutter may occur when the swiching happens)
        let startDelay = Number(this.hitCircles.at(0)?.t) < 1000 ? 2000 : 1000;
        let firsthitObjectTime = Math.min(this.hitCircles.at(0)?.t, this.sliders.at(0)?.t);
        this.lastHitObjectTime = Math.max(this.hitCircles.at(-1)?.t, this.sliders.at(-1)?.endTime);
        let relatedStartTimingPoint = this.getTimingPointAtTime(firsthitObjectTime);

        if (firsthitObjectTime > 5000) {
            this.introSkipable = true;

            // No chance for this to ever become NaN!!! :)
            this.skipToTime = firsthitObjectTime - (Number(relatedStartTimingPoint.uninherited?.beatLength || 500) * 5 ?? 2000);
            console.log(`intro is skipable. First hit object is at ${firsthitObjectTime}. Skip to: ${this.skipToTime}`);
        }


        this.game.setLoadingCircle(false);
        setTimeout(() => {

            // Parsing error?
            if (parsedOSU.HitObjects.length === 0) {
                console.log(`Beatmap parsing error! No HitObjects. Returning to songselect menu`)
                this.game.setState(this.game.STATE_ENUM.SONGSELECT);
                this.cleanup();
                return;
            }
            this.game.songAudioHandler.reset()
            this.game.songAudioHandler.play();
            if (this.introSkipable) this.setSkipButtonVisibility(true);
            this.playing = true;
        }, startDelay);
    }

    update() {
        this.currentTime = this.game.songAudioHandler.getCurrentTime();
        this.progressBarCurrentWidth = this.mapToRange(this.currentTime, 0, this.lastHitObjectTime, 0, this.game.canvas.width);

        // Select the hit objects that needs to be rendered and updated at currentTime
        this.slidersToRender = this.sliders.filter((s) => {
            return s.t < this.currentTime + this.timeWindow && s.endTime > this.currentTime - 200 && this.playing
        });

        this.hitCirclesToRender = this.hitCircles.filter((o) => {
            return o.t < this.currentTime + this.timeWindow && o.t > this.currentTime - this.timeWindow && this.playing
        });

        // Loop through the hit objects that needs to be rendered and updated before rendering happens        
        this.hitCirclesToRender.forEach((u) => {
            u.update(this.currentTime);

            // When its too late to click and no hit registered on the hit object it counts as a miss
            if (u.hittedAt === 0 && !u.hitCheck && u.t < this.currentTime - 300) {
                this.accJudgments.push(
                    new this.game.ACCJUDGMENT(
                        this.game,
                        u.x,
                        u.y,
                        u.scale,
                        0
                    )
                );
                // Register a not successful hit to the accuracy meter and combo meter
                this.game.accuracyMeter.addHit(false, -1);
                this.game.comboMeter.addHit(false);
                u.hitCheck = true;
            }
        });

        this.slidersToRender.forEach((s) => {
            s.update(this.currentTime);
        });

        this.accJudgments.forEach((a) => { a.update() });

        // Remove the accuracy judgments that has the `markedForDeletion` property set to true
        this.accJudgments = this.accJudgments.filter((a) => { return !a.markedForDeletion });

        if (this.currentTime > this.skipToTime && !this.introSkipped && this.playing) {
            this.setSkipButtonVisibility(false);
        }

        if (this.currentTime >= this.lastHitObjectTime + 500 && this.playing) this.end();
    }

    render() {
        // Rendering every type of hit object in order
        this.slidersToRender.forEach((s) => { s.render() });
        this.hitCirclesToRender.forEach((o) => { o.render() });
        this.accJudgments.forEach((a) => { a.render() });

        // Beatmap time progress bar on the bottom
        if (!this.playing) return;
        this.game.ctx.fillStyle = "rgba(0,0,0,0.5)";
        this.game.ctx.fillRect(0, this.game.canvas.height - this.progressBarHeightPx, this.game.canvas.width, this.progressBarHeightPx);
        this.game.ctx.fillStyle = "#64FFFF";
        this.game.ctx.fillRect(0, this.game.canvas.height - this.progressBarHeightPx, this.progressBarCurrentWidth, this.progressBarHeightPx);
    }

    /**
     * Determine the time for a hit object it has to fade in and be fully visible.
     * THIS IS NOT ACCURATE YET, IT NEEDS MORE ATTENTION maybe later :)
     * https://osu.ppy.sh/wiki/en/Beatmap/Approach_rate
     * @param {Number} ar Approach rate value from the parsed beatmap
     * @returns 
     */
    calculateApproachRate(ar) {
        let arTime = 0;
        if (ar < 5) arTime = 1200 + 600 * (5 - ar) / 5;
        if (ar > 5) arTime = 1200 - 750 * (ar - 5) / 5;
        if (ar === 5) arTime = 1200;

        return arTime;
    }

    /**
     * Calculate the distance of two objects both of them have `x` and `y` values
     * @param {*} hitObject 
     * @param {*} cursor 
     * @returns {Number}
     */
    calculateCursorDistance(hitObject, cursor) {
        let distX = (hitObject.x) - cursor.x;
        let distY = (hitObject.y) - cursor.y;
        let dist = Math.sqrt((distX * distX) + (distY * distY));
        return dist;
    }

    getTimingPointAtTime(objectTime) {
        let inheritedTimingPoint = this.parsedOSU.TimingPoints.filter((p) => {
            return p.time <= objectTime && p.uninherited === 0;
        }).at(-1);

        // not inherited
        let uninheritedTimingPoint = this.parsedOSU.TimingPoints.filter((p) => {
            return p.time <= objectTime && p.uninherited === 1;
        }).at(-1);

        return {
            inherited: inheritedTimingPoint,
            uninherited: uninheritedTimingPoint
        }
    }

    /**
     * Register tapping
     * @param {*} mouse current mouse status from GameState and InputHandler
     * @returns 
     */
    hit(mouse) {
        let hitTimestamp = this.game.songAudioHandler.getCurrentTime();

        // Finds the hit object that is close in time and in distance
        // No notelocking :)
        let obj = this.hitCirclesToRender.find((ho) => {
            let distance = this.calculateCursorDistance(ho, mouse);
            return ho.t - 200 < hitTimestamp && ho.t + 200 > hitTimestamp && !ho.hitCheck && distance <= ho.rad
        });

        // In case we have not found the hit object we wanted
        if (!obj) return;
        let hitDeltaTime = Math.abs(obj.t - hitTimestamp);

        // Register the hit to the accuracy meter that returns a number for judgment
        // When the result is not a miss (0) do not break combo
        let hitResult = this.game.accuracyMeter.addHit(true, hitDeltaTime);
        if (hitResult > 0) this.game.comboMeter.addHit(true);

        // Play a hitsound
        this.game.hitSoundPlayer.playHitSound(obj.hitSample.normalSet, obj.hitSample.additionSet, obj.hitSound);

        // Check if the configuration enables the 300s to be invisible
        // Add the accuracy judgment to their array
        if (hitResult === 3 && this.game.CONFIG.gameplay.hide300Points) hitResult = -1;
        this.accJudgments.push(
            new this.game.ACCJUDGMENT(
                this.game,
                obj.x,
                obj.y,
                obj.scale,
                hitResult
            )
        );

        // Start the hit animation of the hit object
        obj.tap();
        obj.hitCheck = true;
    }

    /**
     * Remove hit objects and reset everything to its initial values
     */
    cleanup() {
        this.playFieldWidth = 512;
        this.playFieldHeight = 384;
        this.globalScale = 1;
        this.xOffset = 0;
        this.yOffset = 0;
        this.yScale = 1;
        this.xScale = 1;
        this.hitCircles.length = 0;
        this.hitCirclesToRender.length = 0;
        this.sliders.length = 0;
        this.slidersToRender.length = 0;

        this.accJudgments.length = 0;

        this.currentTime = 0;
        this.timeWindow = 0;

        this.playing = false;
        this.loading = false;

        this.introSkipable = false;
        this.introSkipped = false;
        this.skipToTime = 0;

        this.progressBarHeightPx = 8;
        this.progressBarCurrentWidth = 0;
        this.lastHitObjectTime = 0;

        this.setSkipButtonVisibility(false);

    }

    /**
     * Clear the current map and load it again
     */
    retry() {
        this.cleanup();
        this.createHitObjects(this.parsedOSU);
    }

    skipIntro() {
        if (this.introSkipped) return;
        this.game.songAudioHandler.setPlaybackTime(this.skipToTime);
        this.setSkipButtonVisibility(false);
        this.introSkipped = true;
    }

    setSkipButtonVisibility(state) {
        this.game.UI.introSkipButton.style.display = state ? "block" : "none";
    }

    end() {
        this.playing = false;
        this.game.setState(this.game.STATE_ENUM.RESULT);
    }

    getMapMetadata() {
        return {
            title: this.parsedOSU.Metadata.Title,
            artist: this.parsedOSU.Metadata.Artist,
            creator: this.parsedOSU.Metadata.Creator,
            version: this.parsedOSU.Metadata.Version
        }
    }

}