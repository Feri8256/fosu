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
        this.spinners = [];
        this.spinnersToRender = [];

        this.accJudgments = [];

        this.currentTime = 0;
        this.timeWindow = 0;

        this.playing = false;
        this.loading = false;
        this.ended = false;

        this.introSkipable = false;
        this.introSkipped = false;
        this.skipToTime = 0;

        this.progressBarHeightPx = 8;
        this.progressBarCurrentWidth = 0;
        this.lastHitObjectTime = 0;

        this.parsedOSU = {};

        this.endedTimestamp = 0;

    }

    createHitObjects(parsedOSU, spectating) {
        this.parsedOSU = parsedOSU;

        this.timeWindow = this.calculateApproachRate(parsedOSU.Difficulty.ApproachRate);
        this.globalScale = (this.game.canvas.height / this.playFieldHeight) * 0.8;
        this.xScale = this.game.canvas.width / this.playFieldWidth;
        this.yScale = this.game.canvas.height / this.playFieldHeight;
        this.xOffset = (this.game.canvas.width - (this.playFieldWidth * this.globalScale)) * 0.5;
        this.yOffset = (this.game.canvas.height - (this.playFieldHeight * this.globalScale)) * 0.5;

        this.game.replayManager.setupPlayfieldDimensions(this.xOffset, this.xScale, this.yOffset, this.yScale);

        this.game.accuracyMeter.setOverallDifficulty(this.parsedOSU.Difficulty.OverallDifficulty);

        parsedOSU.HitObjects.forEach((element) => {

            const timingPoint = this.getTimingPointAtTime(element.time);

            // Using the timing points sample set setting instead of the hit objects hit sample setting
            element.hitSample.additionSet = timingPoint.inherited?.sampleSet || timingPoint.uninherited?.sampleSet || element.hitSample.additionSet
            element.hitSample.normalSet = timingPoint.inherited?.sampleSet || timingPoint.uninherited?.sampleSet || element.hitSample.normalSet

            let objectType = element.type.reduce((a, b) => { return a + b });

            // That is a spinner
            if (objectType === 3) {
                this.spinners.push(
                    new this.game.SPINNER(
                        this.game,
                        this.globalScale,
                        element.time,
                        parseInt(element.objectParams)
                    )
                )
            } else { // That is a circle
                this.hitCircles.push(
                    new this.game.HITCIRCLE(
                        this.game,
                        this.game.utils.convertRange(element.x, 0, 512, this.xOffset, (this.playFieldWidth * this.xScale) - this.xOffset),
                        this.game.utils.convertRange(element.y, 0, 384, this.yOffset, (this.playFieldHeight * this.yScale) - this.yOffset),
                        this.globalScale,
                        element.time,
                        parsedOSU.Difficulty.CircleSize,
                        this.timeWindow,
                        element.hitSample,
                        element.hitSound
                    )
                )
            }

            // That is a slider
            if (typeof element.curveType === "string") {
                let scaledCurvePoints = [];
                element.curvePoints.forEach((cp) => {
                    scaledCurvePoints.push(
                        [
                            this.game.utils.convertRange(cp[0], 0, 512, this.xOffset, (this.playFieldWidth * this.xScale) - this.xOffset),
                            this.game.utils.convertRange(cp[1], 0, 384, this.yOffset, (this.playFieldHeight * this.yScale) - this.yOffset)

                        ]
                    )
                });
                this.sliders.push(
                    new this.game.SLIDER(
                        this.game,
                        this.game.utils.convertRange(element.x, 0, 512, this.xOffset, (this.playFieldWidth * this.xScale) - this.xOffset),
                        this.game.utils.convertRange(element.y, 0, 384, this.yOffset, (this.playFieldHeight * this.yScale) - this.yOffset),
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
        });

        // Needs fix for instances where a hit objects time is too close to 0 (the first hit object spawn immediately)
        // Possible solution is to start a timer, that can go negative if needed and then switching back to the audio playback time (stutter may occur when the swiching happens)
        this.firsthitObjectTime = Math.min(
            this.hitCircles.at(0)?.t ?? Infinity,
            this.sliders.at(0)?.t ?? Infinity,
            this.spinners.at(0)?.startTime ?? Infinity
        );
        this.lastHitObjectTime = Math.max(
            this.hitCircles.at(-1)?.t ?? -Infinity,
            this.sliders.at(-1)?.endTime ?? -Infinity,
            this.spinners.at(-1)?.endTime ?? -Infinity
        );
        let relatedStartTimingPoint = this.getTimingPointAtTime(this.firsthitObjectTime);

        let startDelay = Number(this.firsthitObjectTime) < 1000 ? 2000 : 1000;

        if (this.firsthitObjectTime > 5000) {
            this.introSkipable = true;

            // No chance for this to ever become NaN!!! :)
            this.skipToTime = this.firsthitObjectTime - (Number(relatedStartTimingPoint.uninherited?.beatLength || 500) * 5 ?? 2000);
            console.log(`intro is skipable. First hit object is at ${this.firsthitObjectTime}. Skip to: ${this.skipToTime}`);
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

            this.game.replayManager.startCapture(this.game.CONFIG.playerName, this.game.songSelectManager.currentSelect.beatmapHash, String(Date.now()));

            //this.game.autoplay.start()
        }, startDelay);
    }

    update() {
        this.currentTime = this.game.songAudioHandler.getCurrentTime();
        this.progressBarCurrentWidth = this.game.utils.convertRange(this.currentTime, this.firsthitObjectTime, this.lastHitObjectTime, 0, this.game.canvas.width);

        if (this.playing) this.game.autoplay.update(this.currentTime);

        if (this.currentTime < this.skipToTime && this.introSkipable) this.progressBarCurrentWidth = this.game.utils.convertRange(this.currentTime, 0, this.firsthitObjectTime, this.game.canvas.width, 0);
        else this.progressBarCurrentWidth = this.game.utils.convertRange(this.currentTime, this.firsthitObjectTime, this.lastHitObjectTime, 0, this.game.canvas.width);

        // Select the hit objects that needs to be rendered and updated at currentTime
        this.slidersToRender = this.sliders.filter((s) => {
            return s.t < this.currentTime + this.timeWindow && s.endTime > this.currentTime - 200 && this.playing
        });

        this.hitCirclesToRender = this.hitCircles.filter((o) => {
            return o.t < this.currentTime + this.timeWindow && o.t > this.currentTime - this.timeWindow && this.playing
        });

        this.spinnersToRender = this.spinners.filter((o) => {
            return o.startTime < this.currentTime + 200 && o.endTime > this.currentTime - 200 && this.playing
        });

        // Loop through the hit objects that needs to be rendered and updated before rendering happens        
        this.hitCirclesToRender.forEach((u) => {
            u.update(this.currentTime);

            // Autoplay can click circles to the beat
            if (this.game.autoplay.activated && !u.hitCheck && this.currentTime >= u.t) {

                this.game.hitSoundPlayer.playHitSound(u.hitSample.normalSet, u.hitSample.additionSet, u.hitSound);

                this.accJudgments.push(
                    new this.game.ACCJUDGMENT(
                        this.game,
                        u.x,
                        u.y,
                        u.scale,
                        this.game.CONFIG.hide300Points ? -1 : 3
                    )
                );

                this.game.accuracyMeter.addHit(true, 0);
                this.game.comboMeter.addHit(true);

                // Start the hit animation of the hit object
                u.tap();
                u.hitCheck = true;
            }

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

        this.slidersToRender.forEach((s) => { s.update(this.currentTime); });

        this.spinnersToRender.forEach((s) => { s.update(this.currentTime); });

        this.accJudgments.forEach((a) => { a.update(); });

        // Remove the accuracy judgments that has the `markedForDeletion` property set to true
        this.accJudgments = this.accJudgments.filter((a) => { return !a.markedForDeletion });

        if (this.currentTime > this.skipToTime && !this.introSkipped && this.playing) {
            this.setSkipButtonVisibility(false);
        }


        // Trasition to result screen at the end
        if (this.currentTime >= this.lastHitObjectTime && !this.ended && this.playing) {
            this.endedTimestamp = this.game.clock;
            this.ended = true;

            setTimeout(() => {
                this.game.backgroundManager.changeOpacity(0, 500);
            }, 500);
        }
        if (this.game.clock - 1000 > this.endedTimestamp && this.ended && this.playing) this.end();
    }

    render() {
        // Rendering every type of hit object in order
        this.spinnersToRender.forEach((o) => { o.render() });
        this.slidersToRender.forEach((s) => { s.render() });
        this.hitCirclesToRender.forEach((o) => { o.render() });
        this.accJudgments.forEach((a) => { a.render() });

        // like this!!!!
        this.game.ctx.fillStyle = "#fff";
        this.game.ctx.font = "16px Arial";
        //this.game.ctx.fillText(`${}`, 100, 100)
        //this.game.ctx.fillText(`${}`, 100, 120)

        // Beatmap time progress bar on the bottom
        if (!this.playing) return;
        this.game.ctx.fillStyle = "rgba(0,0,0,0.5)";
        this.game.ctx.fillRect(0, this.game.canvas.height - this.progressBarHeightPx, this.game.canvas.width, this.progressBarHeightPx);
        this.game.ctx.fillStyle = this.currentTime < this.skipToTime && this.introSkipable ? "#FFFF00" : "#64FFFF";
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
            let distance = this.game.utils.getDistance(ho.x, ho.y, mouse.x, mouse.y);
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
        if (hitResult === 3 && this.game.CONFIG.hide300Points) hitResult = -1;
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
        this.spinners.length = 0;
        this.spinnersToRender.length = 0;

        this.accJudgments.length = 0;

        this.currentTime = 0;
        this.timeWindow = 0;

        this.playing = false;
        this.loading = false;
        this.ended = false;

        this.introSkipable = false;
        this.introSkipped = false;
        this.skipToTime = 0;

        this.progressBarHeightPx = 8;
        this.progressBarCurrentWidth = 0;
        this.lastHitObjectTime = 0;

        this.setSkipButtonVisibility(false);
        this.game.accuracyMeter.reset();
        this.game.comboMeter.reset();
        this.game.autoplay.reset();
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
        this.game.auMgr.playAudioClip("menuhit");
    }

    setSkipButtonVisibility(state) {
        this.game.UI.introSkipButton.style.display = state ? "block" : "none";
    }

    end() {
        this.playing = false;
        this.game.resultScreenUpdater.update({
            playerName: this.game.CONFIG.playerName,
            mapTitle: this.parsedOSU.Metadata.Title,
            mapCreator: this.parsedOSU.Metadata.Creator,
            mapVersion: this.parsedOSU.Metadata.Version,
            mapArtist: this.parsedOSU.Metadata.Artist,
            countPerfect: this.game.accuracyMeter.results[3],
            countOkay: this.game.accuracyMeter.results[2],
            countMeh: this.game.accuracyMeter.results[1],
            countMiss: this.game.accuracyMeter.results[0],
            countMaxCombo: this.game.comboMeter.getResults().max,
            acc: this.game.accuracyMeter.results[4]
        });

        if (this.game.currentState.stateName !== "SPECTATING") {
            this.game.submitScore();
        } 

        this.game.setState(this.game.STATE_ENUM.RESULT);
    }
}