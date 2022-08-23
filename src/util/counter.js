export class Counter extends Map {
  incr(key) {
    let value = this.get(key) ?? 0;
    this.set(key, value + 1);
  }

  sort() {
    return [...this].sort((a, b) => b[1] - a[1]);
  }

  [Symbol.iterator]() {
    return this.entries();
  }
}