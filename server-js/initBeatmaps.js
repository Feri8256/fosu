const fs = require("fs");
const { parseOsu } = require("./osuParser.js");

let dbExists = fs.existsSync("maps.json");
let mapsetCount = 0;
let mapCount = 0;

function buildMapList() {
    const files = fs.readdirSync("songs/");

    let output = [];

    files.forEach((folder) => {
        let files = fs.readdirSync(`songs/${folder}/`);
        let osuFiles = files.filter((checkFileName) => { return checkFileName.endsWith(".osu") });

        let mapsetObj = {
            difficulties: []
        };

        for (let index = 0; index < osuFiles.length; index++) {
            const osuFileName = osuFiles[index];
            let mapObj = {};
            let { General, Metadata, Events, Difficulty } = parseOsu(fs.readFileSync(`songs/${folder}/${osuFileName}`).toString());

            // When the beatmaps gamemode is not osu!standard, ignore it
            if (General.Mode !== 0) continue;

            mapObj.mode = General.Mode;
            mapObj.title = Metadata.Title;
            mapObj.artist = Metadata.Artist;
            mapObj.creator = Metadata.Creator;
            mapObj.difficultyName = Metadata.Version;
            mapObj.beatmapSrc = `songs/${folder}/${osuFileName}`;
            mapObj.audioSrc = `songs/${folder}/${General.AudioFilename}`;
            mapObj.previewTime = General.PreviewTime;
            mapObj.backgroundSrc = `songs/${folder}/${Events.BackgroundImage}`;
            mapObj.AR = Difficulty.ApproachRate;
            mapObj.CS = Difficulty.CircleSize;
            mapObj.OD = Difficulty.OverallDifficulty;
            mapObj.HP = Difficulty.HPDrainRate;
            mapObj.id = mapCount;

            mapsetObj.difficulties.push(mapObj);
            mapCount++;
        }
        //osuFiles.forEach((osuFileName) => {

        //});

        output.push(mapsetObj);
        mapsetCount++;
    });

    fs.writeFileSync("maps.json", JSON.stringify(output));
    console.log(`Initialized ${mapsetCount} mapsets with a total of ${mapCount} beatmaps\n`);
}

function initSongs() {
    if (dbExists) {
        console.log("maps.json file found. Checking for changes...");
        let mapListStored = JSON.parse(fs.readFileSync("maps.json"));
        let mapListReaded = fs.readdirSync("songs/");

        if (mapListStored.length === mapListReaded.length) {
            console.log("\t-no changes found in songs directory\n");
        } else {
            console.log("\t-changes found in songs directory");
            buildMapList();

        }
    } else {
        console.log("maps.json file not found. Initializing...");
        buildMapList();
    }
}

module.exports = {
    initSongs
}
