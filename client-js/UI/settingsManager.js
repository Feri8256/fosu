/**
 * Handles actions on the Settings screen
 * and keeps track of the settings
 */
export class SettingsManager {
    constructor(game) {
        this.lsKey = "fosuConfig";
        this.game = game;

        this.buttonVisible = true;
        this.overlayVisible = false;

        this.overlayAnimation = "cubic-bezier(0.16, 1, 0.3, 1)";

        this.game.UI.settings.button.addEventListener("click", () => {
            if (this.overlayVisible) {

                this.overlayVisible = false;

                this.game.UI.settings.container.animate([
                    {
                        transform: "translate(0px)",
                        filter: "opacity(100%)"
                    },
                    {
                        transform: "translate(-300px)",
                        filter: "opacity(0%)"
                    }
                ],
                {
                    duration: 500,
                    fill: "forwards",
                    easing: this.overlayAnimation
                }).onfinish = () => {
                    this.setOverlayVisibility(false);
                };
            } else {
                this.setOverlayVisibility(true);
                this.overlayVisible = true;

                this.game.UI.settings.container.animate([
                    {
                        transform: "translate(-300px)",
                        filter: "opacity(0%)"
                    },
                    {
                        transform: "translate(0px)",
                        filter: "opacity(100%)"
                    }
                ],
                    {
                        duration: 500,
                        fill: "forwards",
                        easing: this.overlayAnimation
                    });
            }
        });

        this.load();

        this.game.UI.settings.inputs.forEach((el) => {
            el.addEventListener("change", (ev) => {
                let controlType = ev.target.dataset["type"];
                let fnToExecute = ev.target.dataset["execute"];

                if (typeof this.game.settingsInterface[fnToExecute] !== "function") return;

                this.game.settingsInterface[fnToExecute](this.parseValueAsType(controlType === "boolean" ? ev.target.checked : ev.target.value, controlType));

                this.save();
            });
        })
    }

    /**
     * 
     * @param {HTMLElement} element 
     * @param {*} value value
     */
    setValueOnElement(element, value) {
        if (!element || !value) return;
        if (typeof value === "boolean") {
            element.checked = value;
        } else {
            element.value = value;
        }
    }

    /**
     * 
     * @param {*} value 
     * @param {String} typeName number, float, boolean, string
     * @returns 
     */
    parseValueAsType(value, typeName) {
        let val;
        switch (typeName) {
            case "number":
                val = parseInt(value ?? 0);
                break;

            case "float":
                val = parseFloat(value ?? 0);
                break;

            case "boolean":
                val = value === true;
                break;

            case "string":
                val = String(value ?? "");
                break;
        }

        return val;
    }

    /**
     * 
     * @param {Boolean} state 
     */
    setButtonVisibility(state) {
        state ? this.game.UI.settings.button.classList.remove("hidden") : this.game.UI.settings.button.classList.add("hidden");
    }

    /**
    * 
    * @param {Boolean} state 
    */
    setOverlayVisibility(state) {
        state ? this.game.UI.settings.container.classList.remove("hidden") : this.game.UI.settings.container.classList.add("hidden");
    }

    save() {
        let configStr = JSON.stringify(this.game.CONFIG);
        window.localStorage.setItem(this.lsKey, configStr);
    }

    load() {
        let cfgObj = JSON.parse(window.localStorage.getItem(this.lsKey) ?? "{}");
        let cfgObjKeys = Object.keys(cfgObj);

        cfgObjKeys.forEach((key) => {
            this.game.CONFIG[key] = cfgObj[key];

            let inputElement = this.game.UI.settings.inputs.find((el) => { return el.id === key; });
            this.setValueOnElement(inputElement, cfgObj[key]);
        })

    }
}
