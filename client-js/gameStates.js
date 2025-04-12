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
}

class SongSelecting extends GameState {
    constructor(game) {
        super("MENU");
        this.game = game;
    }

    enter() {
        document.title = "fosu";
        this.game.beatmapPlayer.cleanup();
        this.game.UI.songSelectContainer.style.display = "block";
        this.game.songSelectManager.scrollToLastPosition();

        this.game.accuracyMeter.reset();
        this.game.comboMeter.reset();

        this.game.settingsManager.setButtonVisibility(true);

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
    }

    handleInput() {
        if (this.game.inputHandler.includesKey("Escape", true)) this.game.setState(states.PAUSED);
        this.game.inputOverlay.update();

        if (this.game.autoplay.activated) return;

        let m = this.game.inputHandler.getMouse();
        if (this.game.CONFIG.mouseButtonsInGame && m.down) this.game.beatmapPlayer.hit(m);

        if (this.game.inputHandler.includesKey(this.game.CONFIG.hitKeyA, true) || this.game.inputHandler.includesKey(this.game.CONFIG.hitKeyB, true)) {
            this.game.beatmapPlayer.hit(m);
        }

        this.game.cursor.setPosition(m.x, m.y);


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
}

class Result extends GameState {
    constructor(game) {
        super("RESULT");
        this.game = game;
    }

    enter() {
        this.game.resultScreenUpdater.update();
        this.game.backgroundManager.changeOpacity(0.5, 500);

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
    afterUIAnimations(retry) {
        this.game.UI.resultMetadata.container.style.visibility = "hidden";
        this.game.UI.resultScreen.container.style.visibility = "hidden";
        this.game.setState(retry ? states.PLAYING : states.SONGSELECT);
    }

    handleInput() {
        if (this.game.inputHandler.includesKey("Escape", true)) {
            this.animateElements(false);
            this.game.auMgr.playAudioClip("menuback");
        }

        if (this.game.inputHandler.includesKey("KeyR", true)) {
            this.game.beatmapPlayer.retry();
            this.animateElements(true);

        }
    }
}


class Spectate extends GameState {
    constructor(game) {
        super("SPECTATING");
        this.game = game;
    }

    enter() {
        this.game.backgroundManager.changeOpacity(1 - this.game.CONFIG.backgroundDim, 1000);

        // Dont ask me why we recreate the cursor here but this is how it works correctly...
        this.game.cursor = new this.game.CURSOR(this.game);
        this.game.inputOverlay = new this.game.INPUTOVERLAY(this.game);
    }

    handleInput() {
        if (this.game.inputHandler.includesKey("Escape", true)) {
            this.game.auMgr.playAudioClip("menuback");
            this.game.setState(states.SONGSELECT);
        }
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