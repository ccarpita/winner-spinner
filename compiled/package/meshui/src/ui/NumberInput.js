"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TextInput_1 = __importDefault(require("./TextInput"));
class NumberInput extends TextInput_1.default {
    defaultValue() {
        return 0;
    }
    normalizeInput(inputStr) {
        if (!inputStr) {
            return 0;
        }
        const value = parseInt((inputStr || '').replace(/[^0-9]+/, ''), 10);
        if (isNaN(value)) {
            return this.defaultValue();
        }
        return value;
    }
    keyCodePredicate(keyCode) {
        return keyCode.match(/^(Digit|Tab|Backspace|Control|Alt|Meta)/) !== null;
    }
    createInputElement() {
        const input = super.createInputElement();
        input.type = 'number';
        return input;
    }
}
exports.default = NumberInput;
customElements.define('mesh-number-input', NumberInput);
//# sourceMappingURL=NumberInput.js.map