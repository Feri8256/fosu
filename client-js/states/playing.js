import { GameState, states } from "./gameStates.js";

export class Playing extends GameState {
    constructor(game) {
        super("PLAYING");
        this.game = game;

        this.game.inputValidator.onInputChange = (a) => {
            this.game.replayManager.addInputEvents(a, this.game.songAudioHandler.getCurrentTime());
        }
    }

    enter() {
        this.game.backgroundManager.changeOpacity(1 - this.game.CONFIG.backgroundDim, 1000);

        // Dont ask me why we recreate the cursor here but this is how it works correctly...
        this.game.cursor = new this.game.CURSOR(this.game, true);

        this.game.inputHandler.onMousemove = (m) => {
            this.game.cursor.setPosition(m.x, m.y);
        }

        this.game.inputHandler.onKeyup = () => {
            let ia = this.game.inputHandler.includesKey(this.game.CONFIG.hitKeyA, false);
            let ib = this.game.inputHandler.includesKey(this.game.CONFIG.hitKeyB, false);
            let ic = this.game.inputHandler.getMouse().down && this.game.CONFIG.mouseButtonsInGame;
            this.game.inputValidator.updateInputs([ia, ib, ic]);
        }

        this.game.inputHandler.onKeydown = () => {
            let ia = this.game.inputHandler.includesKey(this.game.CONFIG.hitKeyA, false);
            let ib = this.game.inputHandler.includesKey(this.game.CONFIG.hitKeyB, false);
            let ic = this.game.inputHandler.getMouse().down && this.game.CONFIG.mouseButtonsInGame;
            this.game.inputValidator.updateInputs([ia, ib, ic]);

            this.game.inputValidator.getInputStates().forEach((i) => {
                if (i.down && i.valid) {
                    this.game.beatmapPlayer.hit(this.game.cursor.getPosition());
                    i.valid = false;
                    return;
                }
            });
        }

        
    }

    handleInput() {
        this.game.beatmapPlayer.update(this.game.songClock);

        if (this.game.inputHandler.includesKey("Escape", true)) this.game.setState(states.PAUSED);

        this.game.inputOverlay.update();

        if (this.game.inputHandler.includesKey("Space", true)
            && this.game.beatmapPlayer.isIntroSkipable()
        ) {
            this.game.beatmapPlayer.skipIntro();
        }
    }

    leave() {
        this.game.inputHandler.onMousemove = () => { }
        this.game.inputHandler.onKeydown = () => { }
        this.game.inputHandler.onKeyup = () => { }
        this.game.inputValidator.onInputChange = () => {};
        this.game.countdown = new this.game.COUNTDOWN(this.game, -1);
    }
}