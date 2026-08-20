import { GameState } from "./gameStates.js";

export class Loading extends GameState {
    constructor(game) {
        super("LOADING");
        this.game = game;
    }

    enter() {
        this.game.setLoadingCircle(true);
        this.game.settingsManager.setButtonVisibility(false);

        this.game.UI.songSelectContainer.animate([
            { transform: "translateX(0px)" },
            { transform: "translateX(690px)" }
        ],
            {
                easing: "ease-in",
                duration: 500,
                fill: "forwards"
            }
        ).onfinish = () => {
            this.game.UI.songSelectContainer.style.display = "none";
        };

        this.game.UI.songSelectMetadata.container.animate([
            { filter: "opacity(100%)" },
            { filter: "opacity(0%)" }
        ],
            {
                duration: 500,
                fill: "forwards"
            }
        );

        this.game.songAudioHandler.changeVolume(
            this.game.songAudioHandler.audio.volume * 0.5,
            500
        );
    }

    handleInput() {

    }

    leave() {
        this.game.setLoadingCircle(false);
    }
}