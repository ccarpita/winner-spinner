export default class LocalStorage {
  private _scope: string

  constructor(scope: string) {
    this._scope = scope;
  }

  scopedKey(key: string): string {
    return `mesh.${this._scope}.${key}`
  }

  getItem(key: string): string | null {
    return localStorage.getItem(this.scopedKey(key))
  }

  setItem(key: string, value: string) {
    localStorage.setItem(this.scopedKey(key), value);
  }
}