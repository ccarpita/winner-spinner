export type ListenerFn = (...args: any[]) => void;
export type UnsubscribeFn = () => void;

export default class Emitter {
  private _registry: {[k: string]: ListenerFn[]} 
  private _async: boolean
  private _delayMs: number;

  constructor({ async, delayMs } = { async: false, delayMs: 1}) {
    this._registry = {};
    this._async = async;
    this._delayMs = delayMs;
  } 

  on(name: string, listener: ListenerFn): UnsubscribeFn {
    const { _registry: registry } = this;
    (registry[name] = registry[name] || []).push(listener);
    return function unsubscribe() {
      registry[name] = registry[name].filter(match => match !== listener);
    }
  }

  emit(name: string, ...args: any[]) {
    const { _registry: registry } = this;
    (registry[name] = registry[name] || []).forEach((fn) => {
      if (this._async) {
        setTimeout(() => fn(...args), this._delayMs || 1);
      } else {
        fn(...args);
      }
    });
  }
}
