const extractZip = require("extract-zip");
const fs = require("fs");

const importsDirName = "imports";
const importableTypes = [
    {
        name: "beatmap",
        target: "songs",
        ext: "osz"
    },
    {
        name: "skin",
        target: "skins",
        ext: "osk"
    }
]

/**
 * 
 * @param {Function} callback run that when everything finished here
 */
function checkImportsFolder(callback) {
    console.log("Checking imports folder...");
    let files = fs.readdirSync(`${importsDirName}/`);

    //let importableFiles = files.filter((name) => { return name.endsWith(".osk") || name.endsWith(".osz") });

    let i = 0;
    function importNextFile() {
        // Finished importing or no files
        if (i === files.length) {
            console.log("\n");
            // This timeout is for making sure that the file system registeres the new files, before the next step
            setTimeout(callback, 3000);
            return;
        }

        let currentFileType = importableTypes.find((s) => { return files[i].split(".").at(-1) === s.ext });

        // A non-supported file appears, just skip it
        if (!currentFileType) {
            console.log(`\tNot supported file: ${files[i]}`);
            i++;
            importNextFile();
        }

        // Before extracting a beatmap, create its own folder in the songs directory
        if (currentFileType.target === "songs") fs.mkdirSync(`songs/${files[i].replace(`.${currentFileType.ext}`, "")}`);

        extractZip(`${importsDirName}/${files[i]}`, { dir: `${process.cwd()}/${currentFileType.target}/${files[i].replace(`.${currentFileType.ext}`, "")}` })
            .then(() => {
                console.log(`\timported ${currentFileType.name}: ${files[i]}`);

                // Delete what we've just imported
                fs.unlinkSync(`${importsDirName}/${files[i]}`);

                // Calling itself to do the next
                if (i < files.length) {
                    i++;
                    importNextFile();
                }
            })
    }

    // Start!
    importNextFile();
}

module.exports = {
    checkImportsFolder
}