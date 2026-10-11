import { Sprite } from "../graphics/sprite.js";
import { GameState, states } from "./gameStates.js";

export class SongSelecting extends GameState {
    constructor(game) {
        super("MENU");
        this.game = game;

        this.topOverlay = new Sprite(this.game.skinResourceManager.getSpriteImage("songselect-top"));
        this.bottomOverlay = new Sprite(this.game.skinResourceManager.getSpriteImage("songselect-bottom"));
    }

    enter() {
        this.topOverlay = new Sprite(this.game.skinResourceManager.getSpriteImage("songselect-top"));
        this.bottomOverlay = new Sprite(this.game.skinResourceManager.getSpriteImage("songselect-bottom"));

        this.topOverlay.origin_x = this.bottomOverlay.origin_x = 0;

        this.topOverlay.origin_y = 0.3;
        this.bottomOverlay.origin_y = 1;

        this.topOverlay.scale = this.game.canvas.width / this.topOverlay.spriteImage.w;
        this.bottomOverlay.scale = this.game.canvas.width / this.bottomOverlay.spriteImage.w;


        document.title = "fosu";
        this.game.replayManager.setMode(2);
        this.game.beatmapPlayer.cleanup();
        this.game.UI.songSelectContainer.style.display = "block";
        this.game.UI.songSelectActions.container.style.display = "block";
        this.game.UI.songSelectMetadata.container.style.display = "block";
        this.game.songSelectManager.scrollToLastPosition();

        this.game.events.emit("GameUI:InputOverlayReset");

        this.game.accuracyMeter.reset();
        this.game.comboMeter.reset();
        this.game.scoreMeter.reset();

        this.game.settingsManager.setButtonVisibility(true);
        this.game.scoreBoardManager.setBoardVisibility(true);

        this.game.songAudioHandler.changeVolume(
            this.game.CONFIG.musicVolume,
            1000
        );

        this.game.backgroundManager.changeOpacity(1, 1000);
        /* this.game.UI.songSelectContainer.animate([
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
        ); */
    }

    leave() {
        this.game.settingsManager.setButtonVisibility(false);
        this.game.settingsManager.setOverlayVisibility(false);
        this.game.scoreBoardManager.setBoardVisibility(false);
        this.game.UI.songSelectActions.container.style.display = "none";
        this.game.UI.songSelectContainer.style.display = "none";
        this.game.UI.songSelectMetadata.container.style.display = "none";
        this.game.backgroundManager.changeOpacity(1, 0);

    }

    update() {
        this.bottomOverlay.y = this.game.canvas.height;

        let m = this.game.inputHandler.getMouse();
        this.game.cursor.setPosition(m.x, m.y);

        this.game.logo.update();


        if (this.game.inputHandler.includesKey("Escape", true)) {
            this.game.setState(states.HOME);
            this.game.auMgr.playAudioClip("menuback");
        }

        if (this.game.inputHandler.includesKey("Enter", true)) {

        }

        if (this.game.inputHandler.includesKey("KeyA", true)) {
            if (this.game.autoplay.activated) this.game.autoplay.activated = false;
            else this.game.autoplay.activate();
        }

        if (this.game.inputHandler.includesKey("KeyR", true)) {
            this.game.songSelectManager.selectRandom();
        }
    }

    render() {
        this.bottomOverlay.render(this.game.ctx);

        this.game.logo.render();

        this.topOverlay.render(this.game.ctx);
    }
}