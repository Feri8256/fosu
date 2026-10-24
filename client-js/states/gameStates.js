export const states = {
    SONGSELECT: 0,
    PLAYING: 1,
    PAUSED: 2,
    FAILED: 3,
    LOADING: 4,
    RESULT: 5,
    SPECTATING: 6,
    HOME: 7
}

export class GameState {
    /**
     * 
     * @param {import("../main.js").Game} game 
     * @param {String} stateName 
     */
    constructor(game, stateName) {
        this.game = game
        this.stateName = stateName;
    }
    leave() {

    }
    enter() {

    }
    update() {

    }
    render() {
        
    }
}
