export class BackgrondImageManager {
    constructor(game) {
        this.game = game;
        this.fadeInDurationMs = 300;
        this.images = [];
        this.defaultImage = new this.game.SPRITEIMG("./client-files/default-background.jpg");
        this.fading = new this.game.ANI();
        this.setImage();
    }

    /**
     * Load an image and crossfade
     * @param {String} url URL of the image to load
     * @returns 
     */
    setImage(url) {
        let s;
        if (!url || url.endsWith("undefined")) {
            s = new this.game.SPRITE(this.defaultImage);
            s.x = this.game.canvas.width * 0.5;
            s.y = this.game.canvas.height * 0.5;
            s.opacity = 1;
            this.images.push(s);
            this.fading = new this.game.ANI(this.game.clock, this.game.clock + this.fadeInDurationMs, 0, 1);
            return;
        }
        let im = new this.game.SPRITEIMG(url);
        s = new this.game.SPRITE(im);
        s.x = this.game.canvas.width * 0.5;
        s.y = this.game.canvas.height * 0.5;
        s.opacity = 0;

        this.images.push(s);
        this.fading = new this.game.ANI(this.game.clock, this.game.clock + this.fadeInDurationMs, 0, 1);

    }

    update() {
        this.fading.update(this.game.clock);
        this.images.forEach((img, i) => {
            // Scale the image to fit to the width of the canvas
            img.scale = this.game.canvas.width / img.spriteImage.w;

            // Control the fade-out of the first image while the animation is playing
            if (i === 0 && this.fading.amount < 1) img.opacity = 1 - this.fading.currentValue;

            // Fading-in the new image
            if (i === 1) img.opacity = this.fading.currentValue;
        });

        // At the end of that we should end up with two images in that array, remove the old one when the animation finished
        if (this.images.length > 1 && this.fading.amount === 1) this.images.shift();
    }

    render() {
        this.images.forEach((i) => { i.render(this.game.ctx) });
    }

    /**
     * Update the scaling and position of the background when resize happens
     */
    resize() {
        this.images.forEach((img) => {
            img.scale = this.game.canvas.width / img.spriteImage.w;
            img.x = this.game.canvas.width * 0.5;
            img.y = this.game.canvas.height * 0.5;
        });
    }

    /**
     * Chnage opacity of the currently visible image to `value` in `duration` milliseconds.
     * Timing is tied to game clock.
     * @param {Number} value value between 0-1
     * @param {Number} duration ms
     */
    changeOpacity(value, duration = 200) {
        this.fading = new this.game.ANI(
            this.game.clock, 
            this.game.clock + duration, 
            this.fading.currentValue, // Start and end values inverted because of the fading logic in the update method
            1-value
        );
    }
}