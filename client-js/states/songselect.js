import { GameState } from "./gameStates.js";

export class SongSelecting extends GameState {
    constructor(game) {
        super("MENU");
        this.game = game;
    }

    enter() {
        document.title = "fosu";
        this.game.replayManager.setMode(2);
        this.game.beatmapPlayer.cleanup();
        this.game.UI.songSelectContainer.style.display = "block";
        this.game.UI.songSelectActions.container.style.display = "block";
        this.game.songSelectManager.scrollToLastPosition();

        this.game.events.emit("GameUI:InputOverlayReset");

        this.game.accuracyMeter.reset();
        this.game.comboMeter.reset();
        this.game.scoreMeter.reset();

        this.game.settingsManager.setButtonVisibility(true);
        this.game.scoreBoardManager.setBoardVisibility(true);

        this.game.songAudioHandler.changeVolume(
            this.game.CONFIG.musicVolume,
            1000
        );

        this.game.backgroundManager.changeOpacity(1, 1000);
        this.game.UI.songSelectContainer.animate([
            { transform: "translateX(690px)" },
            { transform: "translateX(0px)" }
        ],
            {
                easing: "ease-out",
                duration: 800,
                fill: "forwards"
            }
        )

        this.game.UI.songSelectMetadata.container.animate([
            { filter: "opacity(0%)" },
            { filter: "opacity(100%)" }
        ],
            {
                duration: 500,
                fill: "forwards"
            }
        );
    }

    leave() {
        this.game.settingsManager.setButtonVisibility(false);
        this.game.settingsManager.setOverlayVisibility(false);
        this.game.scoreBoardManager.setBoardVisibility(false);
        this.game.UI.songSelectActions.container.style.display = "none";
    }

    handleInput() {

        if (this.game.inputHandler.includesKey("KeyA", true)) {
            if (this.game.autoplay.activated) this.game.autoplay.activated = false;
            else this.game.autoplay.activate();
        }

        if (this.game.inputHandler.includesKey("KeyR", true)) {
            this.game.songSelectManager.selectRandom();
        }
    }
}