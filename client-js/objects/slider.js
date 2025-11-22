import { HitObject } from "./hitObject.js";
import { Curve } from "./curve/curve.js";
import { SliderBallController } from "./sliderBallMovement.js";
import { utils } from "../utils.js";

export class Slider extends HitObject {
    constructor(game, position, time, scaling, circleSize, hitSample, hitSound, curvePoints, curveType, slides = 1, pixelLength = 0, multiplier = 1, velocity = -100, beatLength = 0, edgeSounds, edgeSets, timeWindow) {
        super(game, position, time, scaling, circleSize, hitSample, hitSound);

        this.curvePoints = [position, ...curvePoints];
        this.curveType = curveType;
        this.slides = slides;
        this.slidesLeft = slides;
        this.currentSlide = 0;

        this.pixelLength = pixelLength;
        this.multiplier = multiplier;
        this.velocity = velocity;
        this.beatLength = beatLength;
        this.edgeSounds = edgeSounds;
        this.edgeSets = edgeSets;
        this.timeWindow = timeWindow;

        this.fadeOutMs = 150;
        this.endReached = false;
        this.firstUpdate = true;

        this.currentFollowState = false;
        this.previousFollowState = false;


        this.rad = (118 / this.circleSize) * this.scaling;
        this.ballScale = this.scaling / (this.circleSize * 0.5);

        this.v = 100 / (-1 * this.velocity);
        this.oneSlideTime = this.pixelLength / (this.multiplier * 100 * this.v) * this.beatLength;
        this.sliderTimeLengthTotal = this.oneSlideTime * slides;
        this.endTime = this.time + this.sliderTimeLengthTotal;

        this.fading = new this.game.ANI(
            this.time - timeWindow, this.time,
            0, 1
        );

        this.followCircleAnimation = new this.game.ANI();
        this.pulseAnimation = new this.game.ANI(
            0, this.beatLength / this.v,
            this.ballScale, this.ballScale * 0.8,
            this.game.EASINGS.SineOut,
            true
        );


        this.curve = new Curve(this.curvePoints, this.curveType, this.pixelLength * this.scaling);
        this.curvePath = this.curve.getPath();
        this.ballController = new SliderBallController(this.curvePath, this.slides, this.pixelLength, this.oneSlideTime, this.time, this.endTime, this.scaling);

        this.startPoint = this.curvePath.at(0);
        this.endPoint = this.curvePath.at(-1);


        this.ballSprite = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("sliderb"));
        this.ballSprite.scale = this.ballScale;
        this.ballSprite.x = this.startPoint.x
        this.ballSprite.y = this.startPoint.y

        this.followSprite = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("sliderfollowcircle"));
        this.followSprite.scale = this.ballScale;
        this.followSprite.x = this.startPoint.x;
        this.followSprite.y = this.startPoint.y;

        this.reverseArrows = [
            new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("reversearrow")),
            new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("reversearrow"))
        ];

        this.reverseArrows[1].opacity = 0;
        this.reverseArrows[0].opacity = 0;

        // Scaling all reverse arrows
        this.reverseArrows[0].scale = this.ballScale;
        this.reverseArrows[1].scale = this.ballScale;

        // Set position for the slider start reverse
        this.reverseArrows[0].x = position.x;
        this.reverseArrows[0].y = position.y;

        // Set position for the slider end reverse
        this.reverseArrows[1].x = this.endPoint.x;
        this.reverseArrows[1].y = this.endPoint.y;

        this.reverseArrows[0].rotation = utils.getLineAngleP(this.startPoint, this.curvePath.at(1)) - (Math.PI * 0.5);
        this.reverseArrows[1].rotation = utils.getLineAngleP(this.curvePath.at(-2), this.endPoint) + (Math.PI * 0.5);

        if (this.game.autoplay.activated) {
            let lastBallPosition = this.ballController.ballPathPoints.at(-1);
            this.game.autoplay.add(this.endTime, lastBallPosition.x, lastBallPosition.y);
        }

    }

    update(currentTime) {
        if (this.firstUpdate) {
            this.curve.createRender(
                this.game.offscreenCtx,
                this.game.CONFIG.betterLookingSliders,
                "255,255,255",
                "10,10,10",
                this.rad
            );
            this.firstUpdate = false;
        }

        this.fading.update(currentTime);
        this.followCircleAnimation.update(this.game.clock);
        this.pulseAnimation.update(currentTime);

        let p = this.ballController.getPositionAtTime(currentTime);

        this.ballSprite.rotation = utils.getLineAngle(this.ballSprite.x, this.ballSprite.y, p.x, p.y) - (Math.PI * 0.5);
        this.ballSprite.x = p.x;
        this.ballSprite.y = p.y;
        this.ballSprite.opacity = this.ballController.isMoving() ? 1 : 0;

        this.followSprite.x = p.x;
        this.followSprite.y = p.y;
        this.followSprite.opacity = this.currentFollowState ? this.followCircleAnimation.amount : 1 - this.followCircleAnimation.amount;
        this.followSprite.scale = this.followCircleAnimation.currentValue;

        if (this.game.autoplay.activated && currentTime >= this.time && !this.endReached) {
            this.game.cursor.setPosition(this.ballSprite.x, this.ballSprite.y);
            this.setFollowState(true);
        }

        let edgeIndex = utils.clamp(Math.floor((currentTime - this.time) / this.oneSlideTime), 0, this.slides);
        if (edgeIndex !== this.currentSlide) {
            this.slidesLeft--;
            this.currentSlide = edgeIndex;
            if (this.currentFollowState) {
                this.playEdgeSound(edgeIndex);
                this.reverseArrowPopAni = new this.game.ANI(currentTime, currentTime + 200, this.ballScale, this.ballScale * 1.2, this.game.EASINGS.SineOut);
            }
        }

        if (this.slidesLeft > 1 && !this.endReached) {
            let a = (this.currentSlide & 1) === 1;
            this.reverseArrows[0].opacity = a ? this.fading.currentValue : 0; // start
            this.reverseArrows[1].opacity = a ? 0 : this.fading.currentValue; // end

            this.reverseArrows[0].scale = this.pulseAnimation.currentValue;
            this.reverseArrows[1].scale = this.pulseAnimation.currentValue;

        } else {
            this.reverseArrows[0].opacity = 0; // start
            this.reverseArrows[1].opacity = 0; // end
        }

        if (!this.endReached) this.checkFollowing();

        if (currentTime >= this.endTime && !this.endReached) {
            this.fading = new this.game.ANI(
                currentTime,
                currentTime + this.fadeOutMs,
                1, 0
            );
            this.endReached = true;
            if (this.currentFollowState) this.setFollowState(false);
        }

        if (currentTime > this.endTime + this.fadeOutMs) {
            this.curve.destroyRender();
        }
    }

    render() {
        this.game.ctx.save();

        this.game.ctx.globalAlpha = this.fading.currentValue;

        if (this.curve.prerendered) {
            this.game.ctx.drawImage(this.curve.prerendered, 0, 0);
        }

        this.reverseArrows.forEach((ra) => { ra.render(this.game.ctx); })

        this.ballSprite.render(this.game.ctx);

        this.followSprite.render(this.game.ctx);

        this.game.ctx.restore();
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

    checkFollowing() {
        let cursorToBallDist = utils.getDistance(this.game.cursor.currentX, this.game.cursor.currentY, this.ballSprite.x, this.ballSprite.y);
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

    /**
     * 
     * @param {Boolean} state is the cursor is in the follow region?
     * @returns 
     */
    setFollowState(state) {

        // Do things only on state change
        if (state === this.previousFollowState) return;

        this.currentFollowState = state;

        if (state) {
            this.followCircleAnimation = new this.game.ANI(
                this.game.clock,
                this.game.clock + 150,
                this.ballScale * 0.75,
                this.ballScale,
                this.game.EASINGS.SineOut
            );

        } else {
            this.followCircleAnimation = new this.game.ANI(
                this.game.clock,
                this.game.clock + 150,
                this.ballScale,
                this.ballScale * 0.75,
                this.game.EASINGS.SineIn
            );

        }

        this.previousFollowState = this.currentFollowState;
    }

}

