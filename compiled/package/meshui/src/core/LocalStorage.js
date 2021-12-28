"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LocalStorage {
    constructor(scope) {
        this._scope = scope;
    }
    scopedKey(key) {
        return `mesh.${this._scope}.${key}`;
    }
    getItem(key) {
        return localStorage.getItem(this.scopedKey(key));
    }
    setItem(key, value) {
        localStorage.setItem(this.scopedKey(key), value);
    }
}
exports.default = LocalStorage;
//# sourceMappingURL=LocalStorage.js.map