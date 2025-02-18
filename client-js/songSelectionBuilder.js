export class SongSelectionBuilder {
    constructor(game) {
        this.game = game;
        fetch("./maps.json")
            .then(resp => resp.json())
            .then((data) => {

                if (data.length === 0) {
                    game.songSelectContainer.innerHTML = game.songSelectContainer.innerHTML + ` 
                        <div class="songselect-card" data-uid="-1" data-ausrc="" data-bgsrc="" data-bmsrc="" data-pre="-1" data-title="" data-creator="" data-diffname="" data-artist="" data-ar="" data-cs="" data-od="" data-hp=""> 
                            <p class="songselect-title">No beatmaps have found!</p> 
                            <br/>
                            <p class="songselect-artistcreator">Download some to get started</p>
                            <br/>
                            <p><b>asd</b></p>
                        </div>
                        `;
                }
                
                data.forEach((element, i) => {
                    element.difficulties.forEach((diff, j) => {
                        game.songSelectContainer.innerHTML = game.songSelectContainer.innerHTML + ` 
                        <div class="songselect-card" data-uid="${i}${j}" data-ausrc="${diff.audioSrc}" data-bgsrc="${diff.backgroundSrc}" data-bmsrc="${diff.beatmapSrc}" data-pre="${diff.previewTime}" data-title="${diff.title}" data-creator="${diff.creator}" data-diffname="${diff.difficultyName}" data-artist="${diff.artist}" data-ar="${diff.AR}" data-cs="${diff.CS}" data-od="${diff.OD}" data-hp="${diff.HP}"> 
                            <p class="songselect-title">${diff.title}</p> 
                            <br/>
                            <p class="songselect-artistcreator">${diff.artist} // ${diff.creator}</p>
                            <br/>
                            <p><b>${diff.difficultyName}</b></p>
                        </div>
                        `;
                    });
                });

                
            })
    }
}