export async function* readline(reader) {
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let line;
    while ((line = buffer.indexOf("\n")) >= 0) {
      const result = buffer.slice(0, line);
      buffer = buffer.slice(line + 1);
      yield result;
    }
  }

  if (buffer.length) yield buffer;
}