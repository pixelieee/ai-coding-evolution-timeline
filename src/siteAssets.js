// Keep public assets relative to the app, including GitHub Pages project paths.
export function publicAssetUrl(path, base = import.meta.env?.BASE_URL ?? "./") {
  return `${base.replace(/\/?$/, "/")}${path.replace(/^\/+/, "")}`;
}
