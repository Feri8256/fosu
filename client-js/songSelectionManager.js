export class songSelectionManager {
    constructor(game) {
        this.game = game;

        this.prevSelect = {
            au: "",
            bg: "",
            uid: "",
            prev: 0,
            scroll: 0
        }

        window.addEventListener("click", (ev) => { this.select(ev.target); });

        this.listElements = document.querySelectorAll(".songselect-card");
        this.currentSelectionIndex = 0;
        this.lastSelectionTimestamp = 0;
    }

    select(element) {
        if (!element.dataset.uid) return;

        element.scrollIntoView({ behavior: "smooth", block: "center" });

        let selectedAu = element.dataset.ausrc;
        let selectedUID = element.dataset.uid;
        let selectedBG = element.dataset.bgsrc;
        let selectedBM = element.dataset.bmsrc;
        let selectedPre = parseFloat(element.dataset.pre);


        if (this.prevSelect.au !== selectedAu) this.changeAudioSource(selectedAu, selectedPre);
        if (this.prevSelect.bg !== selectedBG) this.changeBackground(selectedBG);
        if (this.prevSelect.uid !== selectedUID) this.changeMetadata(element.dataset);

        if (this.prevSelect.uid === selectedUID) this.startMapLoading(selectedBM);


        this.prevSelect.au = selectedAu;
        this.prevSelect.bg = selectedBG;
        this.prevSelect.uid = selectedUID;
        this.prevSelect.prev = selectedPre;

        this.prevSelect.scroll = window.scrollY;
    }

    changeAudioSource(newURL, time) {
        this.game.songAudioHandler.load(newURL);
        this.game.songAudioHandler.startPreview(time);
    }

    /**
     * 
     * @param {String} newURL 
     * @returns 
     */
    changeBackground(newURL) {
        this.game.backgroundManager.setImage(newURL);
    }

    changeMetadata(elementDataset) {
        this.game.songSelectMetadata.title.textContent = elementDataset.title;
        this.game.songSelectMetadata.creator.textContent = elementDataset.creator;
        this.game.songSelectMetadata.artist.textContent = elementDataset.artist;
        this.game.songSelectMetadata.diffName.textContent = elementDataset.diffname;
        this.game.songSelectMetadata.AR.textContent = elementDataset.ar;
        this.game.songSelectMetadata.CS.textContent = elementDataset.cs;
        this.game.songSelectMetadata.OD.textContent = elementDataset.od;
        this.game.songSelectMetadata.HP.textContent = elementDataset.hp;
    }

    startMapLoading(url) {
        if(!url) return;
        this.game.setState(this.game.STATE_ENUM.LOADING);
        this.game.beatmapLoader.load(url);
    }

    keyArrowSelect(direction) {
        if (this.lastSelectionTimestamp + 200 > this.game.clock) return;

        // When i run this query selector in the constructor it returns undefined so it took place here
        if (!this.listElements.length) this.listElements = document.querySelectorAll(".songselect-card");
        if (direction === 0) return;

        this.currentSelectionIndex += direction;
        if (this.currentSelectionIndex > this.listElements.length - 1) this.currentSelectionIndex = 0;
        if (this.currentSelectionIndex < 0) this.currentSelectionIndex = this.listElements.length - 1;

        this.select(this.listElements[this.currentSelectionIndex]);
        this.lastSelectionTimestamp = this.game.clock;
    }

    scrollToLastPosition() {
        window.scrollTo(0, this.prevSelect.scroll);
    }
}