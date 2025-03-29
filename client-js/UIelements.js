const $ = (s) => document.querySelector(s);

export function getElements() {
    return {
        songSelectContainer: $("#songselect-container"),
        songSelectMetadata: {
            container: $("#songselect-metadata"),
            title: $("#meta-title"),
            creator: $("#meta-creator"),
            artist: $("#meta-artist"),
            diffName: $("#meta-diffname"),
            AR: $("#meta-ar"),
            CS: $("#meta-cs"),
            OD: $("#meta-od"),
            HP: $("#meta-hp")

        },

        pauseOverlay: $("#pause-overlay"),
        pauseButtons: {
            continue: $("#pause-continue"),
            retry: $("#pause-retry"),
            back: $("#pause-back"),
        },

        resultScreen: {
            container: $("#result"),
            perfectCount: $("#result-300"),
            okayCount: $("#result-100"),
            mehCount: $("#result-50"),
            missCount: $("#result-0"),
            accuracy: $("#result-acc"),
            maxComboCount: $("#result-maxcombo"),
        },

        resultMetadata: {
            container: $("#result-metadata"),
            title: $("#resultmeta-title"),
            creator: $("#resultmeta-creator"),
            artist: $("#resultmeta-artist"),
            diffName: $("#resultmeta-diffname"),
        },


        introSkipButton: $("#play-skip-btn"),

        settings: {
            container: $("#settings"),
            button: $("#settings-btn"),
            inputs: [
                $("#musicVolume"),
                $("#effectVolume"),
                $("#skin"),
                $("#cursorScale"),
                $("#cursortrailType"),
            ]
        }
    }
}