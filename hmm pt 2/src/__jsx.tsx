declare global {
  namespace JSX {
    type Element = HTMLElement;
    type IntrinsicElements = {
      [K in keyof HTMLElementTagNameMap]: Partial<HTMLElementTagNameMap[K]>;
    };
  }
}

export function __jsx<T extends keyof JSX.IntrinsicElements>(
  tag: T | Function,
  props: Partial<HTMLElementTagNameMap[T]>,
  ...children: (string | Node)[]
): HTMLElementTagNameMap[T] {
  if (typeof tag === "function") return tag(props);
  const element = document.createElement<T>(tag);
  if (props) Object.entries(props).forEach(([key, value]) => (element[key] = value));
  element.append(...children.filter(child => child));
  return element;
}

Object.assign(window, { __jsx });