export class EventSystem {
    constructor() {
        this.listeners = {};
    }

    /**
     * 
     * @param {String} eventName 
     * @param {Function} callback 
     */
    on(eventName, callback) {
        (this.listeners[eventName] ??= []).push(callback);
    }

    /**
     * 
     * @param {String} eventName 
     * @param  {...any} args 
     */
    emit(eventName, ...args) {
        this.listeners[eventName]?.forEach((fn) => {
            fn(...args);
        });
    }

    /**
     * 
     * @param {String} eventName 
     * @param {Function} callback 
     */
    off(eventName, callback) {
        if (!this.listeners[eventName]) return;
        this.listeners[eventName] = this.listeners[eventName].filter(f => f != callback);
    }
}
