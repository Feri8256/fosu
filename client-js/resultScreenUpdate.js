export class ResultScreenUpdater {
    constructor(game) {
        this.game = game;
    }

    update() {
        let hitResults = this.game.accuracyMeter.getResults();
        let comboResult = this.game.comboMeter.getResults();
        let mapMeta = this.game.beatmapPlayer.getMapMetadata();

        this.game.UI.resultScreen.perfectCount.textContent = `${hitResults[3]}x`;
        this.game.UI.resultScreen.okayCount.textContent = `${hitResults[2]}x`;
        this.game.UI.resultScreen.mehCount.textContent = `${hitResults[1]}x`;
        this.game.UI.resultScreen.missCount.textContent = `${hitResults[0]}x`;
        this.game.UI.resultScreen.accuracy.textContent = `${String(hitResults[4]).slice(0,5)}%`;
        this.game.UI.resultScreen.maxComboCount.textContent = `${comboResult.max}x`;

        this.game.UI.resultMetadata.artist.textContent = mapMeta.artist;
        this.game.UI.resultMetadata.title.textContent = mapMeta.title;
        this.game.UI.resultMetadata.creator.textContent = mapMeta.creator;
        this.game.UI.resultMetadata.diffName.textContent = mapMeta.version;

    }
}