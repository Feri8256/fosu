const fs = require("fs");

class ReplayFileManager {
    constructor() {
        this.currentId = "";

        this.out = {
            playerName: "",
            beatmapHash: "",
            date: 0,
            results: {
                perfect: 0,
                okay: 0,
                meh: 0,
                miss: 0,
                accuracy: 100
            },
            events: []
        }
    }

    /**
     * 
     * @param {String} playerName 
     * @param {String} beatmapHash 
     * @param {String} replayId 
     */
    beginCapture(playerName, beatmapHash, replayId) {
        this.reset();
        this.out.playerName = playerName;
        this.out.beatmapHash = beatmapHash;
        this.currentId = replayId;
    }

    /**
     * 
     * @param {Array} eventsArray 
     */
    appendEvents(eventsArray) {
        this.out.events.push(...eventsArray);
    }

    /**
     * 
     * @param {Object} results 
     * @param {String} id 
     */
    stopCapture() {
        let dbExists = fs.existsSync("./db");
        let replaysExists = fs.existsSync("./db/r");

        if (!dbExists) fs.mkdirSync("db");
        if (!replaysExists) fs.mkdirSync("db/r");

        this.out.date = Date.now();

        fs.writeFile(`./db/r/${this.currentId}.fosureplay`, JSON.stringify(this.out), () => {
            console.log("replay file has been created");
            this.reset();
        });
    }

    reset() {
        this.currentId = "";
        this.out = {
            playerName: "",
            beatmapHash: "",
            date: 0,
            results: {
                perfect: 0,
                okay: 0,
                meh: 0,
                miss: 0,
                accuracy: 100
            },
            events: []
        }
    }
}

module.exports = {
    ReplayFileManager
}