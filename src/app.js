class SingleEntry extends Mesh.Element {
  constructor() {
    super();
    const emitter = this._emitter = this.createEmitter();
  }
  
  _getValue() {
    return {name: '', numTickets: 0};
  }

  onUpdate(fn) {
    return this._emitter.on('update', fn)
  }

  onEnter(fn) {
    return this._emitter.on('enter', fn)
  }

  focus() {
    return this._nameInput.focus();
  }

  highlight(color) {
    this._nameInput.highlight(color);
    this._ticketsInput.highlight(color);
  }

  clearHighlight() {
    this._nameInput.clearHighlight();
    this._ticketsInput.clearHighlight();
  }

  connectedCallback() {
    super.connectedCallback();
    this.createShadowRoot();
    const nameItem = this.createGridItem('name');
    const nameInput = this._nameInput = this.createElement('mesh-text-input');
    nameItem.appendChild(nameInput);
    const ticketsItem = this.createGridItem('tickets')
    const ticketsInput = this._ticketsInput = this.createElement('mesh-number-input');
    ticketsItem.appendChild(ticketsInput);
    const container = this.createElement('div', {'class': 'container'});
    container.appendChild(nameItem);
    container.appendChild(ticketsItem);
    this.shadowRoot.appendChild(container);
    this._getValue = () => {
      return {
        name: nameInput.value,
        numTickets: ticketsInput.value || 0,
      }
    }
    this.listen(nameInput.onUpdate(() => this._emitter.emit('update')));
    this.listen(ticketsInput.onUpdate(() => this._emitter.emit('update')));
    this.listen(nameInput.onEnter(() => ticketsInput.focus()));
    this.listen(ticketsInput.onEnter(() => {
      this._emitter.emit('enter');
    }));
  }

  createGridItem(dataAttr) {
    return this.createElement('div', {'class': 'item', 'data-attr': dataAttr});
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


class EntryList extends Mesh.Element {
  get entryElements() {
    return this.findElements('single-entry');
  }

  connectedCallback() {
    super.connectedCallback();
    const root = this.createShadowRoot();
    const container = this.createElement('div', {'class': 'container'});
    root.appendChild(container)
    for (const entry of this.entryElements) {
      entry.parentNode = null;
    }
    const push = ({ focus } = {}) => {
      const entry = this.createElement('single-entry');
      this.listen(entry.onUpdate(() => {
        setTimeout(() => {
          const { name, numTickets } = entry.value;
          if (!name && numTickets === 0) {
            this.removeEmptyEntries();
          }
          const empties = this.entryElements.filter(el => {
            const { name, numTickets } = el.value;
            return name === '' && numTickets === 0;
          });
          if (empties.length === 0) {
            push();
          }
        }, 1);
      }));
      this.listen(entry.onEnter(() => {
        let next = false;
        let found = false;
        for (const match of this.entryElements) {
          if (match === entry) {
            next = true;
          } else if (next) {
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
    }
    const pop = () => {
      const entries = this.entryElements;
      if (entries.length === 0) {
        return;
      }
      const last = entries[entries.length - 1];
      last.parentNode = null;
    }
    // Setup list with an initial entry.
    push();
  }

  removeEmptyEntries() {
    console.log('remove-empties')
    const entries = this.entryElements;
    if (entries.length < 2) {
      return;
    }
    entries.forEach(entry => {
      if (!entry.name && entry.numTickets === 0) {
        entry.parentNode = null;
      }
    });
  }

  /**
   * Returns an array of {name: str, tickets: number} objects.
   */
  get entries() {
    const entries = this.findElements('single-entry');
    return entries.map(entry => entry.value).filter(v => v.name && v.numTickets > 0);
  }

  highlightEntry(index, color) {
    this.clearHighlights();
    const entries = this.findElements('single-entry');
    if (entries[index]) {
      entries[index].setAttribute('data-highlight', '1')
      entries[index].highlight(color);
    }
  }

  clearHighlights() {
    this.findElements('single-entry').forEach(entry => {
      entry.setAttribute('data-highlight', '')
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
customElements.define('entry-list', EntryList);

class SpinnerButton extends Mesh.Element {
  connectedCallback() {
    super.connectedCallback();
    this._emitter = this.createEmitter();
    const root = this.createShadowRoot();
    const button = this._button = this.createElement('button');
    button.textContent = 'Spin It!'
    const onClick = () => {
      this._emitter.emit('click');
    };
    button.addEventListener('click', onClick);
    this.listen(() => button.removeEventListener('click', onClick));
    root.appendChild(button);
  }

  set text(text) {
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
    return this._emitter.on('click', fn)
  }
}
customElements.define('spinner-button', SpinnerButton);

class SpinnerApp extends Mesh.Element {
  connectedCallback() {
    super.connectedCallback();
    const root = this.createShadowRoot()
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
      if (this.ival) {
        clearInterval(this.ival);
      }
      let ms = 0;
      const timeScale = 1000 / totalTickets;
      this.ival = setInterval(() => {
        ms++;
        const pos = ms % totalTickets;
        let lower = 0;
        let index = 0;
        for (const entry of wheel) {
          const upper = lower + entry.numTickets; 
          if (pos >= lower && pos < upper) {
            entryList.highlightEntry(index);
            break;
          }
          lower = upper;
          index++;
        }
      }, timeScale);
      spinner.text = 'Spinning...';
      setTimeout(() => {
        clearInterval(this.ival);
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
            spinner.text = 'We have a winner!'
            break;
          }
          index += 1;
          lower = upper;
        }
      }, 3000)
      console.log('wheel', wheel)
    }));
  }
}
customElements.define('spinner-app', SpinnerApp);