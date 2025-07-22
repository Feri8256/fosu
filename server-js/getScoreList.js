const fs = require("fs");

function getScoreList(socket, beatmapHash) {

    let out = [];

    if (fs.existsSync(`./db/s/${beatmapHash}`)) {
        const l = fs.readdirSync(`./db/s/${beatmapHash}`);

        l.forEach((s) => {
            const file = fs.readFileSync(`./db/s/${beatmapHash}/${s}`).toString();
            const tokens = file.split(",");
            out.push(
                {
                    playerName: tokens[0],
                    date: parseInt(tokens[1]),
                    replayId: tokens[2],
                    beatmapHash: tokens[3],
                    results: {
                        perfect: parseInt(tokens[4]),
                        okay: parseInt(tokens[5]),
                        meh: parseInt(tokens[6]),
                        miss: parseInt(tokens[7]),
                        accuracy: parseFloat(tokens[8]),
                        combo: parseInt(tokens[9]),
                        score: Number(tokens[10] ?? 0)
                    }
                }
            );
        });

        out.sort((a, b) => { return b.results.score - a.results.score; });

        socket.emit("scoreList", out);
    } else {
        socket.emit("scoreList", out);
    }

}

module.exports = {
    getScoreList
}