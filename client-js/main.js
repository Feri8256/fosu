import { SongSelectionBuilder } from "./songSelectionBuilder.js";
import { songSelectionManager } from "./songSelectionManager.js";
import { Sprite, SpriteImage } from "./sprite.js";
import { Animation, Timeline, EASING } from "./animationEngine.js";
import { SongAudioHandler } from "./songAudioHandler.js";
import { BackgrondImageManager } from "./backgroundImage.js";
import { BeatmapLoader } from "./beatmapLoader.js";
import { BeatmapPlayer } from "./beatmapPlayer.js";
import { SkinResourceManager } from "./skinResourceManager.js";
import { HitCircle } from "./hitObjectCircle.js";
import { Slider } from "./hitObjectSlider.js";
import { Spinner } from "./hitObjectSpinner.js";
import { AccuracyJudgment } from "./accuracyJudgment.js";
import { states, SongSelecting, Playing, Paused, Failed, Loading, Result } from "./gameStates.js";
import { InputHandler } from "./InputHandler.js";
import { Cursor } from "./cursor.js";
import { AccuracyMeter } from "./accuracyMeter.js";
import { ComboMeter } from "./comboMeter.js";
import { AudioManager } from "./audioManager.js";
import { InputOverlay } from "./inputOverlay.js";
import { ResultScreenUpdater } from "./resultScreenUpdate.js";
import { HitSoundPlayer } from "./hitSoundPlayer.js";
import { SpriteFontRenderer } from "./fontRenderer.js";
import ui from "./UIelements.js";

const config = {
    sound: {
        musicVolume: 0.1,
        effectVolume: 0.1
    },
    visuals: {
        skin: "",
        cursorScale: 1.5
    },
    gameplay: {
        mouseButtonsInGame: false,
        hide300Points: true,
        backgroundDim: 0.75
    },
    inputs: {
        hitKeyA: "KeyX",
        hitKeyB: "KeyC"
    }
}

class Game {
    constructor(cfg) {
        this.canvas = document.querySelector("canvas");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = this.canvas.getContext("2d");

        this.CONFIG = cfg;

        this.inputHandler = new InputHandler();

        this.UI = ui;

        this.STATE_ENUM = states
        this.STATES = [SongSelecting, Playing, Paused, Failed, Loading, Result];

        this.SPRITEIMG = SpriteImage;
        this.SPRITE = Sprite;

        this.SPRITEFONTRENDERER = SpriteFontRenderer;

        this.EASINGS = EASING;
        this.ANI = Animation;
        this.TL = Timeline;

        this.INPUTHANDLER = InputHandler;
        this.CURSOR = Cursor;
        this.HITCIRCLE = HitCircle;
        this.SLIDER = Slider;
        this.SPINNER = Spinner;
        this.INPUTOVERLAY = InputOverlay;

        this.auMgr = new AudioManager();
        this.auMgr.setMasterVolume(this.CONFIG.sound.effectVolume);

        this.skinResourceManager = new SkinResourceManager(this);
        this.skinResourceManager.loadSkin(this.CONFIG.visuals.skin);

        this.loadingImg = new SpriteImage("client-files/loading.png");
        this.loadingSprite = new Sprite(this.loadingImg);
        this.loading = false;
        this.loadingAnimation = new Animation(0, 1000, 0, 6.28, this.EASINGS.Linear, true);

        this.ACCJUDGMENT = AccuracyJudgment;
        this.accuracyMeter = new AccuracyMeter(this);
        this.comboMeter = new ComboMeter(this);
        this.songAudioHandler = new SongAudioHandler(this);
        this.backgroundManager = new BackgrondImageManager(this);
        this.beatmapPlayer = new BeatmapPlayer(this);
        this.beatmapLoader = new BeatmapLoader(this);
        this.songSelectBuilder = new SongSelectionBuilder(this);
        this.songSelectManager = new songSelectionManager(this);
        this.cursor = new Cursor(this);
        this.inputOverlay = new InputOverlay(this);
        this.hitSoundPlayer = new HitSoundPlayer(this);
        this.resultScreenUpdater = new ResultScreenUpdater(this);

        window.addEventListener("resize", () => { this.resizeHandler() });
        this.UI.pauseButtons.continue.addEventListener("click", () => { this.pauseContinue() });
        this.UI.pauseButtons.retry.addEventListener("click", () => { this.pauseRetry() });
        this.UI.pauseButtons.back.addEventListener("click", () => { this.pauseBack() });
        this.UI.introSkipButton.addEventListener("click", () => { this.beatmapPlayer.skipIntro() });

        this.clock = 0;
        // Game starts in the song selection menu
        this.currentState;
        this.setState(0);
    }

    update(timestamp) {

        this.clock = timestamp;

        this.currentState.handleInput();
        this.songAudioHandler.update();
        this.backgroundManager.update();
        this.beatmapPlayer.update();
        this.accuracyMeter.update();
        this.comboMeter.update();

        if (this.loading) {
            this.loadingAnimation.update(this.clock);
            this.loadingSprite.rotation = this.loadingAnimation.currentValue;
            this.loadingSprite.x = this.canvas.width * 0.5;
            this.loadingSprite.y = this.canvas.height * 0.5;
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.backgroundManager.render();
        this.beatmapPlayer.render();

        if (this.loading) {
            this.loadingSprite.render(this.ctx);
        }

        if (this.beatmapPlayer.playing) {
            this.accuracyMeter.render();
            this.comboMeter.render();
            this.inputOverlay.render();
            this.cursor.render();
        }
    }

    setState(stateEnum) {
        this.currentState = new this.STATES[stateEnum](this);
        console.log(`game state changed to: ${this.currentState.stateName}`)

        this.currentState.enter();
    }

    setLoadingCircle(state) {
        this.loading = state;
    }

    resizeHandler() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.backgroundManager.resize();
    }

    pauseRetry() {
        this.setState(states.PLAYING);
        this.UI.pauseOverlay.animate([
            { filter: "opacity(100%)" },
            { filter: "opacity(0%)" }
        ],
            {
                duration: 250,
                fill: "forwards"
            }
        );
        this.comboMeter.reset();
        this.accuracyMeter.reset();
        this.songAudioHandler.reset();
        this.beatmapPlayer.retry();
        setTimeout(() => {
            this.UI.pauseOverlay.style.display = "none";
            //this.songAudioHandler.play();
        }, 500);
    }

    pauseContinue() {
        // I am repeating myself here, i know!
        // But there is only one difference
        // I gave the player 1 second pause to adjust their aim when the continue button is used instead of the Escape key
        this.setState(states.PLAYING);
        this.UI.pauseOverlay.animate([
            { filter: "opacity(100%)" },
            { filter: "opacity(0%)" }
        ],
            {
                duration: 250,
                fill: "forwards"
            }
        );

        setTimeout(() => {
            this.UI.pauseOverlay.style.display = "none";
            this.songAudioHandler.play();
        }, 1000);
    }

    pauseBack() {
        this.setState(states.SONGSELECT);
        this.comboMeter.reset();
        this.accuracyMeter.reset();
        this.songAudioHandler.play();
        this.UI.pauseOverlay.animate([
            { filter: "opacity(100%)" },
            { filter: "opacity(0%)" }
        ],
            {
                duration: 250,
                fill: "forwards"
            }
        );

        setTimeout(() => {
            this.UI.pauseOverlay.style.display = "none";
        }, 500);
    }
}

var game = null;

function mainLoop(timestamp) {
    game.update(timestamp);
    game.render();
    requestAnimationFrame(mainLoop);
}

window.addEventListener("DOMContentLoaded", () => {
    game = new Game(config);
    requestAnimationFrame(mainLoop);
});

