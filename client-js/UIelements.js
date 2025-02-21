const ui = {
    songSelectContainer: document.querySelector("#songselect-container"),
    songSelectMetadata: {
        container: document.querySelector("#songselect-metadata"),
        title: document.querySelector("#meta-title"),
        creator: document.querySelector("#meta-creator"),
        artist: document.querySelector("#meta-artist"),
        diffName: document.querySelector("#meta-diffname"),
        AR: document.querySelector("#meta-ar"),
        CS: document.querySelector("#meta-cs"),
        OD: document.querySelector("#meta-od"),
        HP: document.querySelector("#meta-hp")

    },

    pauseOverlay: document.querySelector("#pause-overlay"),
    pauseButtons: {
        continue: document.querySelector("#pause-continue"),
        retry: document.querySelector("#pause-retry"),
        back: document.querySelector("#pause-back"),
    },

    resultScreen: {
        container: document.querySelector("#result"),
        perfectCount: document.querySelector("#result-300"),
        okayCount: document.querySelector("#result-100"),
        mehCount: document.querySelector("#result-50"),
        missCount: document.querySelector("#result-0"),
        accuracy: document.querySelector("#result-acc"),
        maxComboCount: document.querySelector("#result-maxcombo"),
    },

    resultMetadata: {
        container: document.querySelector("#result-metadata"),
        title: document.querySelector("#resultmeta-title"),
        creator: document.querySelector("#resultmeta-creator"),
        artist: document.querySelector("#resultmeta-artist"),
        diffName: document.querySelector("#resultmeta-diffname"),
    },


    introSkipButton: document.querySelector("#play-skip-btn")
}

export default ui;
