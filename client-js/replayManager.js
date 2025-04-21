export class ReplayManager {
    constructor(game) {
        this.game = game;
        this.currentReplayId = "";

        this.xOffset = 0;
        this.yOffset = 0;
        this.xScale = 1;
        this.yScale = 1;

        this.frameCaptureIntervalMs = 16;
        this.eventAccumulatorLimit = 128;

        this.lastBatchSentAt = 0;
        this.lastCaptureAt = 0;

        this.currentMode = 2;

        this.eventAccumulator = [];

        this.lastTimestamp = 0;

        this.lastCursorX = 0;
        this.lastCursorY = 0;

    }

    /**
     * 
     * @param {Number} currentTime 
     */
    update(currentTime) {

        switch (this.currentMode) {
            case 0:

                // this means the map paused
                if (currentTime === this.lastTimestamp) break;

                // cursor still at a position
                if (this.game.cursor.currentX === this.lastCursorX && this.game.cursor.currentY === this.lastCursorY) break;

                if (currentTime - this.lastCaptureAt > this.frameCaptureIntervalMs) {
                    this.eventAccumulator.push({
                        t: currentTime,
                        x: this.game.utils.convertRange(this.game.cursor.currentX, this.xOffset, (512 * this.xScale) - this.xOffset, 0, 512),
                        y: this.game.utils.convertRange(this.game.cursor.currentY, this.yOffset, (384 * this.yScale) - this.yOffset, 0, 384)
                    });

                    this.lastCaptureAt = currentTime;

                    if (this.eventAccumulator.length > this.eventAccumulatorLimit) this.sendData();
                }
                this.lastCursorX = this.game.cursor.currentX;
                this.lastCursorY = this.game.cursor.currentY;
                break;

            case 1:

                break;

            case 2:
                break;
        }

        
        this.lastTimestamp = currentTime;
    }

    /**
     * 
     * @param {*} mode 0: capture, 1: replay, 2: no action
     */
    setMode(mode) {
        this.currentMode = mode;
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
        this.lastCaptureAt = 0;
        this.lastTimestamp = 0;
        this.eventAccumulator.length = 0;
        this.game.socket.emit("gameplayEventsCaptureStart", { playerName, beatmapHash, replayId});

    }

    stopCapture() {
        this.setMode(2);
        if (this.eventAccumulator.length > 0) this.game.socket.emit("gameplayEventsCapture", this.eventAccumulator);
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

}