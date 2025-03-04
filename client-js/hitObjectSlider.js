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
        beatLength
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

        // Put the start x and y coordinates to the begining of the curvePoints array then append the rest of them
        this.curvePoints = [[this.x, this.y], ...curvePoints];
        this.slides = slides;

        //this.ballPath = [];
        //for (let index = 0; index < this.slides; index++) {
        //    let rev = index > 0 && index - 1 % 2 === 0;

        //    if (rev) this.ballPath.push(...this.curvePoints.reverse())
        //    else this.ballPath.push(...this.curvePoints)
        //}
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


        // The last set of coordinates in the curvePoints array is the end position of the slider
        this.sliderEndPos = {
            x: this.curvePoints.at(-1)[0],
            y: this.curvePoints.at(-1)[1],
        }

        //https://osu.ppy.sh/wiki/hu/Client/File_formats/osu_%28file_format%29

        this.velocity = 1;
        if (v === -100) {
            this.velocity = 1;
        } else if (v < -100) {
            this.velocity = (-1 * v / 100) / multiplier;
        } else if (v > -100) {
            // ???
            this.velocity = (multiplier / (1 - (v / 100))) * multiplier;
        }

        this.oneSlideTime = this.pixelLength / (this.multiplier * 100 * this.velocity) * this.beatLength;
        this.sliderTimeLengthTotal = this.oneSlideTime;
        this.endTime = this.t + this.sliderTimeLengthTotal;

        this.ballSprite = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("sliderb"));
        this.ballSprite.scale = this.ballSize;

        this.followSprite = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("sliderfollowcircle"));
        this.followSprite.scale = this.ballSize;

        //this.reverseArrows = [
        //    new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("reversearrow")),
        //    new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("reversearrow"))
        //];

        // Scaling all reverse arrows
        //this.reverseArrows[0].scale = this.ballSize;
        //this.reverseArrows[1].scale = this.ballSize;

        // Set position for the slider start reverse
        //this.reverseArrows[0].x = this.x;
        //this.reverseArrows[0].y = this.y;

        // Set position for the slider end reverse
        //this.reverseArrows[1].x = this.sliderEndPos.x;
        //this.reverseArrows[1].y = this.sliderEndPos.y;

        // Rotate the sprites according to the line angle of the slider segment they are sitting at
        //this.reverseArrows[0].rotation = this.calculateLineAngle({ x: this.curvePoints.at(0)[0], y: this.curvePoints.at(0)[1] }, { x: this.curvePoints.at(1)[0], y: this.curvePoints.at(1)[1] }) - (Math.PI * 0.5);
        //this.reverseArrows[1].rotation = this.calculateLineAngle({ x: this.curvePoints.at(-2)[0], y: this.curvePoints.at(-2)[1] }, this.sliderEndPos) + (Math.PI * 0.5);

        // The ball movement is controlled by a series of animation in a timeline
        this.ballMovement = new this.game.TL();

        this.moving = false;
        this.following = false;


        // Since we not dealing with curve types (everything is straight lines) there can be significant differences between the calculated end time (using pixelLength)
        // and the total length that the slider ball movement animation calculates (divide the result of "calculated end time" between the slider segments)
        // This is meant to compensate for that
        this.pathTimeScale = this.oneSlideTime / this.calculateTotalSegmentTime();

        // Creating the animations that controls the movement of the sliderball
        // The speed must be constant on every segment
        let currentSegmentTime = 0;
        for (let i = 0; i < this.curvePoints.length; i++) {
            const curvePoint = this.curvePoints[i];
            if (!this.curvePoints[i + 1]) break; // Exit when we run out of range
            let segmentLengthPx = 0;
            let segmentLengthMs = 0;

            //if (i === 0) {
            segmentLengthPx = this.calculateDistance({ x: curvePoint[0], y: curvePoint[1] }, { x: this.curvePoints[i + 1][0], y: this.curvePoints[i + 1][1] }) / this.scale;
            segmentLengthMs = (segmentLengthPx / this.pixelLength) * this.sliderTimeLengthTotal * this.pathTimeScale;
            this.ballMovement.appendAnimation(
                new this.game.ANI(
                    currentSegmentTime,
                    currentSegmentTime + segmentLengthMs,
                    curvePoint[0],
                    this.curvePoints[i + 1][0],
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
                    this.curvePoints[i + 1][1],
                    this.game.EASINGS.Linear,
                    false,
                    "Y"
                )
            )
            currentSegmentTime += segmentLengthMs;
        };

        this.fading = new this.game.ANI(
            this.t - this.timeWindow,
            this.t,
            0,
            1,
            this.game.EASINGS.Linear
        );

        //this.reverseArrowPulse = new this.game.ANI(
        //    0,
        //    this.beatLength * 2,
        //    this.ballSize,
        //    this.ballSize * 0.8,
        //    this.game.EASINGS.SineOut,
        //    true
        //)


        this.endSoundPlayed = false;
    }

    calculateDistance(pointA, pointB) {
        let distX = pointA.x - pointB.x;
        let distY = pointA.y - pointB.y;
        let dist = Math.sqrt(Math.abs(distX * distX) + Math.abs(distY * distY));
        return dist;
    }

    calculateLineAngle(pointA, pointB) {
        let diffX = pointA.x - pointB.x;
        let diffY = pointA.y - pointB.y;
        return - Math.atan2(diffX, diffY);
    }

    calculateTotalSegmentTime() {
        let currentSegmentTime = 0;
        for (let i = 0; i < this.curvePoints.length; i++) {
            const curvePoint = this.curvePoints[i];
            if (!this.curvePoints[i + 1]) break;

            let segmentLengthPx = this.calculateDistance({ x: curvePoint[0], y: curvePoint[1] }, { x: this.curvePoints[i + 1][0], y: this.curvePoints[i + 1][1] }) / this.scale;
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
        this.fading.update(currentTime);
        //this.reverseArrowPulse.update(currentTime);

        // Start the movement of the ball when 
        if (!this.moving && currentTime >= this.t) {
            this.ballMovement.currentTime = currentTime;
            this.ballMovement.play();
            this.moving = true;
            //console.log(`beatLength: ${this.beatLength}\npixelLength: ${this.pixelLength}\nvelocity: ${this.velocity}\nmultiplier: ${this.multiplier}\none slide t: ${this.oneSlideTime}`)
        }

        if (!this.endSoundPlayed & currentTime >= this.endTime) {
            this.game.auMgr.playAudioClip("normal-hitnormal");
            this.endSoundPlayed = true;

            this.fading = new this.game.ANI(
                this.endTime,
                this.endTime + 150,
                1,
                0,
                this.game.EASINGS.Linear
            );
        }

        this.ballMovement.update(currentTime);
        this.ballSprite.x = this.ballMovement.getValueOf("X") || this.sliderEndPos.x;
        this.ballSprite.y = this.ballMovement.getValueOf("Y") || this.sliderEndPos.y;
        this.ballSprite.opacity = this.fading.currentValue;

        this.followSprite.x = this.ballMovement.getValueOf("X") || this.sliderEndPos.x;
        this.followSprite.y = this.ballMovement.getValueOf("Y") || this.sliderEndPos.y;

        //this.reverseArrows.forEach((r) => {
        //    r.scale = this.reverseArrowPulse.currentValue;
        //});
    }

    render() {
        this.game.ctx.save();

        this.game.ctx.globalAlpha = this.fading.currentValue;

        this.game.ctx.lineCap = 'round';

        this.game.ctx.shadowColor = "black";
        this.game.ctx.shadowBlur = 4;

        // Slider border      
        this.game.ctx.strokeStyle = `rgb(224, 224, 224)`;
        this.game.ctx.lineWidth = this.rad * 2;
        this.game.ctx.stroke(this.sliderPath);

        this.game.ctx.shadowBlur = 0;


        // Slider track
        this.game.ctx.strokeStyle = `rgb(55, 55, 55)`;
        this.game.ctx.lineWidth = this.rad * 1.8;
        this.game.ctx.stroke(this.sliderPath);

        this.game.ctx.globalCompositeOperation = "source-over";


        if (this.moving) this.ballSprite.render(this.game.ctx);
        if (this.following) this.followSprite.render(this.game.ctx);

        //this.reverseArrows.forEach((r) => { r.render(this.game.ctx) });

        this.game.ctx.restore();
    }

    tap() { }
}