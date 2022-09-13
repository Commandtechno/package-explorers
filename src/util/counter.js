export class Counter extends Map {
  get(key) {
    return super.get(key) ?? 0;
  }

  incr(key, n = 1) {
    let value = this.get(key);
    this.set(key, value + n);
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