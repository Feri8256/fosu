import { parseOsu } from "./osuParser.js";

export class BeatmapLoader {
    constructor(game) {
        this.game = game;
    }

    load(url) {
        fetch(url)
        .then((resp) => resp.text())
        .then((txt) => {
            let p = parseOsu(txt);
            this.game.beatmapPlayer.createHitObjects(p);
            this.game.setState(this.game.STATE_ENUM.PLAYING);
        });
    }
}