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
  ...children: any[]
): HTMLElementTagNameMap[T] {
  const element =
    typeof tag === "string" ? document.createElement<T>(tag) : props ? tag(props) : tag();
  if (props) Object.entries(props).forEach(([key, value]) => (element[key] = value));
  element.append(...children.flat().filter(child => child !== false));
  return element;
}

export function __fragment() {
  return document.createDocumentFragment();
}

Object.assign(window, { __jsx, __fragment });