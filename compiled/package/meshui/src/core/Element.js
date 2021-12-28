"use strict";
/**
 * Root class containing helpers for creating shadow roots, attaching styles,
 * and
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Emitter_1 = __importDefault(require("./Emitter"));
class Element extends HTMLElement {
    constructor() {
        super();
        this._elementSerial = ++Element._serial;
        this._unsubscribe = [];
    }
    ///////////////////////////////////////////////////////////////////
    //                                                               // 
    //  Shadow DOM                                                   //
    //                                                               //
    //  A collection of utilities for manipulating the shadow DOM,   //
    //  and adding styles.                                           //
    //                                                               //
    ///////////////////////////////////////////////////////////////////
    styleText() {
        return "";
    }
    attachStyles() {
        const globalStyleId = '__mesh_global_style_' + this._elementSerial;
        this.createShadowRoot();
        if (this.shadowRoot && !this.findElement(`#${globalStyleId}`)) {
            const textContent = this.styleText();
            if (textContent) {
                const style = this.createElement('style');
                style.textContent = textContent;
                style.id = globalStyleId;
                this.shadowRoot.appendChild(style);
            }
        }
    }
    createShadowRoot(mode = 'open', delegatesFocus = false) {
        if (!this.shadowRoot) {
            return this.attachShadow({ mode, delegatesFocus });
        }
        return this.shadowRoot;
    }
    createClosedShadowRoot(delegatesFocus = false) {
        return this.createShadowRoot('closed', delegatesFocus);
    }
    connectedCallback() {
        this.attachStyles();
    }
    disconnectedCallback() {
        this.unsubscribeAll();
    }
    unsubscribeAll() {
        for (const unsubscribe of this._unsubscribe) {
            try {
                unsubscribe();
            }
            catch (e) {
                console.error(e);
            }
        }
        this._unsubscribe = [];
    }
    ///////////////////////////////////////////////////////////////////
    //                                                               // 
    //  General DOM Utils                                            //
    //                                                               //
    //  A collection of utilities for creating and finding elements  //
    //  in the shadow root.                                          //
    //                                                               //
    ///////////////////////////////////////////////////////////////////
    createElement(tagName, attrs = {}) {
        const el = document.createElement(tagName);
        Object.keys(attrs || {}).forEach(key => el.setAttribute(key, attrs[key]));
        return el;
    }
    findElement(query) {
        if (!this.shadowRoot) {
            return null;
        }
        return this.shadowRoot.querySelector(query);
    }
    findElements(query) {
        if (!this.shadowRoot) {
            return [];
        }
        return Array.from(this.shadowRoot.querySelectorAll(query));
    }
    ///////////////////////////////////////////////////////////////////
    //                                                               // 
    //  Emitters                                                     //
    //                                                               //
    //  A collection of utilities for creating synthetic event       //
    //  emitters.                                                    //
    //                                                               //
    ///////////////////////////////////////////////////////////////////
    createEmitter({ async, delayMs } = { async: false, delayMs: 1 }) {
        return new Emitter_1.default({ async, delayMs });
    }
    listen(unsubscribeFn) {
        this._unsubscribe.push(unsubscribeFn);
    }
    ///////////////////////////////////////////////////////////////////
    //                                                               // 
    //  Data Utils                                                   //
    //                                                               //
    //  A collection of utilities for manipulating data structures.  //
    //                                                               //
    ///////////////////////////////////////////////////////////////////
    pickDefined(...args) {
        for (const arg of args) {
            if (arg || arg === false || arg === 0 || arg === '') {
                return arg;
            }
        }
    }
}
exports.default = Element;
Element._serial = 0;
//# sourceMappingURL=Element.js.map