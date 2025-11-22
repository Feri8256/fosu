import { Timeline, Animation, EASING } from "../animationEngine.js";
import { utils } from "../utils.js";

export class SliderBallController {
    constructor(curvePath, slides, pixelLength, oneSlideLengthMs, startTime, endTime, scaling) {
        this.curvePath = curvePath;
        this.startTime = startTime;
        this.endTime = endTime;
        this.scaling = scaling;
        this.pixelLength = pixelLength;
        this.oneSlideTime = oneSlideLengthMs;

        this.moving = false;

        this.lastPosition = { x: 0, y: 0 };

        this.ballMovement = new Timeline();

        this.ballPathPoints = [];
        for (let slide = 1; slide < slides + 1; slide++) {
            let rev = slide % 2 === 0;
            let prevP;

            // Copy the curve points in normal or in reverse order
            for (
                let i = rev ? (curvePath.length - 1) : 0;
                rev ? (i > 0) : (i < curvePath.length);
                rev ? (i--) : (i++)
            ) {
                const currentP = curvePath.at(i);
                if (prevP && currentP?.x === prevP?.x && currentP?.y === prevP?.y) continue;
                this.ballPathPoints.push(currentP);
                prevP = currentP;
            }

            // If the last iteration is happened in reverse, put the first point at the end of the array
            if (rev) this.ballPathPoints.push(curvePath.at(0));
        }



        this.pathTimeScale = oneSlideLengthMs / this.calculateTotalSegmentTime();

        // Creating the animations that controls the movement of the sliderball
        // The speed must be constant on every segment
        let currentSegmentTime = 0;
        let curvePoint;
        for (let i = 0; i < this.ballPathPoints.length; i++) {
            curvePoint = this.ballPathPoints[i];
            if (!this.ballPathPoints[i + 1]) break; // Exit when we run out of range
            let segmentLengthPx = 0;
            let segmentLengthMs = 0;

            //if (i === 0) {
            segmentLengthPx = utils.getDistance(
                curvePoint.x, curvePoint.y,
                this.ballPathPoints[i + 1].x, this.ballPathPoints[i + 1].y
            ) / this.scaling;
            //segmentLengthMs = (segmentLengthPx / this.pixelLength) * this.sliderTimeLengthTotal * this.pathTimeScale;
            segmentLengthMs = (segmentLengthPx / pixelLength) * oneSlideLengthMs * this.pathTimeScale;
            this.ballMovement.appendAnimation(
                new Animation(
                    currentSegmentTime,
                    currentSegmentTime + segmentLengthMs,
                    curvePoint.x,
                    this.ballPathPoints[i + 1].x,
                    EASING.Linear,
                    false,
                    "X"
                )
            );
            this.ballMovement.appendAnimation(
                new Animation(
                    currentSegmentTime,
                    currentSegmentTime + segmentLengthMs,
                    curvePoint.y,
                    this.ballPathPoints[i + 1].y,
                    EASING.Linear,
                    false,
                    "Y"
                )
            )
            currentSegmentTime += segmentLengthMs;
        };
    }

    calculateTotalSegmentTime() {
        let currentSegmentTime = 0;
        for (let i = 0; i < this.curvePath.length; i++) {
            const curvePoint = this.curvePath[i];
            if (!this.curvePath[i + 1]) break;

            let segmentLengthPx = utils.getDistance(
                curvePoint.x, curvePoint.y,
                this.curvePath[i + 1].x, this.curvePath[i + 1].y
            ) / this.scaling;
            //let segmentLengthMs = (segmentLengthPx / this.pixelLength) * this.sliderTimeLengthTotal;
            let segmentLengthMs = (segmentLengthPx / this.pixelLength) * this.oneSlideTime;

            currentSegmentTime += segmentLengthMs;
        };
        return currentSegmentTime;
    }

    /**
     * 
     * @param {Number} t 
     */
    getPositionAtTime(t) {
        this.ballMovement.update(t);

        if (t >= this.startTime && t < this.endTime && !this.ballMovement.playing) {
            this.ballMovement.play();
            this.moving = true;
        }

        if (t > this.endTime) {
            this.moving = false;
        }

        let checkX = this.ballMovement.getValueOf("X");
        let checkY = this.ballMovement.getValueOf("Y");

        if (checkX != undefined && checkY != undefined) {
            this.lastPosition.x = checkX;
            this.lastPosition.y = checkY;
        }

        return this.lastPosition;
    }

    isMoving() {
        return this.moving;
    }

}