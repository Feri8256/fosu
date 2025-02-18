const fs = require("fs");

let dbExists = fs.existsSync("skins.json");

function buildSkinList() {
    const files = fs.readdirSync("skins/")
    let skinList = [];

    files.forEach((folder) => {
        let files = fs.readdirSync(`skins/${folder}/`);

        let skinObj = {
            name: folder,
            src: `skins/${folder}/`
        };

        skinList.push(skinObj);
        fs.writeFileSync(`skins/${folder}/files.json`, JSON.stringify(files));

    });

    fs.writeFileSync("skins.json", JSON.stringify(skinList));
    console.log(`Initialized ${skinList.length} skins\n`);
}

function initSkins() {
    if (dbExists) {
        console.log("skins.json file found. Checking for changes...");
        let skinListStored = JSON.parse(fs.readFileSync("skins.json"));
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
