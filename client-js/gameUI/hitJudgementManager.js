import { AccuracyJudgment } from "./accuracyJudgment.js";

export class HitJudgementManager {
    constructor(game) {
        this.game = game;
        this.accJudgments = [];

        this.game.events.on("game:hit", this.add.bind(this));
    }

    add(position, type, scaling) {
        this.accJudgments.push(
            new AccuracyJudgment(
                this.game,
                position.x,
                position.y,
                scaling,
                this.game.CONFIG.hide300Points && type === 3 ? -1 : type
            )
        );
    }

    update() {
        this.accJudgments.forEach((a) => { a.update(); });
        // Remove the accuracy judgments that has the `markedForDeletion` property set to true
        this.accJudgments = this.accJudgments.filter((a) => { return !a.markedForDeletion });
    }

    render() {
        this.accJudgments.forEach((a) => { a.render(); });

    }
}