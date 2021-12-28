"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Element_1 = __importDefault(require("../core/Element"));
class TextInput extends Element_1.default {
    constructor() {
        super();
        this._input = null;
        this._inputPrevColor = "";
        this._focussed = false;
        this._value = this.defaultValue();
        this._emitter = this.createEmitter();
    }
    defaultValue() {
        return '';
    }
    normalizeInput(inputStr) {
        return String(inputStr);
    }
    /**
     * Determine if a keydown event is accepted for the input. If the
     * predicate returns a falsy value, the event will be cancelled
     * and the key will not be written to the input element.
     *
     * @param {string} keyCode The "code" property of a keydown event
     * @returns
     */
    keyCodePredicate(keyCode) {
        return true;
    }
    get focussed() {
        return this._focussed;
    }
    get value() {
        return this._value;
    }
    set value(toValue) {
        this._setInput(toValue);
    }
    onUpdate(fn) {
        return this._emitter.on('update', fn);
    }
    onEnter(fn) {
        return this._emitter.on("enter", fn);
    }
    createInputElement() {
        return this.createElement('input');
    }
    connectedCallback() {
        super.connectedCallback();
        const emitter = this._emitter;
        const root = this.createShadowRoot();
        const input = this._input = this.createInputElement();
        this._setInput(this._value);
        input.addEventListener('keydown', (e) => {
            if (!this.keyCodePredicate(e.code)) {
                e.preventDefault();
            }
            if (e.code == "Enter") {
                emitter.emit("enter");
            }
        });
        input.addEventListener('keyup', () => {
            this._setInput(input.value);
        });
        input.addEventListener('focus', () => {
            this._focussed = true;
            input.setAttribute('class', 'focussed');
        });
        input.addEventListener('blur', () => {
            this._focussed = false;
            input.setAttribute('class', '');
        });
        this.focus = () => input.focus();
        this._input = input;
        root.appendChild(input);
    }
    highlight(color) {
        if (!this._input) {
            return;
        }
        this._input.setAttribute('class', 'highlighted');
        if (color) {
            this._inputPrevColor = this._input.style.backgroundColor || '';
            this._input.style.backgroundColor = color;
        }
    }
    clearHighlight() {
        if (!this._input) {
            return;
        }
        this._input.setAttribute('class', this._focussed ? 'focussed' : '');
        this._input.style.backgroundColor = this._inputPrevColor;
        this._inputPrevColor = '';
    }
    _setInput(inputText) {
        if (!this._input) {
            return;
        }
        const prev = this._value;
        this._value = this.normalizeInput(inputText);
        this._input.value = String(this._value);
        if (prev !== this._value) {
            this._emitter.emit('update');
        }
    }
    styleText() {
        return `
      input {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        background-color: #eee;
        border-radius: 0;
        color: black;
        border-width: 0px;
        border-color: #ccc;
        border-bottom-width: 0px;
        border-left-width: 0px;
        outline: none;
        height: 3em;
        width: 100%;
        font-size: 2em;
        padding: 20px;
      }
      input:hover {
        background-color: #ddd;
      }
      input[type=number] {
        -moz-appearance: textfield;
      }
      /* Chrome, Safari, Edge, Opera */
      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      input.focussed {
        background-color: #111;
        color: white
      }
      input.highlighted {
        background-color: #cc3;
        color: white;
        font-weight: bold;
      }
    `;
    }
}
exports.default = TextInput;
;
customElements.define('mesh-text-input', TextInput);
//# sourceMappingURL=TextInput.js.map