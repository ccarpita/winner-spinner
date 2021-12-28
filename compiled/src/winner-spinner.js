"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinnerApp = exports.EntryList = void 0;
const Element_1 = __importDefault(require("../package/meshui/src/core/Element"));
const TextInput_1 = __importDefault(require("../package/meshui/src/ui/TextInput"));
const NumberInput_1 = __importDefault(require("../package/meshui/src/ui/NumberInput"));
// Construct for forced module includes
new TextInput_1.default();
new NumberInput_1.default();
class SingleEntry extends Element_1.default {
    constructor() {
        super();
        this._nameInput = null;
        this._ticketsInput = null;
        const emitter = this._emitter = this.createEmitter();
    }
    _getValue() {
        return { name: '', numTickets: 0 };
    }
    onUpdate(fn) {
        return this._emitter.on('update', fn);
    }
    onEnter(fn) {
        return this._emitter.on('enter', fn);
    }
    focus() {
        if (!this._nameInput) {
            return;
        }
        return this._nameInput.focus();
    }
    highlight(color) {
        if (!this._nameInput || !this._ticketsInput) {
            return;
        }
        this._nameInput.highlight(color);
        this._ticketsInput.highlight(color);
    }
    clearHighlight() {
        if (!this._nameInput || !this._ticketsInput) {
            return;
        }
        this._nameInput.clearHighlight();
        this._ticketsInput.clearHighlight();
    }
    connectedCallback() {
        super.connectedCallback();
        const root = this.createShadowRoot();
        const nameItem = this.createGridItem('name');
        const nameInput = this._nameInput = this.createElement('mesh-text-input');
        nameItem.appendChild(nameInput);
        const ticketsItem = this.createGridItem('tickets');
        const ticketsInput = this._ticketsInput = this.createElement('mesh-number-input');
        ticketsItem.appendChild(ticketsInput);
        const container = this.createElement('div', { 'class': 'container' });
        container.appendChild(nameItem);
        container.appendChild(ticketsItem);
        root.appendChild(container);
        this._getValue = () => {
            return {
                name: nameInput.value,
                numTickets: ticketsInput.value || 0,
            };
        };
        this.listen(nameInput.onUpdate(() => this._emitter.emit('update')));
        this.listen(ticketsInput.onUpdate(() => this._emitter.emit('update')));
        this.listen(nameInput.onEnter(() => ticketsInput.focus()));
        this.listen(ticketsInput.onEnter(() => {
            this._emitter.emit('enter');
        }));
    }
    createGridItem(dataAttr) {
        return this.createElement('div', { 'class': 'item', 'data-attr': dataAttr });
    }
    get value() {
        return this._getValue();
    }
    styleText() {
        return `
      .container {
        display: flex;
        flex-direction: row; 
      }
      .item {
      }
      .item[data-attr=name] {
        width: 66%;
      }
      .item[data-attr=tickets] {
        width: 33%;
      }
    `;
    }
}
customElements.define('single-entry', SingleEntry);
class EntryList extends Element_1.default {
    get entryElements() {
        return this.findElements('single-entry');
    }
    connectedCallback() {
        super.connectedCallback();
        const root = this.createShadowRoot();
        const container = this.createElement('div', { 'class': 'container' });
        root.appendChild(container);
        for (const entry of this.entryElements) {
            entry.remove();
        }
        const push = ({ focus } = { focus: false }) => {
            const entry = this.createElement('single-entry');
            this.listen(entry.onUpdate(() => {
                setTimeout(() => {
                    const empties = this.entryElements.filter(el => {
                        const { name, numTickets } = el.value;
                        return name === '' && numTickets === 0;
                    });
                    if (empties.length === 0) {
                        push();
                    }
                    else {
                        this.removeEmptyEntries();
                    }
                }, 1);
            }));
            this.listen(entry.onEnter(() => {
                let next = false;
                let found = false;
                for (const match of this.entryElements) {
                    if (match === entry) {
                        next = true;
                    }
                    else if (next) {
                        found = true;
                        match.focus();
                        break;
                    }
                }
                if (!found) {
                    push({ focus: true });
                }
            }));
            container.appendChild(entry);
            if (focus) {
                entry.focus();
            }
        };
        const pop = () => {
            const entries = this.entryElements;
            if (entries.length === 0) {
                return;
            }
            const last = entries[entries.length - 1];
            last.remove();
        };
        // Setup list with an initial entry.
        push();
    }
    removeEmptyEntries() {
        const entries = this.entryElements.filter((entry) => {
            return !entry.value.name && entry.value.numTickets === 0;
        });
        if (entries.length < 2) {
            return;
        }
        entries.slice(1).forEach(entry => entry.remove());
    }
    /**
     * Returns an array of {name: str, tickets: number} objects.
     */
    get entries() {
        return this.entryElements.map(entry => entry.value).filter(v => v.name && v.numTickets > 0);
    }
    get entriesWithValues() {
        return this.entryElements.map(entry => entry.value.name && entry.value.numTickets > 0);
    }
    highlightEntry(index, color) {
        this.clearHighlights();
        const entry = this.entryElements[index];
        if (entry) {
            entry.setAttribute('data-highlight', '1');
            entry.highlight(color);
        }
    }
    clearHighlights() {
        this.entryElements.forEach(entry => {
            entry.setAttribute('data-highlight', '');
            entry.clearHighlight();
        });
    }
    styleText() {
        return `
      .container {
        display: flex;
        flex-direction: column;
      }
      single-entry {
        width: 100%;
      }
      single-entry[data-highlight=1] {
        background-color: #ffd
      }
      button {
        padding: 20px;
      }
    `;
    }
}
exports.EntryList = EntryList;
customElements.define('entry-list', EntryList);
class SpinnerButton extends Element_1.default {
    constructor() {
        super();
        this._button = null;
        this._emitter = this.createEmitter();
    }
    connectedCallback() {
        super.connectedCallback();
        const root = this.createShadowRoot();
        const button = this._button = this.createElement('button');
        button.textContent = 'Spin It!';
        const onClick = () => {
            this._emitter.emit('click');
        };
        button.addEventListener('click', onClick);
        this.listen(() => button.removeEventListener('click', onClick));
        root.appendChild(button);
    }
    set text(text) {
        if (!this._button) {
            return;
        }
        this._button.textContent = text;
    }
    styleText() {
        return `
    button {
      background-color: #eee;
      width: 100%;
      font-size: 2em;
      height: 3em;
      border: 0px;
      margin-top: 1em;
    }
    button:hover { background-color: black; color: white }
    button:focus { background-color: black; color: white }
    `;
    }
    onClick(fn) {
        return this._emitter.on('click', fn);
    }
}
customElements.define('spinner-button', SpinnerButton);
class SpinnerApp extends Element_1.default {
    constructor() {
        super(...arguments);
        this._interval = null;
    }
    connectedCallback() {
        super.connectedCallback();
        const root = this.createShadowRoot();
        const entryList = this.createElement('entry-list');
        root.appendChild(entryList);
        const spinner = this.createElement('spinner-button');
        root.appendChild(spinner);
        this.listen(spinner.onClick(() => {
            const wheel = entryList.entries;
            const totalTickets = wheel.reduce((sum, w) => w.numTickets + sum, 0);
            if (!totalTickets) {
                return;
            }
            if (this._interval) {
                clearInterval(this._interval);
            }
            let ms = 0;
            const timeScale = 1000 / totalTickets;
            this._interval = setInterval(() => {
                ms++;
                const pos = ms % totalTickets;
                let lower = 0;
                let index = 0;
                for (const entry of wheel) {
                    const upper = lower + entry.numTickets;
                    if (pos >= lower && pos < upper) {
                        entryList.highlightEntry(index, '#cc3');
                        break;
                    }
                    lower = upper;
                    index++;
                }
            }, timeScale);
            spinner.text = 'Spinning...';
            setTimeout(() => {
                if (this._interval) {
                    clearInterval(this._interval);
                    this._interval = null;
                }
                const winnerPos = Math.floor(Math.random() * totalTickets);
                entryList.clearHighlights();
                let winner = wheel[0];
                let lower = 0;
                let index = 0;
                for (const entry of wheel) {
                    const upper = lower + entry.numTickets;
                    if (winnerPos >= lower && winnerPos < upper) {
                        winner = entry;
                        entryList.highlightEntry(index, '#e94');
                        spinner.text = 'We have a winner! Click to spin again.';
                        break;
                    }
                    index += 1;
                    lower = upper;
                }
            }, 3000);
        }));
    }
}
exports.SpinnerApp = SpinnerApp;
customElements.define('spinner-app', SpinnerApp);
//# sourceMappingURL=winner-spinner.js.map