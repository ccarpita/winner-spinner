(function () {
  const config = {
    debug: 'debug',
    keydown: 'keydown'
  }

  Mesh.Debugger = class {
    constructor() {
      this._localStorage = new Mesh.LocalStorage('debugger');
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
      function onKeyDown(e) {
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

    setStoredValueOn(key) {
      this._localStorage.setItem(key, '1');
    }
    
    setStoredValueOff(key) {
      this._localStorage.setItem(key, '0');
    }

    _storedIsOn(key) {
      return this._localStorage.getItem(key) == '1'
    }

    _unsubscribeAll() {
      for (const unsub of this._unsubscribe) {
        unsub();
      }
      this._unsubscribe = [];
    }
  }

  Mesh.debugger = new Mesh.Debugger();

})();