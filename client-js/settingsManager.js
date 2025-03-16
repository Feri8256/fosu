/**
 * Handles actions on the Settings screen
 * and keeps track of the settings
 */
export class SettingsManager {
    constructor(game) {
        this.configuration = {};
        this.game = game;
        this.optionElements = document.querySelectorAll(".option");

        // The default settings determined by the default state of the inputs in the HTML document
        // Override them with the saved settings later
        this.optionElements.forEach(e => {
            let { id, value, checked } = e;
            let { type } = e.dataset;

            let val;
            switch (type) {
                case "number":
                    val = parseInt(value);
                    break;

                case "float":
                    val = parseFloat(value);
                    break;

                case "boolean":
                    val = checked;
                    break;

                case "string":
                    val = value.toString();
                    break;

                default:
                    val = value;
                    break;
            }
            this.configuration[id] = val;
        });

        console.log(this.configuration)

        ////////////////////////////////     

        this.optionElements.forEach(element => {
            element.addEventListener("change", (evt) => {
                let interfaceFnChek = this.game.settingsInterface[evt.target.dataset.execute];
                let controlReturnType = evt.target.dataset.type;

                if (typeof interfaceFnChek !== "function") return;
                let val;
                switch (controlReturnType) {
                    case "number":
                        val = parseInt(evt.target.value);
                        break;

                    case "float":
                        val = parseFloat(evt.target.value);
                        break;

                    case "boolean":
                        val = evt.target.checked;
                        break;

                    case "string":
                        val = evt.target.value.toString();
                        break;
                }

                interfaceFnChek(val);

                this.configuration[evt.target.id] = val;
                this.save();
            });
        });
    }

    save() {
        let configStr = JSON.stringify(this.configuration);
        window.localStorage.setItem("cfg", configStr);
    }
}
