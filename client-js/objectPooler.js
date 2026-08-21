export class ObjectPooler {
    /**
     * 
     * @param {Function} factoryFn 
     * @param {Number} poolSize 
     */
    constructor(factoryFn, poolSize) {
        this.factoryFn = factoryFn;
        this.initialPoolSize = poolSize;

        this.pool = [];
        this.active = [];

        for (let i = 0; i < poolSize; i++) {
            this.pool.push(this.factoryFn());
        }
    }

    get() {
        let obj;
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else {
            obj = this.factoryFn();
            //console.warn(`Object pool expanded form ${this.initialPoolSize} to ${this.pool.length + this.active.length}`);
        }

        this.active.push(obj);

        return obj;
    }

    updateAllActive(...args) {
        if (this.active.length === 0) return;
        let i = this.active.length - 1;
        while (i--) {
            let obj = this.active[i];
            obj.update(...args);

            if (!obj.active) {
                this.release(obj);
            }
        }
    }

    release(obj) {
        let index = this.active.indexOf(obj);
        if (index !== -1) {
            this.active.splice(index, 1);
            obj.reset();
            this.pool.push(obj);
        }
    }

    releaseAll() {
        this.active.forEach((obj) => {
            obj.reset();
            this.pool.push(obj);
        });
        
        this.active.length = 0;
    }
}
