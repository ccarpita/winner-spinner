window.Mesh = {};

Mesh.LocalStorage = class {
  constructor(scope) {
    this._scope = scope;
  }

  scopedKey(key) {
    return `mesh.${this._scope}.${key}`
  }

  getItem(key) {
    return localStorage.getItem(this.scopedKey(key))
  }

  setItem(key, value) {
    localStorage.setItem(this.scopedKey(key), value);
  }
}

/**
 * Root class containing helpers for creating shadow roots, attaching styles,
 * and 
 */
Mesh.Element = class extends HTMLElement {

  constructor() {
    super();
    Mesh.Element._serial = Mesh.Element._serial || 0;
    this._elementSerial = ++Mesh.Element._serial;
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

  createShadowRoot(mode = 'open') {
    if (!this.shadowRoot) {
      return this.attachShadow({mode, delegatesFocus: true});
    }
    return this.shadowRoot;
  }

  createClosedShadowRoot() {
    return this.createShadowRoot('closed')
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
      } catch (e) {
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

  createEmitter({ async, delayMs } = {async: false, delayMs: 1}) {
    const registry = {};
    return {
      on: (name, fn) => {
        (registry[name] = registry[name] || []).push(fn);
        return function unsubscribe() {
          registry[name] = registry[name].filter(match => match !== fn);
        }
      },
      emit: (name, ...args) => {
        (registry[name] = registry[name] || []).forEach((fn) => {
          if (async) {
            setTimeout(() => fn(...args), delayMs || 1);
          } else {
            fn(...args);
          }
        });
      }
    }
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
