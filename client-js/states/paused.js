import { GameState, states } from "./gameStates.js";

export class Paused extends GameState {
    constructor(game) {
        super(game, "PAUSED");
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

    update() {
        let m = this.game.inputHandler.getMouse();
        this.game.cursor.setPosition(m.x, m.y);
        
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

    render() {
        this.game.beatmapPlayer.render();
        this.game.accuracyDisplay.render();
        this.game.comboDisplay.render();
        this.game.inputOverlay.render();
        this.game.countdown.render();
        this.game.scoreDisplay.render();
        this.game.spinnerBonusDisplay.render();
        this.game.hitJudgeMgr.render();
        this.game.cursor.render();
    }
}