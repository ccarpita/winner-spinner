"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Debugger = void 0;
const config = {
    debug: 'debug',
    keydown: 'keydown'
};
const core_1 = require("../core");
class Debugger {
    constructor() {
        this._localStorage = new core_1.LocalStorage('debugger');
        this._unsubscribe = [];
        if (this.settings.keydown) {
            this.debugOnKeydown();
        }
    }
    debugOn() {
        this.setStoredValueOn(config.debug);
    }
    debugOff() {
        this.setStoredValueOff(config.debug);
        this._unsubscribeAll();
    }
    debugOnKeydown() {
        this.debugOn();
        this.setStoredValueOn(config.keydown);
        function onKeyDown(e) {
            console.log(`[mesh.debugger] keydown code=${e.code}`);
        }
        document.addEventListener('keydown', onKeyDown);
        this._unsubscribe.push(() => {
            document.removeEventListener('keydown', onKeyDown);
        });
    }
    debugOnAll() {
        this.debugOnKeydown();
    }
    get settings() {
        const debug = this._storedIsOn(config.debug);
        const keydown = this._storedIsOn(config.keydown);
        return {
            keydown: debug && keydown
        };
    }
    setStoredValueOn(key) {
        this._localStorage.setItem(key, '1');
    }
    setStoredValueOff(key) {
        this._localStorage.setItem(key, '0');
    }
    _storedIsOn(key) {
        return this._localStorage.getItem(key) == '1';
    }
    _unsubscribeAll() {
        for (const unsub of this._unsubscribe) {
            unsub();
        }
        this._unsubscribe = [];
    }
}
exports.Debugger = Debugger;
Debugger.main = new Debugger();
//# sourceMappingURL=index.js.map