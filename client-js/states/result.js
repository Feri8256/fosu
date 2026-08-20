import { GameState } from "./gameStates.js";

export class Result extends GameState {
    constructor(game) {
        super("RESULT");
        this.game = game;
    }

    enter() {
        this.game.songAudioHandler.setPlaybackRate(1);
        this.game.backgroundManager.changeOpacity(0.5, 500);
        this.game.UI.spectate.container.style.display = "none";

        this.game.UI.resultScreen.container.style.filter = "opacity(0%)";
        this.game.UI.resultScreen.container.style.visibility = "visible";
        this.game.UI.resultScreen.container.animate(
            [
                { filter: "opacity(0%)" },
                { filter: "opacity(100%)" }
            ],
            {
                delay: 0,
                duration: 500,
                fill: "forwards"
            }
        );

        this.game.UI.resultMetadata.container.style.filter = "opacity(0%)";
        this.game.UI.resultMetadata.container.style.visibility = "visible";
        this.game.UI.resultMetadata.container.animate(
            [
                { filter: "opacity(0%)" },
                { filter: "opacity(100%)" }
            ],
            {
                delay: 0,
                duration: 500,
                fill: "forwards"
            }
        )

        this.game.songAudioHandler.changeVolume(
            this.game.songAudioHandler.audio.volume * 0.5,
            1000
        );

    }

    /**
     * Animating the ui elements of the result screen
     * @param {Boolean} r wanna retry?
     */
    animateElements(r) {
        this.game.backgroundManager.changeOpacity(0, 500);
        this.game.UI.resultScreen.container.animate(
            [
                { filter: "opacity(100%)" },
                { filter: "opacity(0%)" }
            ],
            {
                duration: 500,
                fill: "forwards"
            }
        ).onfinish = () => {
            this.game.UI.resultScreen.container.style.visibility = "hidden";

        };

        this.game.UI.resultMetadata.container.animate(
            [
                { filter: "opacity(100%)" },
                { filter: "opacity(0%)" }
            ],
            {
                duration: 500,
                fill: "forwards"
            }
        ).onfinish = () => {
            this.afterUIAnimations(r);
        };
    }

    /**
     * 
     * @param {Boolean} retry 
     */
    afterUIAnimations(state) {
        this.game.UI.resultMetadata.container.style.visibility = "hidden";
        this.game.UI.resultScreen.container.style.visibility = "hidden";
        this.game.setState(state);
    }

    handleInput() {
        if (this.game.inputHandler.includesKey("Escape", true)) {
            this.back();
        }

        if (this.game.inputHandler.includesKey("KeyR", true)) {
            this.retry();

        }
    }

    retry() {
        this.game.beatmapPlayer.retry();
        this.game.scoreMeter.reset();
        this.animateElements(states.PLAYING);
    }

    back() {
        this.animateElements(states.SONGSELECT);
        this.game.scoreMeter.reset();
        this.game.auMgr.playAudioClip("menuback");
    }

    replayWatch() {
        this.game.UI.resultMetadata.container.style.visibility = "hidden";
        this.game.UI.resultScreen.container.style.visibility = "hidden";
    }
}