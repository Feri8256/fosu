export class SkinResourceManager {
    constructor(game) {
        this.game = game;
        this.skinsBaseUrl = "skins"
        this.defaultPath = "client-files"

        this.filesNeeded = {
            sprites: [
                "approachcircle.png",
                "hitcircle.png",
                "hitcircleoverlay.png",
                "hit0.png",
                "hit50.png",
                "hit100.png",
                "hit300.png",
                "cursor.png",
                "cursortrail.png",
                "score-0.png",
                "score-1.png",
                "score-2.png",
                "score-3.png",
                "score-4.png",
                "score-5.png",
                "score-6.png",
                "score-7.png",
                "score-8.png",
                "score-9.png",
                "score-dot.png",
                "score-x.png",
                "inputoverlay-background.png",
                "inputoverlay-key.png",
                "sliderb.png",
                "sliderfollowcircle.png",
                "reversearrow.png"
            ],
            sounds: [
                "combobreak.wav",
                "normal-hitnormal.wav",
                "normal-hitclap.wav",
                "normal-hitfinish.wav",
                "normal-hitwhistle.wav",
                "soft-hitnormal.wav",
                "soft-hitclap.wav",
                "soft-hitfinish.wav",
                "soft-hitwhistle.wav",
                "drum-hitnormal.wav",
                "drum-hitclap.wav",
                "drum-hitfinish.wav",
                "drum-hitwhistle.wav"
            ]
        }

        this.spriteImages = {};
        this.sounds = {};

    }
    getSpriteImage(name) {
        return this.spriteImages[name];
    }

    loadDefault() {
        this.filesNeeded.sprites.forEach((fileName) => {
            this.spriteImages[fileName.split(".").at(0)] = new this.game.SPRITEIMG(`${this.defaultPath}/${fileName}`);
        });

        this.filesNeeded.sounds.forEach((fileName) => {
            this.game.auMgr.loadFile(`${this.defaultPath}/${fileName}`, fileName.split(".").at(0));
        });
    }

    /**
     * Loading skin files from the specified directory. If a file not present it will fall back to the default files
     * @param {String} folderName 
     */
    loadSkin(folderName) {

        if (!folderName) {
            this.loadDefault();
            return;
        }

        fetch(`skins/${folderName}/files.json`)
            .then((resp) => resp.json())
            .then((d) => {
                // Load sprites
                this.filesNeeded.sprites.forEach((fileName) => {
                    if (d.includes(fileName)) {
                        this.spriteImages[fileName.split(".").at(0)] = new this.game.SPRITEIMG(`${this.skinsBaseUrl}/${folderName}/${fileName}`);
                    } else {
                        this.spriteImages[fileName.split(".").at(0)] = new this.game.SPRITEIMG(`${this.defaultPath}/${fileName}`);
                    }
                });

                // Load sounds
                this.filesNeeded.sounds.forEach((fileName) => {
                    if (d.includes(fileName)) {
                        this.game.auMgr.loadFile(`${this.skinsBaseUrl}/${folderName}/${fileName}`, fileName.split(".").at(0));
                    } else {
                        this.game.auMgr.loadFile(`${this.defaultPath}/${fileName}`, fileName.split(".").at(0));
                    }
                });
            })
    }


}