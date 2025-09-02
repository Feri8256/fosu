const fs = require("fs");
const { parseOsu } = require("./osuParser.js");
const crypto = require("crypto");

const mapListLocation = "db/maps.json";

let dbExists = fs.existsSync(mapListLocation);
let mapsetCount = 0;
let mapCount = 0;

function buildMapList() {
    const songsFiles = fs.readdirSync("./songs/");

    let output = [];

    songsFiles.forEach((folder) => {
        let beatmapFiles = fs.readdirSync(`./songs/${folder}/`);
        let osuFiles = beatmapFiles.filter((checkFileName) => { return checkFileName.endsWith("osu"); });

        let mapsetObj = {
            difficulties: []
        };

        for (let index = 0; index < osuFiles.length; index++) {
            const osuFileName = osuFiles[index];
            const osuFileContent = fs.readFileSync(`./songs/${folder}/${osuFileName}`).toString();
            let mapObj = {};
            let { General, Metadata, Events, Difficulty } = parseOsu(osuFileContent);
            

            // When the beatmaps gamemode is not osu!standard, ignore it
            if (General.Mode !== 0) continue;

            console.log(osuFileName);
            
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
            mapObj.id = crypto.randomUUID();
            mapObj.beatmapHash = crypto.createHash("md5").update(osuFileContent).digest("hex"); //

            mapsetObj.difficulties.push(mapObj);
            mapCount++;
        }
        //osuFiles.forEach((osuFileName) => {

        //});

        output.push(mapsetObj);
        mapsetCount++;
    });

    fs.writeFileSync(mapListLocation, JSON.stringify(output));
    console.log(`Initialized ${mapsetCount} mapsets with a total of ${mapCount} beatmaps\n`);
}

function initSongs() {
    if (dbExists) {
        console.log("maps.json file found. Checking for changes...");
        let mapListStored = JSON.parse(fs.readFileSync(mapListLocation));
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
