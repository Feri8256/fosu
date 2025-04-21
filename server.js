const fs = require("fs");
const beatmapInitializer = require("./server-js/initBeatmaps.js");
const skinInitializer = require("./server-js/initSkins.js");
const importer = require("./server-js/importManager.js");
const liveserver = require("live-server");
const { getScoreList } = require("./server-js/getScoreList.js");
const { setScore } = require("./server-js/setScore.js");
const { ReplayFileManager } = require("./server-js/replayFileManager.js");

const replayFileManager = new ReplayFileManager();



process.on("uncaughtException", (er) => { fs.appendFileSync("error.log", `${er.stack}\n\n`) })

var params = {
	port: 7270,
	open: true,
	ignorePattern: /\/|\\db\/|\\/,
	file: "index.html",
	wait: 2000,
	logLevel: 2,
	mount: [["/socket.io", "./node_modules/socket.io/"]]
};


console.clear();

function importCheckDone() {
	beatmapInitializer.initSongs();
	skinInitializer.initSkins();

	console.log("starting...\n");
	liveserver.start(params);
	console.log("Keep this window open while playing!\nif the client is not opened in your browser, visit: http://127.0.0.1:7270");
}

console.log("Hello there!\n");
console.log(`fosu is at "${process.cwd()}"\n`);

importer.checkImportsFolder(importCheckDone);



const { Server } = require("socket.io");

const io = new Server({
	cors: {
		origin: "http://127.0.0.1:7270"
	}
});

io.on("connection", (socket) => {
	console.log("client connected!");

	socket.on("getScores", (h) => { getScoreList(socket, h); });

	socket.on("submitScore", (o) => { setScore(o.playerName, o.beatmapHash, o.replayId, o.results) });

	socket.on("gameplayEventsCapture", (a) => { replayFileManager.appendEvents(a) });
	socket.on("gameplayEventsCaptureStart", (o) => { replayFileManager.beginCapture(o.playerName, o.beatmapHash, o.replayId) });
	socket.on("gameplayEventsCaptureStop", (x) => { replayFileManager.stopCapture() });
});

io.listen(7271);

