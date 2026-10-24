import { GameState, states } from "./gameStates.js";

export class Home extends GameState {
    constructor(game) {
        super(game, "HOME");

        this.stateChangeDelayMs = 500;
        this.stateChangeTimestamp = 0;
        this.stateWillChange = false;

        this.game.events.on("UI:CookieClicked", this.onLogoCookieClicked.bind(this));
    }

    onLogoCookieClicked() {
        if (this.game.currentState.stateName !== "HOME") return;
        this.startStateTransition();
    }

    enter() {
        this.stateWillChange = false;
        this.game.logo.transition(false);

    }

    leave() {
        this.stateWillChange = false;
    }

    startStateTransition() {
        this.stateWillChange = true;
        this.stateChangeTimestamp = this.game.clock;
        this.game.backgroundManager.changeOpacity(0, 500);
        this.game.logo.transition(true);
        this.game.auMgr.playAudioClip("menuhit");
    }

    update() {
        let m = this.game.inputHandler.getMouse();
        this.game.cursor.setPosition(m.x, m.y);

        this.game.logo.update();


        if (this.game.inputHandler.includesKey("Enter", true)) {
            this.startStateTransition();
        }

        if (this.stateWillChange && this.stateChangeTimestamp + this.stateChangeDelayMs < this.game.clock) {
            this.game.setState(states.SONGSELECT);

        }
    }
    render() {
        this.game.logo.render();

    }
}