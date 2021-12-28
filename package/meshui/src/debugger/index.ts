const config = {
  debug: 'debug',
  keydown: 'keydown'
}

import { LocalStorage } from "../core";

export class Debugger {
  static main: Debugger

  private _localStorage: LocalStorage
  private _unsubscribe: (() => void)[]
  constructor() {
    this._localStorage = new LocalStorage('debugger');
    this._unsubscribe = [];
    if (this.settings.keydown) {
      this.debugOnKeydown();
    }
  }

  debugOn() {
    this.setStoredValueOn(config.debug);
  }
  
  debugOff() {
    this.setStoredValueOff(config.debug);
    this._unsubscribeAll();
  }
  
  debugOnKeydown() {
    this.debugOn();
    this.setStoredValueOn(config.keydown);
    function onKeyDown(e: {code: string}) {
      console.log(`[mesh.debugger] keydown code=${e.code}`);
    }
    document.addEventListener('keydown', onKeyDown);
    this._unsubscribe.push(() => {
      document.removeEventListener('keydown', onKeyDown);
    });
  }

  debugOnAll() {
    this.debugOnKeydown();
  }

  get settings() {
    const debug = this._storedIsOn(config.debug);
    const keydown = this._storedIsOn(config.keydown);
    return {
      keydown: debug && keydown
    };
  }

  setStoredValueOn(key: string) {
    this._localStorage.setItem(key, '1');
  }
  
  setStoredValueOff(key: string) {
    this._localStorage.setItem(key, '0');
  }

  _storedIsOn(key: string) {
    return this._localStorage.getItem(key) == '1'
  }

  _unsubscribeAll() {
    for (const unsub of this._unsubscribe) {
      unsub();
    }
    this._unsubscribe = [];
  }
}

Debugger.main = new Debugger();
