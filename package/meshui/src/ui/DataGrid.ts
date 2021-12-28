import TextInput from './TextInput';

import Element from '../core/Element'

interface Column {
  title: string
  type: 'number' | 'text'
  width?: number
}

export default class DataGrid extends Element {
    private _columnsWithWidths: Column[]
    private _container: HTMLElement | null = null;

    constructor() {
      super();
      this._columnsWithWidths = []
    }

    columns(): Column[] {
      return [
        {title: 'Name', type: 'text'},
        {title: 'Count', type: 'number'},
      ];
    }

    columnsWithWidths(): Column[] {
      if (this._columnsWithWidths.length > 0) {
        return this._columnsWithWidths;
      }
      const columns = this.columns();
      function parseWidth(w: string | number | undefined) {
        if (!w) {
          return 0;
        }
        const asFloat = parseFloat(String(w).replace('%', ''));
        if (isNaN(asFloat) || asFloat < 0) {
          console.warn(`Could not parse width: ${w}`);
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
        return col;
      })
      const total = parsed.reduce((agg, next) => agg + (next.width || 0), 0)
      let scaled = parsed;
      if (total > 0) {
        scaled = parsed.map(col => {
          col.width = Math.floor((col.width || 0) / total);
          return col;
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
      return scaled;
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
      if (!this._container) {
        return;
      }
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

    get value(): any[][] {
      return this.findElements('row')
          .map(row => Array.from(row.querySelectorAll('mesh-number-input, mesh-text-input'))
              .map(node => (node as TextInput).value))
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
customElements.define('mesh-data-grid', DataGrid);