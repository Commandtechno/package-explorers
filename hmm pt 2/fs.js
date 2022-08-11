export class FS {
  map = new Map();

  async loadItems(items) {
    for (const item of items) {
      const entry = item.webkitGetAsEntry();
      if (entry.isFile) {
        this.map.set(entry.name, entry);
      } else if (entry.isDirectory) {
      }
    }
  }
}