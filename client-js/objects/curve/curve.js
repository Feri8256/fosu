import { Bezier2 } from "./bezier2.js";
import { CircumscribedCircle } from "./circumscribedCircle.js";
import { Linear } from "./linear.js";

export class Curve {
    /**
     * 
     * @param {[Point]} curvePoints 
     * @param {String} curveType 
     * @param {Number} pixelLength 
     */
    constructor(curvePoints, curveType, pixelLength) {
        this.curvePoints = curvePoints;
        this.curveType = curveType;
        this.pixelLength = pixelLength;

        this.curve = null;

        switch (this.curveType) {
            case "P":
                this.curve = new CircumscribedCircle(this.curvePoints, pixelLength);
                break;

            case "B":
                this.curve = new Bezier2(this.curvePoints, pixelLength);
                break;
            
            case "L":
            case "C":    
                this.curve = new Linear(this.curvePoints);
                break;
        }

        this.canvasPath = new Path2D();
        for (const cp of this.curve.path) {
            this.canvasPath.lineTo(cp.x, cp.y);
            this.canvasPath.moveTo(cp.x, cp.y);
        }

        this.prerendered = null;
        this.objURL = "";
    }

    getPath() {
        return this.curve.getPath();
    }

    /**
     * 
     * @param {OffscreenCanvasRenderingContext2D} offscreenCtx 
     * @param {Boolean} highQuality
     * @param {String} borderColor "255,255,255"
     * @param {String} trackColor "255,255,255"
     * @param {Number} radius
     */
    createRender(offscreenCtx, highQuality, borderColor, trackColor, radius) {
        offscreenCtx.reset();
        offscreenCtx.clearRect(0, 0, offscreenCtx.canvas.width, offscreenCtx.canvas.height);
        offscreenCtx.lineCap = 'round';

        offscreenCtx.shadowColor = "black";
        offscreenCtx.shadowBlur = 4;

        // Slider border      
        offscreenCtx.strokeStyle = `rgb(${borderColor})`;
        offscreenCtx.lineWidth = radius * 2;
        offscreenCtx.stroke(this.canvasPath);

        offscreenCtx.shadowBlur = 0;

        // Slider track
        offscreenCtx.strokeStyle = `rgb(${trackColor})`;
        offscreenCtx.lineWidth = radius * 1.8;
        offscreenCtx.stroke(this.canvasPath);

        //
        if (highQuality) {
            offscreenCtx.globalCompositeOperation = "lighter"; // this composite operation removes the black stroke and adds the color of the shadow to the slider track color
            offscreenCtx.strokeStyle = `rgb(0, 0, 0)`;
            offscreenCtx.shadowColor = `rgba(255, 255, 255, 0.75)`;
            offscreenCtx.lineWidth = radius / 4;
            offscreenCtx.shadowBlur = radius * 0.65;
            offscreenCtx.stroke(this.canvasPath);
            offscreenCtx.shadowBlur = 0;
        }
        offscreenCtx.canvas.convertToBlob({ type: "image/png" }).then((b) => {
            let img = new Image();
            img.decoding = "async";
            img.src = this.objURL = URL.createObjectURL(b);
            this.prerendered = img;
        });
    }

    destroyRender() {
        URL.revokeObjectURL(this.objURL);
        this.objURL = undefined;
        this.prerendered = undefined;
    }
}
