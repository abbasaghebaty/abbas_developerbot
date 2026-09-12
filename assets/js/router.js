const routes = new Map();
let outlet = null;
let onNavigate = () => {};

export function registerRoute(path, config) {
  routes.set(path, config);
}

export function initRouter(outletEl, navigateCallback) {
  outlet = outletEl;
  onNavigate = navigateCallback || onNavigate;
  window.addEventListener("hashchange", render);
  render();
}

function currentPath() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  return hash || "overview";
}

function render() {
  const path = currentPath();
  const route = routes.get(path) || routes.get("overview");
  const resolvedPath = routes.has(path) ? path : "overview";

  outlet.innerHTML = "";
  outlet.scrollTop = 0;
  window.scrollTo(0, 0);

  onNavigate(resolvedPath, route);

  Promise.resolve(route.render(outlet)).catch((err) => {
    console.error(err);
    outlet.innerHTML =
      '<div class="state-block"><span class="state-block__title">Something went wrong loading this page.</span></div>';
  });
}
