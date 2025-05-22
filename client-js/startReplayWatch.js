export class ReplayWatchStartHandler {
    constructor(game) {
        this.game = game;

        this.game.socket.on("replayReady", (stat, bmHash, playerName, date) => {
            if (!stat) {
                // Replay loading failed
                this.game.setState(this.game.STATE_ENUM.SONGSELECT);
                return;
            }
            console.log(stat, bmHash, playerName, date)

            let beatmapURL = this.game.songSelectBuilder.list.find((bm) => { return bm.beatmapHash === bmHash }).beatmapSrc;

            this.game.beatmapLoader.load(beatmapURL, true, playerName);
        });
    }

    sendLoadRequest(replayId) {
        this.game.setState(this.game.STATE_ENUM.LOADING);
        this.game.socket.emit("loadReplay", replayId);
    }

}