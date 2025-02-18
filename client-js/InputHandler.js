/**
 * Handling user input
 */
export class InputHandler {
    /**
     * 
     * @param {Boolean} mousePagePos Use page coordinates to track mouse position (defaults to client)
     */
    constructor(mousePagePos) {
        this.mousePagePos = mousePagePos;
        this.keys = new Set();
        this.touches = [];
        this.mouse = {
            x: 0, y: 0, down: false
        }

        this.onKeydown;
        this.onKeyup;
        this.onKeypress;

        this.onMousemove;
        this.onMousedown;
        this.onMouseup;

        window.addEventListener('keydown', (ev) => {
            this.keys.add(ev.code);
            if (typeof this.onKeydown === 'function') this.onKeydown(ev.code);
        });

        window.addEventListener('keyup', (ev) => {
            this.keys.delete(ev.code);
            if (typeof this.onKeyup === 'function') this.onKeyup(ev.code);
        });

        window.addEventListener('keypress', (ev) => {
            if (typeof this.onKeypress === 'function') this.onKeypress(ev.code);
        });

        window.addEventListener('mousemove', (ev) => {
            this.mouse.x = this.mousePagePos ? ev.pageX : ev.clientX;
            this.mouse.y = this.mousePagePos ? ev.pageY : ev.clientY;
            if (typeof this.onMousemove === 'function') this.onMousemove(this.mouse);
        });

        window.addEventListener('mousedown', () => {
            this.mouse.down = true;
            if (typeof this.onMousedown === 'function') this.onMousedown();
        });

        window.addEventListener('mouseup', () => {
            this.mouse.down = false;
            if (typeof this.onMouseup === 'function') this.onMouseup();
        });

        window.addEventListener("touchstart", (ev) => {
            for (let t of ev.touches) this.touches.push(t);
        });

        window.addEventListener("touchend", (ev) => {
            for (let ct of ev.changedTouches) this.touches = this.touches.filter(t => t.identifier !== ct.identifier);
        });

        window.addEventListener("touchcancel", () => {
            this.touches = [];
        });

        window.addEventListener('visibilitychange', () => {
            this.keys.clear();
            this.mouse.down = false;
            if (typeof this.onMouseup === 'function') this.onMouseup();
        });

    }

    /**
     * Returns the currently active keys as an array
     * @returns {string[]} array of key names
     */
    getKeys() {
        return Array.from(this.keys);
    }

    /**
     * Check if the currently active keys including the specified key name
     * @param {String} key key name
     * @param {Boolean} removeAfterCheck remove the key from the set
     * @returns {Boolean}
     */
    includesKey(key, removeAfterCheck = false) {
        let h = this.keys.has(key);
        if (removeAfterCheck) this.keys.delete(key);
        return h;
    }

    /**
     * Returns an object of current mouse status
     * @returns 
     */
    getMouse() {
        return this.mouse;
    }

    /**
     * Returns an array of currently active touches
     * @returns {Touch[]}
     */
    getTouches() {
        return this.touches;
    }

    getGamepad() {

    }
}
