export class ReplayManager {
    constructor(game) {
        this.game = game;
        this.currentReplayId = "";

        this.currentTime = 0;
        this.timeStep = 0;

        this.xOffset = 0;
        this.yOffset = 0;
        this.xScale = 1;
        this.yScale = 1;

        this.frameCaptureIntervalMs = 16;
        this.eventAccumulatorLimit = 128;
        this.chunkRequestIntervalMs = 3000;

        this.lastChunkReceivedAtMs = 0;
        this.sendChunkRequestAfterMs = 0;
        this.lastCaptureAt = 0;

        this.currentMode = 2;

        this.eventAccumulator = [];
        this.inputEvents = [];
        this.lastInputEventAt = 0;

        this.movementX = [];
        this.movementY = [];
        this.movementXtoUpdate = [];
        this.movementYtoUpdate = [];

        this.lastTimestamp = 0;

        this.lastCursorX = 0;
        this.lastCursorY = 0;

        this.lastCursorT = 0;

        this.convertedCursorX = 0
        this.convertedCursorY = 0

        this.game.socket.on("replayChunk", (arr) => {
            this.onReplayChunkReceive(arr);
        });

    }

    /**
     * 
     * @param {Number} currentTime 
     */
    update(currentTime) {
        this.timeStep = currentTime - this.currentTime;
        this.currentTime = currentTime;

        switch (this.currentMode) {
            case 0:
                this.convertedCursorX = this.game.utils.convertRange(this.game.cursor.currentX, this.xOffset, (512 * this.xScale) - this.xOffset, 0, 512);
                this.convertedCursorY = this.game.utils.convertRange(this.game.cursor.currentY, this.yOffset, (384 * this.yScale) - this.yOffset, 0, 384);
                // this means the map paused
                if (currentTime === this.lastTimestamp) break;

                // cursor still at a position
                if (this.game.cursor.currentX === this.lastCursorX && this.game.cursor.currentY === this.lastCursorY) break;

                if (currentTime - this.lastCaptureAt > this.frameCaptureIntervalMs) {
                    this.eventAccumulator.push({
                        t: currentTime,
                        x: this.convertedCursorX,
                        y: this.convertedCursorY
                    });

                    this.lastCaptureAt = currentTime;

                    if (this.eventAccumulator.length > this.eventAccumulatorLimit) this.sendData();
                }
                this.lastCursorX = this.game.cursor.currentX;
                this.lastCursorY = this.game.cursor.currentY;
                this.lastTimestamp = currentTime;

                break;

            case 1:


                //let currentInputEvent = this.inputEvents.find((ie) => {
                //    return ie.t <= currentTime;
                //})//.at(-1);

                /*let currentInputEvent = [0, 0, 0];
                let steppedCurrentTime = currentTime;
                while (steppedCurrentTime < currentTime + this.game.deltaTime) {

                    currentInputEvent = this.inputEvents.filter((ie) => {
                        return ie.t <= steppedCurrentTime;
                    }).at(-1);

                    steppedCurrentTime += 1;

                    if (this.game.deltaTime > 500) break;
                }*/

                /*let x = this.game.cursor.currentX;
                let y = this.game.cursor.currentY;

                this.movementXtoUpdate = this.movementX.filter((mx) => { return mx.startTime <= currentTime && mx.endTime >= currentTime });
                this.movementXtoUpdate.forEach((m) => {
                    m.update(currentTime);
                    x = m.currentValue;
                });
                this.movementYtoUpdate = this.movementY.filter((my) => { return my.startTime <= currentTime && my.endTime >= currentTime });
                this.movementYtoUpdate.forEach((n) => {
                    n.update(currentTime);
                    y = n.currentValue;
                });

                this.game.cursor.setPosition(x, y);
                */

                if (this.currentTime > this.sendChunkRequestAfterMs) {
                    this.game.socket.emit("getReplayChunk", this.currentTime, this.chunkRequestIntervalMs - this.game.deltaTime);
                    this.sendChunkRequestAfterMs = this.currentTime + this.chunkRequestIntervalMs;
                }

                this.movementX = this.movementX.filter((ax) => { return ax.amount !== 1 });
                this.movementY = this.movementY.filter((ay) => { return ay.amount !== 1 });

                this.lastTimestamp = currentTime;

                break;

            case 2:

                break;
        }

    }

    /**
     * 
     * @param {Number} t 
     * @returns 
     */
    getTappingEvents(t) {
        return this.inputEvents.filter((ie) => {
            return Math.floor(ie.t) <= Math.ceil(t);
        }).at(-1);
    }

    /**
     * 
     * @param {Number} t 
     * @returns 
     */
    updateCursorPosition(t) {
        let x = this.game.cursor.currentX;
        let y = this.game.cursor.currentY;

        this.movementXtoUpdate = this.movementX.filter((mx) => { return mx.startTime <= t && mx.endTime >= t });
        this.movementXtoUpdate.forEach((m) => {
            m.update(t);
            x = m.currentValue;
        });
        this.movementYtoUpdate = this.movementY.filter((my) => { return my.startTime <= t && my.endTime >= t });
        this.movementYtoUpdate.forEach((n) => {
            n.update(t);
            y = n.currentValue;
        });

        this.game.cursor.setPosition(x, y);
    }

    /**
     * 
     * @param {*} mode 0: capture, 1: replay, 2: no action
     */
    setMode(mode) {
        this.currentMode = mode;
        this.movementX.length = 0;
        this.movementY.length = 0;
        this.currentReplayId = "";
        this.currentTime = 0;
        this.lastCaptureAt = 0;
        this.lastTimestamp = 0;
        this.eventAccumulator.length = 0;
        this.inputEvents.length = 0;
        this.lastInputEventAt = 0;
        this.lastChunkReceivedAtMs = 0;
        this.sendChunkRequestAfterMs = 0;
        this.lastCursorX = 0;
        this.lastCursorY = 0;
        this.lastCursorT = 0;
    }

    /**
     * 
     * @param {Number} xOffset 
     * @param {Number} xScale 
     * @param {Number} yOffset 
     * @param {Number} yScale 
     */
    setupPlayfieldDimensions(xOffset, xScale, yOffset, yScale) {
        this.xOffset = xOffset;
        this.xScale = xScale;
        this.yOffset = yOffset;
        this.yScale = yScale;
    }

    startCapture(playerName, beatmapHash, replayId) {
        this.setMode(0);
        this.currentReplayId = replayId;

        this.game.socket.emit("gameplayEventsCaptureStart", { playerName, beatmapHash, replayId });

    }

    stopCapture() {
        if (this.eventAccumulator.length > 0) this.game.socket.emit("gameplayEventsCapture", this.eventAccumulator);
        this.setMode(2);
        this.game.socket.emit("gameplayEventsCaptureStop", "a");
        this.eventAccumulator.length = 0;
    }

    sendLoadCommand(replayId) {

    }

    sendStopCommand() {

    }

    sendData() {
        //console.log(JSON.stringify(this.eventAccumulator));
        this.game.socket.emit("gameplayEventsCapture", this.eventAccumulator);
        this.eventAccumulator.length = 0;
    }

    addInputEvents(arr = [false, false, false], t = 0) {
        this.eventAccumulator.push(
            { t, k: arr.map((i) => { return i ? 1 : 0 }) },
            { t, x: this.convertedCursorX, y: this.convertedCursorY }
        );
        this.lastCursorX = this.game.cursor.currentX;
        this.lastCursorY = this.game.cursor.currentY;
    }

    onReplayChunkReceive(arr) {
        this.lastChunkReceivedAtMs = this.currentTime;

        arr.forEach((ev) => {
            if (ev.k) {
                this.inputEvents.push(ev);
            } else {
                let calcX = this.game.utils.convertRange(ev.x, 0, 512, this.xOffset, (512 * this.xScale) - this.xOffset);
                let calcY = this.game.utils.convertRange(ev.y, 0, 384, this.yOffset, (384 * this.yScale) - this.yOffset);
                this.movementX.push(
                    new this.game.ANI(
                        this.lastCursorT,
                        ev.t,
                        this.lastCursorX,
                        calcX,
                        this.game.EASINGS.Linear
                    )
                );

                this.movementY.push(
                    new this.game.ANI(
                        this.lastCursorT,
                        ev.t,
                        this.lastCursorY,
                        calcY,
                        this.game.EASINGS.Linear
                    )
                );

                this.lastCursorX = calcX, this.lastCursorY = calcY, this.lastCursorT = ev.t;
            }

        });



    }

}