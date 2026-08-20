export const states = {
    SONGSELECT: 0,
    PLAYING: 1,
    PAUSED: 2,
    FAILED: 3,
    LOADING: 4,
    RESULT: 5,
    SPECTATING: 6
}

export class GameState {
    constructor(stateName) {
        this.stateName = stateName;
    }
    leave() {

    }
}
