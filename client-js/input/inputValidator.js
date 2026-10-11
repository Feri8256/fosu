import { utils } from "../utils.js";

export class InputValidator {
    constructor(game) {
        this.game = game;
        this.inputStates = [
            { down: false, valid: false },
            { down: false, valid: false },
            { down: false, valid: false }
        ];

        this.onInputChange = () => { }
    }

    /**
     * 
     * @param {Number} n input bit flags as integer (make it -1 to use the array thing)
     * @param {boolean[]} a input list array
     */
    updateInputs(n = -1, a = []) {
        let arr = a.length > 0 ? a : [false, false, false];
        
        if (n !== -1) arr.forEach((v, i) => { 
            v = utils.getBitAtIndex(n, i);
        });

        this.inputStates.forEach((k, i, a) => {

            if (arr[i] === k.down) return;
            if (arr[i]) k.valid = true;
            k.down = arr[i];

            if (typeof this.onInputChange === "function") {
                this.onInputChange(a);
                this.game.events.emit("GameUI:InputOverlayUpdate", a);
            };
        });
    }

    getInputStates() {
        return this.inputStates;
    }

    invalidateInput(index) {
        if (index === -1) return;

        this.inputStates.at(index).valid = false;
    }

    isAnyInputDown() {
        return this.inputStates.findIndex((ik) => { return ik.down }) !== -1;
    }
}