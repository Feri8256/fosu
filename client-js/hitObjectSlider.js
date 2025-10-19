export class Slider {
    constructor(
        game,
        x,
        y,
        scale,
        t,
        cs,
        timeWindow,
        curvePoints = [],
        slides = 1,
        pixelLength = 0,
        multiplier = 1,
        v = -100,
        beatLength,
        edgeSounds,
        edgeSets,
        hitSound,
        hitSample
    ) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.t = t;
        this.timeWindow = timeWindow;
        this.cs = cs;
        this.scale = scale;
        this.rad = (118 / cs) * scale;
        this.ballSize = scale / (cs * 0.5);

        this.fadeOutMs = 150;

        // Put the start x and y coordinates to the begining of the curvePoints array then append the rest of them
        this.curvePoints = [[this.x, this.y], ...curvePoints];
        this.slides = slides;
        this.slidesLeft = slides;

        this.currentSlide = 0;
        this.currentSoundPlayed = 0;

        // This includes the points of the slider ball path with the repeats
        this.ballPath = [];
        for (let slide = 1; slide < this.slides + 1; slide++) {
            let rev = slide % 2 === 0;
            let prevP;

            // Copy the curve points in normal or in reverse order
            for (
                let i = rev ? (this.curvePoints.length - 1) : 0;
                rev ? (i > 0) : (i < this.curvePoints.length);
                rev ? (i--) : (i++)
            ) {
                const currentP = this.curvePoints.at(i);
                if (prevP && currentP[0] === prevP[0] && currentP[1] === prevP[1]) continue;
                this.ballPath.push(currentP);
                prevP = currentP;
            }

            // If the last iteration is happened in reverse, put the first point at the end of the array
            if (rev) this.ballPath.push(this.curvePoints.at(0));
        }

        this.pixelLength = pixelLength;
        this.multiplier = multiplier;
        this.beatLength = beatLength;

        // Create the visual shape of the slider
        // Ignore curveType for now, straight lines between the curve points is enough here
        this.sliderPath = new Path2D();
        for (const cp of this.curvePoints) {
            this.sliderPath.lineTo(cp[0], cp[1]);
            this.sliderPath.moveTo(cp[0], cp[1]);
        }
        ///////////
        this.prerendered = null;
        this.objURL = "";

        this.firstUpdate = true;

        // The last set of coordinates in the ballPath array is the end position of the slider
        this.visualEndPos = {
            x: this.curvePoints.at(-1)[0],
            y: this.curvePoints.at(-1)[1],
        }

        //https://osu.ppy.sh/wiki/hu/Client/File_formats/osu_%28file_format%29
        this.velocity = 100 / (-1 * v);

        this.oneSlideTime = this.pixelLength / (this.multiplier * 100 * this.velocity) * this.beatLength;
        this.sliderTimeLengthTotal = this.oneSlideTime * slides;
        this.endTime = this.t + this.sliderTimeLengthTotal;

        this.ballSprite = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("sliderb"));
        this.ballSprite.scale = this.ballSize;

        this.followSprite = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("sliderfollowcircle"));
        this.followSprite.scale = this.ballSize;

        this.reverseArrows = [
            new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("reversearrow")),
            new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("reversearrow"))
        ];

        // Scaling all reverse arrows
        this.reverseArrows[0].scale = this.ballSize;
        this.reverseArrows[1].scale = this.ballSize;

        // Set position for the slider start reverse
        this.reverseArrows[0].x = this.x;
        this.reverseArrows[0].y = this.y;

        // Set position for the slider end reverse
        this.reverseArrows[1].x = this.visualEndPos.x;
        this.reverseArrows[1].y = this.visualEndPos.y;

        // Rotate the sprites according to the line angle of the slider segment they are sitting at
        this.reverseArrows[0].rotation = this.game.utils.getLineAngle(
            this.curvePoints.at(0)[0], this.curvePoints.at(0)[1],
            this.curvePoints.at(1)[0], this.curvePoints.at(1)[1]
        ) - (Math.PI * 0.5);

        this.reverseArrows[1].rotation = this.game.utils.getLineAngle(
            this.curvePoints.at(-2)[0], this.curvePoints.at(-2)[1],
            this.visualEndPos.x, this.visualEndPos.y
        ) + (Math.PI * 0.5);

        // The ball movement is controlled by a series of animation in a timeline
        this.ballMovement = new this.game.TL();

        this.moving = false;

        this.currentFollowState = false;
        this.previousFollowState = false;

        // Since we not dealing with curve types (everything is straight lines) there can be significant differences between the calculated end time (using pixelLength)
        // and the total length that the slider ball movement animation calculates (divide the result of "calculated end time" between the slider segments)
        // This is meant to compensate for that
        this.pathTimeScale = this.oneSlideTime / this.calculateTotalSegmentTime();

        // Creating the animations that controls the movement of the sliderball
        // The speed must be constant on every segment
        let currentSegmentTime = 0;
        let curvePoint;
        for (let i = 0; i < this.ballPath.length; i++) {
            curvePoint = this.ballPath[i];
            if (!this.ballPath[i + 1]) break; // Exit when we run out of range
            let segmentLengthPx = 0;
            let segmentLengthMs = 0;

            //if (i === 0) {
            segmentLengthPx = this.game.utils.getDistance(
                curvePoint[0], curvePoint[1],
                this.ballPath[i + 1][0], this.ballPath[i + 1][1]
            ) / this.scale;
            segmentLengthMs = (segmentLengthPx / this.pixelLength) * this.sliderTimeLengthTotal * this.pathTimeScale;
            this.ballMovement.appendAnimation(
                new this.game.ANI(
                    currentSegmentTime,
                    currentSegmentTime + segmentLengthMs,
                    curvePoint[0],
                    this.ballPath[i + 1][0],
                    this.game.EASINGS.Linear,
                    false,
                    "X"
                )
            );
            this.ballMovement.appendAnimation(
                new this.game.ANI(
                    currentSegmentTime,
                    currentSegmentTime + segmentLengthMs,
                    curvePoint[1],
                    this.ballPath[i + 1][1],
                    this.game.EASINGS.Linear,
                    false,
                    "Y"
                )
            )
            currentSegmentTime += segmentLengthMs;
        };

        // Initial fade in
        this.fading = new this.game.ANI(
            this.t - this.timeWindow,
            this.t,
            0,
            0.85
        );

        this.reverseArrowPulse = new this.game.ANI(
            0,
            this.beatLength / this.velocity,
            this.ballSize,
            this.ballSize * 0.8,
            this.game.EASINGS.SineOut,
            true
        );

        this.reverseArrows[1].opacity = 0;
        this.reverseArrows[0].opacity = 0;

        this.followCircleScale = new this.game.ANI();
        this.followCircleFade = new this.game.ANI();

        this.endReached = false;

        this.edgeSounds = edgeSounds;
        this.edgeSets = edgeSets;
        this.hitSound = hitSound;
        this.hitSample = hitSample;

        // Tell the AutoplayController about the end position, the ball following is done in the update method
        if (this.game.autoplay.activated) {
            this.game.autoplay.add(this.endTime, curvePoint[0], curvePoint[1]);
        }
    }

    calculateTotalSegmentTime() {
        let currentSegmentTime = 0;
        for (let i = 0; i < this.curvePoints.length; i++) {
            const curvePoint = this.curvePoints[i];
            if (!this.curvePoints[i + 1]) break;

            let segmentLengthPx = this.game.utils.getDistance(
                curvePoint[0], curvePoint[1],
                this.curvePoints[i + 1][0], this.curvePoints[i + 1][1]
            ) / this.scale;
            let segmentLengthMs = (segmentLengthPx / this.pixelLength) * this.sliderTimeLengthTotal;

            currentSegmentTime += segmentLengthMs;
        };
        return currentSegmentTime;
    }

    /**
     * 
     * @param {Number} currentTime song clock
     */
    update(currentTime) {
        if (this.firstUpdate && !this.prerendered) {
            this.createRender();
            this.firstUpdate = false;
        }

        this.fading.update(currentTime);
        this.reverseArrowPulse.update(currentTime);
        this.followCircleScale.update(this.game.clock);
        this.followCircleFade.update(this.game.clock);

        if (!this.endReached && currentTime >= this.t) this.checkFollowing();

        // Start the movement of the ball when 
        if (!this.moving && currentTime >= this.t && !this.endReached) {
            this.ballMovement.currentTime = currentTime;
            this.ballMovement.play();
            this.moving = true;

            if (this.game.autoplay.activated) this.setFollowState(true);

            //console.log(`beatLength: ${this.beatLength}\npixelLength: ${this.pixelLength}\nvelocity: ${this.velocity}\nmultiplier: ${this.multiplier}\none slide t: ${this.oneSlideTime}`)
        }



        // add +1 to edgeSoundIndex because 0 should play when the slider head is clicked
        let edgeSoundIndex = Math.floor(this.ballMovement.timelineCurrentTime / this.oneSlideTime);
        if (edgeSoundIndex !== this.currentSoundPlayed && this.currentFollowState) {

            this.playEdgeSound(edgeSoundIndex);

            this.game.comboMeter.addHit(true);
            this.game.accuracyMeter.addHit(true, 0);

            this.currentSoundPlayed = edgeSoundIndex;

            this.game.scoreMeter.add(4);
            this.slidesLeft--;
        }

        // Display only the reverse arrow sprite that has to be displayed at a given time
        if (this.slidesLeft > 1 && !this.endReached) {
            let a = (edgeSoundIndex & 1) === 1;
            this.reverseArrows[0].opacity = a ? this.fading.currentValue : 0; // start
            this.reverseArrows[1].opacity = a ? 0 : this.fading.currentValue; // end
        } else {
            this.reverseArrows[0].opacity = 0; // start
            this.reverseArrows[1].opacity = 0; // end
        }

        // Fade out when reached endTime
        if (!this.endReached && currentTime >= this.endTime) {

            this.fading = new this.game.ANI(
                this.endTime,
                this.endTime + this.fadeOutMs,
                0.85,
                0,
                this.game.EASINGS.Linear
            );

            this.endReached = true;

            if (this.currentFollowState) {
                this.game.comboMeter.addHit(true);
                this.game.accuracyMeter.addHit(true, 0);
                this.playEdgeSound(edgeSoundIndex + 1);
                this.game.scoreMeter.add(4);
            }

            this.setFollowState(false);
        }

        this.ballMovement.update(currentTime);
        this.ballSprite.x = this.ballMovement.getValueOf("X") || this.ballPath.at(-1)[0];
        this.ballSprite.y = this.ballMovement.getValueOf("Y") || this.ballPath.at(-1)[1];
        this.ballSprite.opacity = currentTime < this.endTime ? this.fading.currentValue : 0;

        this.followSprite.x = this.ballMovement.getValueOf("X") || this.ballSprite.x;
        this.followSprite.y = this.ballMovement.getValueOf("Y") || this.ballSprite.y;
        this.followSprite.scale = this.followCircleScale.currentValue;
        this.followSprite.opacity = this.followCircleFade.currentValue;

        this.reverseArrows.forEach((r) => {
            r.scale = this.reverseArrowPulse.currentValue;
        });



        // When autoplay is enabled and the slider ball starts moving, move the cursor along with it
        // It is only possible because here we override the cursor position that the AutoplayController sets on updating
        // This way we not have to create keyframes for slider following
        if (this.game.autoplay.activated && this.ballMovement.playing) {
            this.game.cursor.setPosition(Math.floor(this.ballSprite.x), Math.floor(this.ballSprite.y));
        }

        // Will this going to help reduce memory usage? 
        if (currentTime > this.endTime + this.fadeOutMs) {
            this.destroyRender();
        }
    }

    render() {
        this.game.ctx.save();

        this.game.ctx.globalAlpha = this.fading.currentValue;

        if (this.prerendered !== null) this.game.ctx.drawImage(this.prerendered, 0, 0);

        if (this.moving) this.ballSprite.render(this.game.ctx);
        this.followSprite.render(this.game.ctx);

        this.reverseArrows.forEach((r) => { r.render(this.game.ctx) });

        this.game.ctx.restore();
    }

    tap() { }

    /**
     * 
     * @param {Boolean} state is the cursor is in the follow region?
     * @returns 
     */
    setFollowState(state) {
        this.currentFollowState = state;

        // Do things only on state change
        if (this.currentFollowState === this.previousFollowState) return;

        if (state) {
            this.followCircleScale = new this.game.ANI(
                this.game.clock,
                this.game.clock + 150,
                this.ballSize * 0.75,
                this.ballSize,
                this.game.EASINGS.SineOut
            );
            this.followCircleFade = new this.game.ANI(
                this.game.clock,
                this.game.clock + 50,
                0.25,
                1,
                this.game.EASINGS.Linear
            );
        } else {
            this.followCircleScale = new this.game.ANI(
                this.game.clock,
                this.game.clock + 150,
                this.ballSize,
                this.ballSize * 0.75,
                this.game.EASINGS.SineIn
            );
            this.followCircleFade = new this.game.ANI(
                this.game.clock,
                this.game.clock + 150,
                1,
                0,
                this.game.EASINGS.Linear
            );
        }

        this.previousFollowState = this.currentFollowState;
    }

    playEdgeSound(index = 0) {
        // an edge sound at `index` should never be undefined, but who knows
        let edgeSoundTest = typeof this.edgeSounds !== "undefined" && typeof this.edgeSounds[index] !== "undefined";

        // passes the undefined check
        if (edgeSoundTest) {
            this.game.hitSoundPlayer.playHitSound(
                this.hitSample.normalSet,
                this.hitSample.additionSet,
                this.edgeSounds[index]
            );
        } else {
            this.game.hitSoundPlayer.playHitSound(
                this.hitSample.normalSet,
                this.hitSample.additionSet,
                this.hitSound
            );
        }
    }

    createRender() {
        // Draw the sliders shape onto the offscreen canvas
        this.game.offscreenCtx.reset();
        this.game.offscreenCtx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        this.game.offscreenCtx.lineCap = 'round';

        this.game.offscreenCtx.shadowColor = "black";
        this.game.offscreenCtx.shadowBlur = 4;

        // Slider border      
        this.game.offscreenCtx.strokeStyle = `rgb(140, 140, 140)`;
        this.game.offscreenCtx.lineWidth = this.rad * 2;
        this.game.offscreenCtx.stroke(this.sliderPath);

        this.game.offscreenCtx.shadowBlur = 0;


        // Slider track
        this.game.offscreenCtx.strokeStyle = `rgb(10, 10, 10)`;
        this.game.offscreenCtx.lineWidth = this.rad * 1.8;
        this.game.offscreenCtx.stroke(this.sliderPath);

        //
        if (this.game.CONFIG.betterLookingSliders) {
            this.game.offscreenCtx.globalCompositeOperation = "lighter"; // this composite operation removes the black stroke and adds the color of the shadow to the slider track color
            this.game.offscreenCtx.strokeStyle = `rgb(0, 0, 0)`;
            this.game.offscreenCtx.shadowColor = "rgba(255, 255, 255, 0.75)";
            this.game.offscreenCtx.lineWidth = this.rad / 3;
            this.game.offscreenCtx.shadowBlur = this.rad * 0.75;
            this.game.offscreenCtx.stroke(this.sliderPath);
            this.game.offscreenCtx.shadowBlur = 0;
        }
        this.game.offscreenCanvas.convertToBlob({ type: "image/png" }).then((b) => {
            let img = new Image();
            img.decoding = "async";
            img.src = this.objURL = URL.createObjectURL(b);
            this.prerendered = img;
        });
    }

    destroyRender() {
        URL.revokeObjectURL(this.objURL);
        this.prerendered = null;
    }

    checkFollowing() {
        if (this.game.autoplay.activated) return;

        let cursorToBallDist = this.game.utils.getDistance(this.game.cursor.currentX, this.game.cursor.currentY, this.ballSprite.x, this.ballSprite.y);
        let inputDown = this.game.inputValidator.isAnyInputDown();

        if (!this.currentFollowState && inputDown) {
            if (cursorToBallDist < this.rad) {
                this.setFollowState(true);
            }
        }

        if (this.currentFollowState && inputDown) {
            if (cursorToBallDist < this.rad * 2) {
                this.setFollowState(true);
            } else {
                this.setFollowState(false);
            }
        }

        if (!inputDown) {
            this.setFollowState(false);
        }
    }
}