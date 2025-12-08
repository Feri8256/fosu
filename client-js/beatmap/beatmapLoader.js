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

                if (this.isSpectateMode) {
                    this.game.UI.spectate.playerName.textContent = this.spectatedPlayerName ?? "";
                    this.game.UI.spectate.mapName.textContent = `${p.Metadata.Artist} - ${p.Metadata.Title} [${p.Metadata.Version}]`;
                }

                this.game.beatmapPlayer.createHitObjects(p, this.isSpectateMode);

            });
    }
}