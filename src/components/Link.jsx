export function Link({ url }, children) {
  return (
    <a href={url} target="_blank" rel="noreferrer" />
  );
}