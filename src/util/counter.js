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

  keys(fn) {
    return Array.from(super.keys(), fn)
  }

  values(fn) {
    return Array.from(super.values(), fn)
  }

  [Symbol.iterator]() {
    return this.entries();
  }
}