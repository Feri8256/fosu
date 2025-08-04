const fs = require("fs");
const { parseSkinConfig } = require("./skinConfigParser");

const skinListLocation = "db/skins.json";

let dbExists = fs.existsSync(skinListLocation);

function buildSkinList() {
    const files = fs.readdirSync("skins/")
    let skinList = [];

    files.forEach((folder) => {
        let files = fs.readdirSync(`skins/${folder}/`);

        let skinListObj = {
            name: folder,
            src: `skins/${folder}/`
        };

        skinList.push(skinListObj);


        let skinINIexists = fs.existsSync(`skins/${folder}/skin.ini`);
        let skinINIcontent = "";
        if (skinINIexists) skinINIcontent = fs.readFileSync(`skins/${folder}/skin.ini`).toString();

        fs.writeFileSync(`skins/${folder}/skin.json`, JSON.stringify({
            config: skinINIexists ? parseSkinConfig(skinINIcontent) : null,
            files
        }));

    });

    fs.writeFileSync(skinListLocation, JSON.stringify(skinList));
    console.log(`Initialized ${skinList.length} skins\n`);
}

function initSkins() {
    if (dbExists) {
        console.log("skins.json file found. Checking for changes...");
        let skinListStored = JSON.parse(fs.readFileSync(skinListLocation));
        let skinListReaded = fs.readdirSync("skins/");

        if (skinListStored.length === skinListReaded.length) {
            console.log("\t-no changes found in skins directory\n");
        } else {
            console.log("\t-changes found in skins directory");
            buildSkinList();

        }
    } else {
        console.log("skins.json file not found. Initializing...");
        buildSkinList();
    }
}

module.exports = {
    initSkins
}
