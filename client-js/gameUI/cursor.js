import { Sprite } from "../graphics/sprite.js";
import { Animation } from "../animationEngine.js";
import { ObjectPooler } from "../objectPooler.js";

class Particle {
    constructor(game, cur, x, y, sprite, additiveMode = false) {
        this.game = game;
        this.cur = cur;

        this.fadeOutAni = new Animation();
        this.sprite = sprite;
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.additiveColor = additiveMode ? true : false;
        this.sprite.scale = cur.scale;

        this.x = 0;
        this.y = 0;
        this.a = false;

        this.active = false;

        this.firstUpdate = true;
    }

    update() {
        if (!this.active) return;
        //this.sprite = sprite;
        if (this.firstUpdate) {
            this.fadeOutAni = new Animation(this.game.clock, this.game.clock + 250, 1, 0);
            this.firstUpdate = false;
        }
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.additiveColor = this.a;

        this.fadeOutAni.update(this.game.clock);
        this.sprite.opacity = this.fadeOutAni.currentValue;
        if (this.fadeOutAni.amount === 1) this.active = false;
    }

    reset() {
        this.x = -100;
        this.y = -100;
        this.a = false;
        
        this.firstUpdate = true;
        this.active = false;
    }

    render() {
        this.sprite.render(this.game.ctx);
    }
}

export class Cursor {
    constructor(game, isRotating) {
        this.game = game;
        this.isRotatingEnabled = isRotating;
        this.rotationConstant = 0.01;

        this.trailType = this.game.CONFIG.cursortrailType;
        this.scale = this.game.CONFIG.cursorScale;

        this.cursorSprite = new Sprite(this.game.skinResourceManager.getSpriteImage("cursor"));
        this.cursorMiddleSprite = new Sprite(this.game.skinResourceManager.getSpriteImage("cursormiddle"));
        this.cursorTrailSpriteImage = this.game.skinResourceManager.getSpriteImage("cursortrail");

        this.currentX = 0;
        this.currentY = 0;
        this.prevX = 0;
        this.prevY = 0;
        this.lastParticleCreatedAtMs = 0;

        this.particles = new ObjectPooler(
            () => {
                return new Particle(this.game, this, -100, -100, new Sprite(this.cursorTrailSpriteImage), true);
            },
            200
        );


        this.cursorSprite.scale = this.scale;
    }

    setPosition(x = 0, y = 0) {
        this.currentX = Math.floor(x);
        this.currentY = Math.floor(y);
        this.cursorSprite.x = this.cursorMiddleSprite.x = this.currentX;
        this.cursorSprite.y = this.cursorMiddleSprite.y = this.currentY;
    }

    getPosition() {
        return { x: this.currentX, y: this.currentY };
    }

    update() {
        this.cursorSprite.scale = this.scale;
        this.cursorMiddleSprite.scale = this.scale;
        this.trailType = this.game.CONFIG.cursortrailType;


        if (this.isRotatingEnabled) this.cursorSprite.rotation += this.rotationConstant * (this.game.deltaTime / 16);

        switch (this.trailType) {
            case 0:
                this.addCursorPoints(
                    this.currentX,
                    this.currentY,
                    this.prevX,
                    this.prevY
                );
                break;

            case 1:
                if (this.lastParticleCreatedAtMs + 33 > this.game.clock) return;
                this.spawnTrail(this.currentX, this.currentY, false);
                this.lastParticleCreatedAtMs = this.game.clock;
                break;

            case 2:
                break;
        }

        this.prevX = this.currentX;
        this.prevY = this.currentY;

        this.particles.updateAllActive(this.game.clock);
    }

    render() {
        this.particles.active.forEach((t) => { t.render() });
        this.cursorSprite.render(this.game.ctx);
        this.cursorMiddleSprite.render(this.game.ctx);
    }

    spawnTrail(x, y, a = false) {
        let p = this.particles.get();
        p.x = x;
        p.y = y;
        p.a = a;
        p.active = true;
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

        let k = 3;  // sample size
        if (dy <= dx) {
            for (let i = 0; ; i++) {
                if (i === k) {
                    //this.createTrail(x1, y1, true);
                    this.spawnTrail(x1, y1, true);
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
                    //this.createTrail(x1, y1, true);
                    this.spawnTrail(x1, y1, true);
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