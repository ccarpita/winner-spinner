import TextInput from "./TextInput";

export default class NumberInput extends TextInput {

  defaultValue() {
    return 0;
  }

  normalizeInput(inputStr: string) {
    if (!inputStr) {
      return 0;
    }
    const value = parseInt((inputStr || '').replace(/[^0-9]+/, ''), 10);
    if (isNaN(value)) {
      return this.defaultValue();
    }
    return value;
  }

  keyCodePredicate(keyCode: string) {
    return keyCode.match(/^(Digit|Tab|Backspace|Control|Alt|Meta)/) !== null;
  }

  createInputElement() {
    const input = super.createInputElement();
    input.type = 'number';
    return input;
  }
}

customElements.define('mesh-number-input',  NumberInput);