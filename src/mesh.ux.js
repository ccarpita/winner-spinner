Mesh.TextInput = class extends Mesh.Element {

  constructor() {
    super();
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
    this._setInput(this._value)
    input.addEventListener('keydown', (e) => {
      if (!this.keyCodePredicate(e.code)) {
        e.preventDefault();
      }
      if (e.code == "Enter") {
        emitter.emit("enter")
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
    this._input.setAttribute('class', 'highlighted');
    if (color) {
      this._inputPrevColor = this._input.style.backgroundColor || '';
      this._input.style.backgroundColor = color;
    }
  }

  clearHighlight() {
    this._input.setAttribute('class', this._focussed ? 'focussed' : '');
    this._input.style.backgroundColor = this._inputPrevColor;
    this._inputPrevColor = '';
  }

  _setInput(inputText) {
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
};
customElements.define('mesh-text-input', Mesh.TextInput)


Mesh.NumberInput = class extends Mesh.TextInput {

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

customElements.define('mesh-number-input',  Mesh.NumberInput);

Mesh.DataGrid = class extends Mesh.Element {
    columns() {
      return [
        {title: 'Name'},
        {title: 'Count', type: 'number'},
      ];
    }

    columnsWithWidths() {
      if (this._columnsWithWidths) {
        return this._columnsWithWidths;
      }
      const columns = this.columns();
      function parseWidth(w) {
        if (!w) {
          return 0;
        }
        const asFloat = parseFloat(w.replace('%', ''), 10);
        if (isNaN(asFloat) || asFloat < 0) {
          console.warning(`Could not parse width: ${w}`);
          return 0;
        }
        if (asFloat < 1 && asFloat > 0) {
          return Math.floor(asFloat * 100)
        }
        if (asFloat < 100) {
          return Math.floor(asFloat);
        }
        return 0;
      }

      const parsed = columns.map(col => {
        col.width = parseWidth(col.width);
      })
      const total = parsed.reduce((agg, next) => agg + next.width, 0)
      let scaled = parsed;
      if (total) {
        scaled = parsed.map(col => {
          col.width = Math.floor(col.width / total);
        });
      }
      const remainder = 100 - total;
      const zeroes = scaled.filter((col) => !col.width);
      if (remainder && zeroes.length) {
        const slice = Math.floor(remainder / zeroes.length);
        if (slice) {
          zeroes.forEach(col => {
            col.width = slice;
          });
        }
      }
      this._columnsWithWidths = scaled;
    }

    connectedCallback() {
      super.connectedCallback();
      const root = this.createShadowRoot();
      this._container = this.createElement('div', {'class': 'container'});
      root.appendChild(this._container)
      const row = this.createElement('div', {'class': 'row'});
      for (const column of this.columnsWithWidths()) {
        const heading = this.createElement('div', {'class': 'heading'});
        heading.textContent = column.title;
        row.appendChild(heading);
      }
      this.appendRow();
    }

    appendRow() {
      const row = this.createElement('div', {'class': 'row'});
      this._container.append(row);
      const columns = this.columnsWithWidths();
      for (const column of columns) {
        const tagName = column.type == 'number' ? 'mesh-number-input' : 'mesh-text-input';
        const input = this.createElement(tagName);
        input.style.width = `${column.width || 1}%`
        row.appendChild(input);
      }
    }

    get value() {
      return this.findElements('row')
          .map(row => Array.from(row.childNodes)
              .filter(node => node.tagName.indexOf('mesh-') === 0)
              .map(node => node.value));
    }

    styleText() {
      return `
      .container {
        display: flex;
        flex-direction: column;
      }
      .heading {
        font-size: 0.5em;
        font-weight: bold;
      }
      .row {
        flex-direction: row
      } 
      `
    }
}
customElements.define('mesh-data-grid',  Mesh.DataGrid);