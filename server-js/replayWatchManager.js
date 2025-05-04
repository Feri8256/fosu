class ReplayWatchManager { 
    constructor() {
        this.data = {};
    }

    onload(data) {
        this.data = data;
    }

    unload() {
        this.data = {};
    }

    /**
     * 
     * @param {Number} currentTimeMs 
     * @param {Number} aheadMs 
     */
    getChunk(currentTimeMs, aheadMs) {
        return this.data.events.filter((ev) => {
            return ev.t >= currentTimeMs && ev.t < currentTimeMs + aheadMs;
        });
    }
}

module.exports = { 
    ReplayWatchManager
}