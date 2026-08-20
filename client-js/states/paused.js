import { GameState } from "./gameStates.js";

export class Paused extends GameState {
    constructor(game) {
        super("PAUSED");
        this.game = game;
    }

    enter() {
        this.game.songAudioHandler.pause();
        this.game.UI.pauseOverlay.style.display = "block";
        this.game.UI.pauseOverlay.animate([
            { filter: "opacity(0%)" },
            { filter: "opacity(100%)" }
        ],
            {
                duration: 150,
                fill: "forwards"
            }
        );

        this.game.auMgr.playAudioClip("pause-loop", true);
    }

    leave() {
        this.game.auMgr.stopAudioClip("pause-loop");

    }

    handleInput() {
        if (this.game.inputHandler.includesKey("Escape", true)) {
            this.game.setState(states.PLAYING);
            this.game.UI.pauseOverlay.animate([
                { filter: "opacity(100%)" },
                { filter: "opacity(0%)" }
            ],
                {
                    duration: 250,
                    fill: "forwards"
                }
            );

            setTimeout(() => {
                this.game.UI.pauseOverlay.style.display = "none";
                this.game.songAudioHandler.play();
            }, 500);
        }

    }
}