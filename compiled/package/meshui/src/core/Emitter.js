"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Emitter {
    constructor({ async, delayMs } = { async: false, delayMs: 1 }) {
        this._registry = {};
        this._async = async;
        this._delayMs = delayMs;
    }
    on(name, listener) {
        const { _registry: registry } = this;
        (registry[name] = registry[name] || []).push(listener);
        return function unsubscribe() {
            registry[name] = registry[name].filter(match => match !== listener);
        };
    }
    emit(name, ...args) {
        const { _registry: registry } = this;
        (registry[name] = registry[name] || []).forEach((fn) => {
            if (this._async) {
                setTimeout(() => fn(...args), this._delayMs || 1);
            }
            else {
                fn(...args);
            }
        });
    }
}
exports.default = Emitter;
//# sourceMappingURL=Emitter.js.map