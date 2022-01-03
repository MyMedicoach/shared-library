export class TwoWayMap<K, V> {
  private readonly map = new Map<K, V>();
  private readonly revMap = new Map<V, K>();

  constructor(entries: Array<[key: K, value: V]>) {
    for (const entry of entries) {

      this.map.set(entry[0], entry[1]);
      this.revMap.set(entry[1], entry[0]);
    }
  }

  get(key: K): V | undefined {
    return this.map.get(key);
  }

  revGet(key: V): K | undefined {
    return this.revMap.get(key);
  }

  hasKey(key: K): boolean {
    return this.map.has(key);
  }

  hasValue(value: V): boolean {
    return this.revMap.has(value);
  }
}
