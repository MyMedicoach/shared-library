export class TwoWayMap {
  private readonly map = new Map();
  private readonly revMap = new Map();

  constructor(mapping: Record<string, string>) {
    for (const key of Object.keys(mapping)) {
      this.map.set(key, mapping[key]);
      this.revMap.set(mapping[key], key);
    }
  }

  get(key) {
    return this.map.get(key);
  }

  revGet(key) {
    return this.revMap.get(key);
  }

  hasKey(key) {
    return this.map.has(key);
  }

  hasValue(value) {
    return this.revMap.has(value);
  }
}
