export class ScoreBoardManager {
    constructor(game) {
        this.game = game;
        this.currentScoreList = [];

        document.addEventListener("click", (evt) => {
            if (!evt.target.classList.contains("scoreentry")) return;
            this.select(evt.target.dataset.replayid, evt.target.dataset.beatmaphash, evt.target.dataset.playername);
        });

        this.game.socket.on("scoreList", (list) => {
            this.currentScoreList = list;
            this.game.UI.scoreBoard.container.innerHTML = "";
            if (list.length === 0) {
                this.game.UI.scoreBoard.container.innerHTML += `
                <div class="scoreentry" data-replayid="0" style="--scoreentry-index: 0;">
                    <p class="scoreentry-playername">No scores achieved yet</p>
                </div>
                `;
            }
            list.forEach((s, i) => {
                let scoreDate = new Date(s.date).toDateString();

                // No need to animate a scoreboard element that is not visible, so the style tag of those elements will be left empty
                if (i > 10) {
                    this.game.UI.scoreBoard.container.innerHTML += `
                    <div class="scoreentry" data-replayid="${s.replayId}" data-beatmaphash="${s.beatmapHash}" data-playername="${s.playerName}">
                    <p class="scoreentry-playername">${s.playerName}</p>
                    <p class="scoreentry-score">${s.results.score} (${s.results.combo}x)</p>
                    <p class="scoreentry-date">${scoreDate}</p>
                    </div>
                    `;
                } else {
                    this.game.UI.scoreBoard.container.innerHTML += `
                    <div class="scoreentry" data-replayid="${s.replayId}" data-beatmaphash="${s.beatmapHash}" data-playername="${s.playerName}" style="--scoreentry-index: ${i};">
                    <p class="scoreentry-playername">${s.playerName}</p>
                    <p class="scoreentry-score">${s.results.score} (${s.results.combo}x)</p>
                    <p class="scoreentry-date">${scoreDate}</p>
                    </div>
                    `;
                }

            });
        })
    }

    getScoresForMap(beatmapHash) {
        this.currentBeatmapHash = beatmapHash;
        this.game.socket.emit("getScores", beatmapHash ?? "0");
        this.game.UI.scoreBoard.container.innerHTML = `<p class="scoreentry-date">wait..</p>`;
    }

    setBoardVisibility(state) {
        state ? this.game.UI.scoreBoard.container.classList.remove("hidden") : this.game.UI.scoreBoard.container.classList.add("hidden");
    }


    select(replayId, beatmapHash, playerName) {
        if (!beatmapHash) return;
        let mapMeta = this.game.songSelectBuilder.getMetadataOfBeatmap(beatmapHash);
        let score = this.currentScoreList.find((s) => { return s.replayId === replayId; })
        this.game.resultScreenUpdater.update({
            playerName,
            mapArtist: mapMeta.artist,
            mapTitle: mapMeta.title,
            mapCreator: mapMeta.creator,
            mapVersion: mapMeta.difficultyName,
            countPerfect: score.results.perfect,
            countOkay: score.results.okay,
            countMeh: score.results.meh,
            countMiss: score.results.miss,
            countMaxCombo: score.results.combo,
            acc: score.results.accuracy,
            replayId,
            date: score.date,
            score: score.score
        });
        this.game.setState(this.game.STATE_ENUM.RESULT);
    }
}