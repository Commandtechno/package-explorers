export class Counter extends Map {
  get(key) {
    return super.get(key) ?? 0;
  }

  incr(key) {
    let value = this.get(key);
    this.set(key, value + 1);
  }

  sort() {
    return [...this].sort((a, b) => b[1] - a[1]);
  }

  map(fn) {
    return [...this].map(fn);
  }

  [Symbol.iterator]() {
    return this.entries();
  }
}