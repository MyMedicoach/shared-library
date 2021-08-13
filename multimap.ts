export class Multimap<K, V> {
  #internalMap = new Map<K, V[]>();

  append(key: K, value: V): this {
    const valueSet = this.#internalMap.get(key);
    if (valueSet != null) {
      valueSet.push(value);

      return this;
    }

    this.#internalMap.set(key, [value]);

    return this;
  }

  keys(): IterableIterator<K> {
    return this.#internalMap.keys();
  }

  getAll(key: K): V[] {
    return this.#internalMap.get(key) ?? [];
  }
}
