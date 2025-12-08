export class ResultScreenUpdater {
    constructor(game) {
        this.game = game;
        this.replayId = "";

        // Only when the current state is "RESULT"
        this.game.UI.resultScreen.buttons.back.addEventListener("click", () => { this.game.currentState.back() });
        this.game.UI.resultScreen.buttons.retry.addEventListener("click", () => { this.game.currentState.retry() });
        this.game.UI.resultScreen.buttons.watch.addEventListener("click", () => {
            if (!this.replayId) return;
            this.game.currentState.replayWatch();
            this.game.replayWatchStartHandler.sendLoadRequest(this.replayId);
        });
    }

    update({
        playerName = "",
        mapTitle = "",
        mapCreator = "",
        mapVersion = "",
        mapArtist = "",
        countPerfect = 0,
        countOkay = 0,
        countMeh = 0,
        countMiss = 0,
        countMaxCombo = 0,
        acc = 100,
        replayId = "",
        date = 0
    }) {
        //let hitResults = this.game.accuracyMeter.getResults();
        //let comboResult = this.game.comboMeter.getResults();
        //let mapMeta = this.game.beatmapPlayer.getMapMetadata();
        let playDate = new Date(date);

        this.replayId = replayId;

        this.game.UI.resultScreen.perfectCount.textContent = `${countPerfect}x`;
        this.game.UI.resultScreen.okayCount.textContent = `${countOkay}x`;
        this.game.UI.resultScreen.mehCount.textContent = `${countMeh}x`;
        this.game.UI.resultScreen.missCount.textContent = `${countMiss}x`;
        this.game.UI.resultScreen.accuracy.textContent = `${String(acc).slice(0, 5)}%`;
        this.game.UI.resultScreen.maxComboCount.textContent = `${countMaxCombo}x`;

        this.game.UI.resultMetadata.artist.textContent = mapArtist;
        this.game.UI.resultMetadata.title.textContent = mapTitle;
        this.game.UI.resultMetadata.creator.textContent = mapCreator;
        this.game.UI.resultMetadata.diffName.textContent = mapVersion;
        this.game.UI.resultMetadata.playerName.textContent = `${playerName} on ${playDate.toLocaleDateString()} ${playDate.toLocaleTimeString()}`;



    }
}