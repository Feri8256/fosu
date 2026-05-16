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

    updateInputs(arr = [false, false, false]) {
        this.inputStates.forEach((k, i) => {

            if (arr[i] === k.down) return;
            if (arr[i]) k.valid = true;
            k.down = arr[i];

            if (typeof this.onInputChange === "function") {
                let a = this.inputStates.map((s) => { return s = s.down; });
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