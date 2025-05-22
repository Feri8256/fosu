const states = {
    SONGSELECT: 0,
    PLAYING: 1,
    PAUSED: 2,
    FAILED: 3,
    LOADING: 4,
    RESULT: 5,
    SPECTATING: 6
}

class GameState {
    constructor(stateName) {
        this.stateName = stateName;
    }
    leave() {

    }
}

class SongSelecting extends GameState {
    constructor(game) {
        super("MENU");
        this.game = game;
    }

    enter() {
        document.title = "fosu";
        this.game.replayManager.setMode(2);
        this.game.beatmapPlayer.cleanup();
        this.game.UI.songSelectContainer.style.display = "block";
        this.game.songSelectManager.scrollToLastPosition();

        this.game.accuracyMeter.reset();
        this.game.comboMeter.reset();

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
    }

    handleInput() {

        if (this.game.inputHandler.includesKey("KeyA", true)) {
            if (this.game.autoplay.activated) this.game.autoplay.activated = false;
            else this.game.autoplay.activate();
        }
    }
}

class Playing extends GameState {
    constructor(game) {
        super("PLAYING");
        this.game = game;
    }

    enter() {
        this.game.backgroundManager.changeOpacity(1 - this.game.CONFIG.backgroundDim, 1000);

        // Dont ask me why we recreate the cursor here but this is how it works correctly...
        this.game.cursor = new this.game.CURSOR(this.game);
        this.game.inputOverlay = new this.game.INPUTOVERLAY(this.game);

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

        this.game.inputValidator.onInputChange = (a) => {
            this.game.replayManager.addInputEvents(a, this.game.songAudioHandler.getCurrentTime());
        }
    }

    handleInput() {
        if (this.game.inputHandler.includesKey("Escape", true)) this.game.setState(states.PAUSED);

        this.game.inputOverlay.updateInputState(this.game.inputValidator.getInputStates());

        this.game.inputOverlay.update();
    }

    leave() {
        this.game.inputHandler.onMousemove = () => { }
        this.game.inputHandler.onKeydown = () => { }
        this.game.inputHandler.onKeyup = () => { }
        this.game.inputValidator.onInputChange = () => { }
        this.game.countdown = new this.game.COUNTDOWN(this.game, -1);
    }
}

class Paused extends GameState {
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

class Failed extends GameState {
    constructor(game) {
        super("FAILED");
        this.game = game;
    }

    enter() {

    }

    handleInput() {

    }
}

class Loading extends GameState {
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

class Result extends GameState {
    constructor(game) {
        super("RESULT");
        this.game = game;
    }

    enter() {

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
        this.animateElements(states.PLAYING);
    }

    back() {
        this.animateElements(states.SONGSELECT);
        this.game.auMgr.playAudioClip("menuback");
    }

    replayWatch() {
        this.game.UI.resultMetadata.container.style.visibility = "hidden";
        this.game.UI.resultScreen.container.style.visibility = "hidden";
    }
}


class Spectate extends GameState {
    constructor(game) {
        super("SPECTATING");
        this.game = game;


    }

    enter() {
        this.game.UI.spectate.container.style.display = "block";
        this.game.backgroundManager.changeOpacity(1 - this.game.CONFIG.backgroundDim, 1000);

        // Dont ask me why we recreate the cursor here but this is how it works correctly...
        this.game.cursor = new this.game.CURSOR(this.game);
        this.game.inputOverlay = new this.game.INPUTOVERLAY(this.game);
    }

    handleInput() {
        if (this.game.inputHandler.includesKey("Escape", true)) {
            this.game.auMgr.playAudioClip("menuback");
            this.game.setState(states.SONGSELECT);
            this.game.UI.spectate.container.style.display = "none";
        }

        this.game.inputValidator.getInputStates().forEach((i) => {
            if (i.down && i.valid) {
                this.game.beatmapPlayer.hit(this.game.cursor.getPosition());
                i.valid = false;
                return;
            }
        });

        this.game.inputOverlay.updateInputState(this.game.inputValidator.getInputStates());
    }

    leave() {
        this.game.countdown = new this.game.COUNTDOWN(this.game, -1);
        this.game.beatmapPlayer.cleanup();
    }
}


export {
    SongSelecting,
    Playing,
    Paused,
    Failed,
    Loading,
    Result,
    Spectate,
    states
}