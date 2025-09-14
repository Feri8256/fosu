export class songSelectionManager {
    constructor(game) {
        this.game = game;

        this.scroll = 0;

        window.addEventListener("click", (ev) => { this.select(ev.target); });
        this.game.UI.songSelectActions.randomBtn.addEventListener("click", () => { this.selectRandom(); });

        this.listElements = document.querySelectorAll(".songselect-card");
        this.currentSelectionIndex = 0;
        this.lastSelectionTimestamp = 0;

        this.previousSelect = {};
        this.currentSelect = {};
    }

    select(element) {
        if (!element.dataset.uid) return;

        element.scrollIntoView({ behavior: "smooth", block: "center", inline: "start" });

        this.currentSelect = this.game.songSelectBuilder.list.find((e) => { return e.id === element.dataset.uid; });

        if (!this.currentSelect) return;

        if (this.previousSelect.audioSrc !== this.currentSelect.audioSrc) this.changeAudioSource(this.currentSelect.audioSrc, this.currentSelect.previewTime);
        if (this.previousSelect.backgroundSrc !== this.currentSelect.backgroundSrc) this.changeBackground(this.currentSelect.backgroundSrc);
        if (this.previousSelect.id !== this.currentSelect.id) {
            this.changeMetadata();
            this.game.auMgr.playAudioClip("select-difficulty");
            this.game.scoreBoardManager.getScoresForMap(this.currentSelect.beatmapHash);
        }

        if (this.previousSelect.id === this.currentSelect.id) {
            this.startMapLoading(this.currentSelect.beatmapSrc);
            this.game.auMgr.playAudioClip("menuhit");
        }

        this.previousSelect = this.currentSelect;

        this.scroll = window.scrollY;
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

    changeMetadata() {
        this.game.UI.songSelectMetadata.title.textContent = this.currentSelect.title;
        this.game.UI.songSelectMetadata.creator.textContent = this.currentSelect.creator;
        this.game.UI.songSelectMetadata.artist.textContent = this.currentSelect.artist;
        this.game.UI.songSelectMetadata.diffName.textContent = this.currentSelect.difficultyName;
        this.game.UI.songSelectMetadata.AR.textContent = this.currentSelect.AR;
        this.game.UI.songSelectMetadata.CS.textContent = this.currentSelect.CS;
        this.game.UI.songSelectMetadata.OD.textContent = this.currentSelect.OD;
        this.game.UI.songSelectMetadata.HP.textContent = this.currentSelect.HP;
    }

    startMapLoading(url) {
        if (!url) return;
        this.game.setState(this.game.STATE_ENUM.LOADING);
        this.game.beatmapLoader.load(url);
    }

    scrollToLastPosition() {
        window.scrollTo(0, this.scroll);
    }

    getRandomListItem() {
        let ri = Math.floor(Math.random() * this.listElements.length);
        return this.listElements[ri];
    }

    selectRandom() {
        if (this.listElements.length === 0) this.listElements = document.querySelectorAll(".songselect-card");
        //this.previousSelect.id = -1; // the same index twice in a row gonna start the beatmap right away, we not let it do that
        let randomElement = this.getRandomListItem();
        this.select(randomElement);
    }
}