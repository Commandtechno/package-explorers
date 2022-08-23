const container = document.getElementById("container");
const routes = new Map();

export function startRouter() {
  updateRouter();
  window.addEventListener("popstate", updateRouter);
}

export function updateRouter() {
  container.replaceChildren(routes.get(window.location.pathname));
}

export function addRoute(route, element) {
  routes.set(route, element);
}

export function setRoute(route) {
  window.history.pushState(null, "", route);
}

export function Link({ href }) {
  return (
    <a
      href={href}
      onclick={ev => {
        ev.preventDefault();
        setRoute(href);
      }}
    />
  );
}