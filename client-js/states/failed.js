import { GameState } from "./gameStates.js";

export class Failed extends GameState {
    constructor(game) {
        super("FAILED");
        this.game = game;
    }

    enter() {

    }

    handleInput() {

    }
}