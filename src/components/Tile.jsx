export function Tile({ size } = { size: 1 }) {
  return <div className={`tile tile-${size}`}></div>;
}