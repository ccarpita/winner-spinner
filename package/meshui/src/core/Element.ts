/**
 * Root class containing helpers for creating shadow roots, attaching styles,
 * and 
 */

import Emitter from "./Emitter";

export default class Element extends HTMLElement {
  private static _serial = 0;

  private _elementSerial: number;
  private _unsubscribe: (() => void)[]

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

  createShadowRoot(mode: ShadowRootMode = 'open', delegatesFocus: boolean = false): ShadowRoot {
    if (!this.shadowRoot) {
      return this.attachShadow({mode, delegatesFocus});
    }
    return this.shadowRoot;
  }

  createClosedShadowRoot(delegatesFocus: boolean = false) {
    return this.createShadowRoot('closed', delegatesFocus)
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

  createElement(tagName: string, attrs: {[k: string]: any} = {}): HTMLElement  {
    const el = document.createElement(tagName);
    Object.keys(attrs || {}).forEach(key => el.setAttribute(key, attrs[key]));
    return el;
  }
  
  findElement(query: string): HTMLElement | null {
    if (!this.shadowRoot) {
      return null;
    }
    return this.shadowRoot.querySelector(query);
  }
  
  findElements(query: string): HTMLElement[]  {
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

  createEmitter({ async, delayMs } = {async: false, delayMs: 1}): Emitter {
    return new Emitter({ async, delayMs });
  }

  listen(unsubscribeFn: () => void) {
    this._unsubscribe.push(unsubscribeFn);
  }

  ///////////////////////////////////////////////////////////////////
  //                                                               // 
  //  Data Utils                                                   //
  //                                                               //
  //  A collection of utilities for manipulating data structures.  //
  //                                                               //
  ///////////////////////////////////////////////////////////////////

  pickDefined(...args: any[]): any {
    for (const arg of args) {
      if (arg || arg === false || arg === 0 || arg === '') {
        return arg;
      }
    }
  }
}
