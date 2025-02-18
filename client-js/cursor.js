class Particle {
    constructor(game, cur, x, y, sprite) {
        this.game = game;
        this.cur = cur;
        
        //this.sp.additiveColor = true;
        this.fadeOutAni = new this.game.ANI(this.game.clock, this.game.clock + 250, 1, 0, this.game.EASINGS.Linear);
        this.sprite = sprite;
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.additiveColor = true;
        this.sprite.scale = cur.scale;
    }

    update() {
        this.fadeOutAni.update(this.game.clock);
        this.sprite.opacity = this.fadeOutAni.currentValue;
    }

    render(c) {
        this.sprite.render(this.game.ctx);
    }
}

export class Cursor {
    constructor(game) {
        this.game = game;
        this.trails = [];
        this.cursorSprite = new this.game.SPRITE(this.game.skinResourceManager.getSpriteImage("cursor"));
        this.cursorTrailSpriteImage = this.game.skinResourceManager.getSpriteImage("cursortrail");

        this.currentX = 0;
        this.currentY = 0;
        this.prevX = 0;
        this.prevY = 0;
        this.scale = this.game.CONFIG.visuals.cursorScale;

        this.cursorSprite.scale = this.scale;
    }

    update(x, y) {
        this.currentX = x;
        this.currentY = y;

        this.cursorSprite.x = x;
        this.cursorSprite.y = y;

        // The line algorithm locks sometimes when floating point numbers passed into it...
        this.addCursorPoints(
            Math.floor(this.currentX),
            Math.floor(this.currentY),
            Math.floor(this.prevX),
            Math.floor(this.prevY)
        );

        this.prevX = this.currentX;
        this.prevY = this.currentY;

        this.trails.forEach((t) => { t.update(this.game.clock) });

        this.trails = this.trails.filter((p) => { return p.fadeOutAni.amount < 1 })
    }

    render() {
        this.trails.forEach((t) => { t.render() });
        this.cursorSprite.render(this.game.ctx);
    }

    createTrail(x, y) {
        let s = new this.game.SPRITE(this.cursorTrailSpriteImage);
        let trailParticle = new Particle(this.game, this, x, y, s);
        this.trails.push(trailParticle);
    }

    /**
     * https://github.com/itdelatrisu/opsu/blob/master/src/itdelatrisu/opsu/ui/Cursor.java
     * @param {Number} x1 
     * @param {Number} y1 
     * @param {Number} x2 
     * @param {Number} y2 
     */
    addCursorPoints(x1, y1, x2, y2) {
        // delta of exact value and rounded value of the dependent variable
        let d = 0;
        let dy = Math.abs(y2 - y1);
        let dx = Math.abs(x2 - x1);

        let dy2 = (dy << 1);  // slope scaling factors to avoid floating
        let dx2 = (dx << 1);  // polet
        let ix = x1 < x2 ? 1 : -1;  // increment direction
        let iy = y1 < y2 ? 1 : -1;

        let k = 4;  // sample size ( it was 5 )
        if (dy <= dx) {
            for (let i = 0; ; i++) {
                if (i === k) {
                    this.createTrail(x1, y1);
                    i = 0;
                }
                if (x1 === x2)
                    break;
                x1 += ix;
                d += dy2;
                if (d > dx) {
                    y1 += iy;
                    d -= dx2;
                }
            }
        } else {
            for (let i = 0; ; i++) {
                if (i === k) {
                    this.createTrail(x1, y1);
                    i = 0;
                }
                if (y1 === y2)
                    break;
                y1 += iy;
                d += dx2;
                if (d > dy) {
                    x1 += ix;
                    d -= dy2;
                }
            }
        }
    }
}