export class SpriteFontRenderer {
    /**
     * 
     * @param {String} text 
     * @param {Map<String, Sprite>} fontSet 
     * @param {Number} spacing spacing between the sprites. Set it to `-1` for automatic
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} scale 
     * @param {Number} opacity 
     * @param {Number} origin_x 
     * @param {Number} origin_y 
     */
    constructor(text = "", fontSet, spacing = -1, x = 0, y = 0, scale = 1, opacity = 1, origin_x = 0, origin_y = 0) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.opacity = opacity;

        this.origin_x = origin_x;
        this.origin_y = origin_y;
        this.textWidth = 0;

        this.fontSet = fontSet;
        this.defaultSpacing = spacing;

        this.currentX = 0;

        this.updateText(this.text);
    }

    /**
     * 
     * @param {String} newText 
     * @returns 
     */
    updateText(newText) {
        if (!newText) return;
        this.text = newText;

        this.currentX = this.x;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx) {
        ctx.save();

        ctx.translate(this.x, this.y);

        ctx.scale(this.scale, this.scale);

        this.currentX = 0;
        let spacingToNext = 0;
        for (let i = 0; i < this.text.length; i++) {
            let char = this.text.charAt(i);
            let sprite = this.fontSet.get(char);
            if (!sprite) continue;

            sprite.x = (this.currentX + spacingToNext) - (this.textWidth * this.origin_x);
            sprite.y = -(sprite.spriteImage.h * this.origin_y);
            sprite.opacity = this.opacity;


            this.currentX += spacingToNext;
            spacingToNext = this.defaultSpacing === -1 ? sprite.spriteImage.w : this.defaultSpacing;

            sprite.render(ctx);

            
        }

        this.textWidth = this.currentX + spacingToNext;

        ctx.resetTransform();
        ctx.restore();
    }
}


/**
 * 
 * set = {
 *  "a": new Sprite(sprite_a)
 *  "b": new Sprite(sprite_b)
 * }
 * 
 * 
 */