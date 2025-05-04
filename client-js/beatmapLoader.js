import { parseOsu } from "./osuParser.js";

export class BeatmapLoader {
    constructor(game) {
        this.game = game;

        this.isSpectateMode = false;
        this.spectatedPlayerName = "";
    }

    load(url, isSpectateMode, spectatedPlayerName = "") {

        this.isSpectateMode = this.game.autoplay.activated || isSpectateMode;
        this.spectatedPlayerName = this.isSpectateMode && this.game.autoplay.activated ? "autoplay" : spectatedPlayerName;

        fetch(url)
            .then((resp) => resp.text())
            .then((txt) => {
                let p = parseOsu(txt);

                document.title = `fosu | ${this.isSpectateMode ? "Spectating " + this.spectatedPlayerName + " playing" : "Playing"} ${p.Metadata.Artist} - ${p.Metadata.Title} [${p.Metadata.Version}]`;

                this.game.beatmapPlayer.createHitObjects(p, isSpectateMode);
                this.game.setState(this.isSpectateMode ? this.game.STATE_ENUM.SPECTATING : this.game.STATE_ENUM.PLAYING);
            });
    }
}