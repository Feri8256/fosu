import { GameState } from "./gameStates.js";

export class Spectate extends GameState {
    constructor(game) {
        super("SPECTATING");
        this.game = game;


    }

    enter() {
        this.game.UI.spectate.container.style.display = "block";
        this.game.backgroundManager.changeOpacity(1 - this.game.CONFIG.backgroundDim, 1000);

        // Dont ask me why we recreate the cursor here but this is how it works correctly...
        this.game.cursor = new this.game.CURSOR(this.game, true);
    }

    handleInput() {
        if (this.game.inputHandler.includesKey("Escape", true)) {
            this.game.setState(states.SONGSELECT);
            this.game.auMgr.playAudioClip("menuback");
        }

        if (this.game.inputHandler.includesKey("KeyH", true)) {
            this.game.UI.spectate.container.style.visibility === "hidden"
                ? this.game.UI.spectate.container.style.visibility = "visible"
                : this.game.UI.spectate.container.style.visibility = "hidden";
        }

        let steppedCurrentTime = this.game.songClock - this.game.songDeltaTime;
        let currentInputEvent = [false, false, false];

        while (steppedCurrentTime < this.game.songClock) {

            currentInputEvent = this.game.replayManager.getTappingEvents(steppedCurrentTime);
            //console.log(currentInputEvent)
            this.game.replayManager.updateCursorPosition(steppedCurrentTime);
            this.game.beatmapPlayer.update(steppedCurrentTime);

            this.game.inputValidator.updateInputs(
                currentInputEvent
            );

            let validatedInputStates = this.game.inputValidator.getInputStates();

            validatedInputStates.forEach((i) => {
                if (i.down && i.valid) {
                    this.game.beatmapPlayer.hit(this.game.cursor.getPosition(), steppedCurrentTime);
                    i.valid = false;
                    return;
                }
            });

            steppedCurrentTime += 1;

            if (this.game.songDeltaTime > 100) break;
        }


    }

    leave() {
        this.game.countdown = new this.game.COUNTDOWN(this.game, -1);
        this.game.UI.spectate.container.style.display = "none";
        this.game.beatmapPlayer.cleanup();
        if (this.game.autoplay.activated) this.game.autoplay.reset();
        this.game.scoreMeter.reset();
        this.game.songAudioHandler.setPlaybackRate(1);
        this.game.events.emit("GameUI:InputOverlayReset");
    }
}