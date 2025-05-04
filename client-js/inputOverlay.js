export class InputOverlay {
    constructor(game) {
        this.game = game;
        this.background = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("inputoverlay-background"));
        this.keySpriteImg = this.game.skinResourceManager.getSpriteImage("inputoverlay-key");
        this.keySprites = [
            new this.game.SPRITE(this.keySpriteImg),
            new this.game.SPRITE(this.keySpriteImg),
            new this.game.SPRITE(this.keySpriteImg)
        ]
        this.background.rotation = Math.PI * 0.5; // 90 deg
        this.background.origin_y = 0;
        this.background.flip_v = false;

        this.x = this.game.canvas.width;
        this.y = this.game.canvas.height * 0.5;

        this.background.x = this.x;
        this.background.y = this.y;

        this.inputStates = [false, false, false];
        this.inputCounts = [0, 0, 0];

        this.bgWidth = 55;
        this.bgHeight = 193;
        this.keyWidth = this.keySpriteImg?.w ?? 1;
        this.keyHeight = this.keySpriteImg?.h ?? 1;
        this.keySprites.forEach((s, i) => {
            s.x = this.x - this.keyWidth * 0.5;
            s.y = (this.y - this.bgHeight * 0.5) + ((i + 1) * this.keyHeight);
        });
    }

    update() {
        this.x = this.game.canvas.width;
        this.y = this.game.canvas.height * 0.5;
        this.background.x = this.x;
        this.background.y = this.y;

        this.keySprites.forEach((s, i) => {
            s.x = this.x - this.keyWidth * 0.5;
            s.y = (this.y - this.bgHeight * 0.5) + ((i + 1) * this.keyHeight);
        });
    }

    updateInputState(arr = [false, false, false]) {
        for (let i = 0; i < arr.length; i++) {
            let d = arr[i].down;

            if (d !== this.inputStates[i] && d) {
                this.inputCounts[i]++;
            }
            this.inputStates[i] = d;

            this.keySprites[i].scale = d ? 0.85 : 1;
        }
    }

    render() {
        this.background.render(this.game.ctx);
        this.keySprites.forEach((k, i) => {
            k.render(this.game.ctx);
            this.renderNumber(this.inputCounts[i], this.game.canvas.width - (this.keyWidth * 0.5), k.y, k.scale);
        });
    }

    renderNumber(n, x, y, s) {
        this.game.ctx.save();
        this.game.ctx.translate(x, y);
        this.game.ctx.scale(s, s);
        this.game.ctx.font = "18px Arial";
        this.game.ctx.fillStyle = "#fff";
        this.game.ctx.textAlign = "center";
        this.game.ctx.textBaseline = "middle";
        this.game.ctx.fillText(n, 0, 0);
        this.game.ctx.restore();
    }
}