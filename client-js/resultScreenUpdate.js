export class ResultScreenUpdater {
    constructor(game) {
        this.game = game;
    }

    update() {
        let hitResults = this.game.accuracyMeter.getResults();
        let comboResult = this.game.comboMeter.getResults();
        let mapMeta = this.game.beatmapPlayer.getMapMetadata();

        this.game.resultScreen.perfectCount.textContent = `${hitResults[3]}x`;
        this.game.resultScreen.okayCount.textContent = `${hitResults[2]}x`;
        this.game.resultScreen.mehCount.textContent = `${hitResults[1]}x`;
        this.game.resultScreen.missCount.textContent = `${hitResults[0]}x`;
        this.game.resultScreen.accuracy.textContent = `${String(hitResults[4]).slice(0,5)}%`;
        this.game.resultScreen.maxComboCount.textContent = `${comboResult.max}x`;

        this.game.resultMetadata.artist.textContent = mapMeta.artist;
        this.game.resultMetadata.title.textContent = mapMeta.title;
        this.game.resultMetadata.creator.textContent = mapMeta.creator;
        this.game.resultMetadata.diffName.textContent = mapMeta.version;

    }
}