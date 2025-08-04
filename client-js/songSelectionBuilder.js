export class SongSelectionBuilder {
    constructor(game) {
        this.game = game;
        this.list = [];
        fetch("./db/maps.json")
            .then(resp => resp.json())
            .then((data) => {

                if (data.length === 0) {
                    game.UI.songSelectContainer.innerHTML = game.UI.songSelectContainer.innerHTML + ` 
                        <div class="songselect-card" data-uid="-1"> 
                            <p class="songselect-title">No beatmaps have found!</p> 
                            <br/>
                            <p class="songselect-artistcreator">Download some to get started</p>
                            <br/>
                            <p><b>asd</b></p>
                        </div>
                        `;
                }

                data.forEach((element, i) => {
                    element.difficulties.forEach((diff) => {
                        game.UI.songSelectContainer.innerHTML = game.UI.songSelectContainer.innerHTML + ` 
                        <div class="songselect-card" data-uid="${diff.id}"> 
                            <p class="songselect-title">${diff.title}</p> 
                            <br/>
                            <p class="songselect-artistcreator">${diff.artist} // ${diff.creator}</p>
                            <br/>
                            <p><b>${diff.difficultyName}</b></p>
                        </div>
                        `;
                        this.list.push(diff);

                    });
                });


            })
    }
    getMetadataOfBeatmap(beatmapHash) {
        return this.list.find((e) => { return e.beatmapHash === beatmapHash});
    }
}