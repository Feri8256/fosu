const states = {
    SONGSELECT: 0,
    PLAYING: 1,
    PAUSED: 2,
    FAILED: 3,
    LOADING: 4,
    RESULT: 5
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
        this.game.beatmapPlayer.cleanup();
        this.game.songSelectContainer.style.display = "block";
        this.game.songSelectManager.scrollToLastPosition();

        this.game.accuracyMeter.reset();
        this.game.comboMeter.reset();

        this.game.songAudioHandler.changeVolume(
            this.game.CONFIG.sound.musicVolume,
            1000
        );

        this.game.backgroundManager.changeOpacity(1, 1000);
        this.game.songSelectContainer.animate([
            { transform: "translateX(690px)" },
            { transform: "translateX(0px)" }
        ],
            {
                easing: "ease-out",
                duration: 800,
                fill: "forwards"
            }
        )

        this.game.songSelectMetadata.container.animate([
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
        let down = this.game.inputHandler.includesKey("ArrowDown");
        let up = this.game.inputHandler.includesKey("ArrowUp");
        let dir = (up ? -1 : 0) || (down ? 1 : 0);

        this.game.songSelectManager.keyArrowSelect(dir);
        //console.log(down, up)
    }
}

class Playing extends GameState {
    constructor(game) {
        super("PLAYING");
        this.game = game;
    }

    enter() {
        this.game.backgroundManager.changeOpacity(1 - this.game.CONFIG.gameplay.backgroundDim, 1000);

        // Dont ask me why we recreate the cursor here but this is how it works correctly...
        this.game.cursor = new this.game.CURSOR(this.game);
        this.game.inputOverlay = new this.game.INPUTOVERLAY(this.game);

    }

    handleInput() {
        let m = this.game.inputHandler.getMouse();
        if (this.game.CONFIG.gameplay.mouseButtonsInGame && m.down) this.game.beatmapPlayer.hit(m);

        if (this.game.inputHandler.includesKey(this.game.CONFIG.inputs.hitKeyA, true) || this.game.inputHandler.includesKey(this.game.CONFIG.inputs.hitKeyB, true)) {
            this.game.beatmapPlayer.hit(m);
        }

        this.game.cursor.update(m.x, m.y);
        if (this.game.inputHandler.includesKey("Escape", true)) this.game.setState(states.PAUSED);

        this.game.inputOverlay.update();
    }
}

class Paused extends GameState {
    constructor(game) {
        super("PAUSED");
        this.game = game;
    }

    enter() {
        this.game.songAudioHandler.pause();
        this.game.pauseOverlay.style.display = "block";
        this.game.pauseOverlay.animate([
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
            this.game.pauseOverlay.animate([
                { filter: "opacity(100%)" },
                { filter: "opacity(0%)" }
            ],
                {
                    duration: 250,
                    fill: "forwards"
                }
            );

            setTimeout(() => {
                this.game.pauseOverlay.style.display = "none";
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

        this.game.songSelectContainer.animate([
            { transform: "translateX(0px)" },
            { transform: "translateX(690px)" }
        ],
            {
                easing: "ease-in",
                duration: 500,
                fill: "forwards"
            }
        ).onfinish = () => {
            this.game.songSelectContainer.style.display = "none";
        };

        this.game.songSelectMetadata.container.animate([
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

        //this.game.backgroundManager.changeOpacity(1, 500);
        this.game.resultScreen.container.style.filter = "opacity(0%)";
        this.game.resultScreen.container.style.visibility = "visible";
        this.game.resultScreen.container.animate(
            [
                { filter: "opacity(0%)" },
                { filter: "opacity(100%)" }
            ],
            {
                delay: 500,
                duration: 500,
                fill: "forwards"
            }
        );

        this.game.resultMetadata.container.style.filter = "opacity(0%)";
        this.game.resultMetadata.container.style.visibility = "visible";
        this.game.resultMetadata.container.animate(
            [
                { filter: "opacity(0%)" },
                { filter: "opacity(100%)" }
            ],
            {
                delay: 500,
                duration: 500,
                fill: "forwards"
            }
        )

        this.game.songAudioHandler.changeVolume(
            this.game.songAudioHandler.audio.volume * 0.5,
            1000
        );
    }

    handleInput() {
        if (this.game.inputHandler.includesKey("Escape", true)) {

            this.game.resultScreen.container.animate(
                [
                    { filter: "opacity(100%)" },
                    { filter: "opacity(0%)" }
                ],
                {
                    duration: 500,
                    fill: "forwards"
                }
            ).onfinish = () => {
                this.game.resultScreen.container.style.visibility = "hidden";
                this.game.setState(states.SONGSELECT);
                
            };

            this.game.resultMetadata.container.animate(
                [
                    { filter: "opacity(100%)" },
                    { filter: "opacity(0%)" }
                ],
                {
                    duration: 500,
                    fill: "forwards"
                }
            ).onfinish = () => {
                this.game.resultMetadata.container.style.visibility = "hidden";
            };
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
    states
}