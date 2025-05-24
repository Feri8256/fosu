export class AutoplayController {
    constructor(game) {
        this.game = game;
        this.tl = new this.game.TL();
        this.activated = false;

        this.previousT = 0;
        this.previousX = 0;
        this.previousY = 0;

        this.cursorEasing = this.game.EASINGS.SineInOut;

    }
    activate() {
        this.activated = true;
    }

    add(t, x, y) {
        this.tl.appendAnimation(
            new this.game.ANI(
                this.previousT,
                t,
                this.previousX,
                x,
                this.cursorEasing,
                false,
                "X"
            )
        );

        this.tl.appendAnimation(
            new this.game.ANI(
                this.previousT,
                t,
                this.previousY,
                y,
                this.cursorEasing,
                false,
                "Y"
            )
        );

        this.previousT = t;
        this.previousX = x;
        this.previousY = y;
    }

    update(currentTime) {
        if (!this.activated) return;
        this.tl.update(currentTime);
        if (!this.tl.playing && currentTime < this.tl.latestEndTime) this.tl.play();

        let x = this.tl.getValueOf("X") ?? this.game.cursor.currentX;
        let y = this.tl.getValueOf("Y") ?? this.game.cursor.currentY;

        this.game.cursor.setPosition(x, y);
    }

    reset() {
        this.tl = new this.game.TL();
        this.activated = false;
    }

}