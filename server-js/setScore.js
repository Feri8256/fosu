const fs = require("fs");

/**
 * 
 * @param {String} playerName 
 * @param {String} beatmapHash 
 * @param {String} replayId 
 * @param {any} results 
 */
function setScore(playerName, beatmapHash, replayId, results) {
    let dbExists = fs.existsSync("./db");
    let scoresExists = fs.existsSync("./db/s");
    let beatmapFolderExists = fs.existsSync(`./db/s/${beatmapHash}`);

    if (!dbExists) fs.mkdirSync("db");
    if (!scoresExists) fs.mkdirSync("db/s");
    if (!beatmapFolderExists) fs.mkdirSync(`./db/s/${beatmapHash}`);

    let out = `${playerName},${Date.now()},${replayId},${beatmapHash},${results.perfect},${results.okay},${results.meh},${results.miss},${results.accuracy},${results.combo}`;

    fs.writeFile(`./db/s/${beatmapHash}/${Date.now()}`, Buffer.from(out), () => { console.log("played: %s by: %s", beatmapHash, playerName)});
    
}

module.exports = {
    setScore
}