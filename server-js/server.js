const fs = require("fs");
const beatmapInitializer = require("./initBeatmaps.js");
const skinInitializer = require("./initSkins.js");
const importer = require("./importManager.js");
const server = require("live-server");

process.on("uncaughtException", (er) => { fs.appendFileSync("error.log", `${er.stack}\n\n`)})

var params = {
	port: 7270, 
	open: true,
	file: "index.html",
	wait: 2000,
	logLevel: 0,
};

console.clear();

function importCheckDone() {
	beatmapInitializer.initSongs();
	skinInitializer.initSkins();
	
	console.log("starting...\n");
	server.start(params);
	console.log("Keep this window open while playing!\nif the client is not opened in your browser, visit: http://127.0.0.1:7270");
}

console.log("Hello there!\n");
console.log(`fosu is at "${process.cwd()}"\n`);

importer.checkImportsFolder(importCheckDone);
