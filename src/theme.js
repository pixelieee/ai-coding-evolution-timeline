export const THEME_STORAGE_KEY = "ai-coding-theme";
export const normalizeTheme = (value) => value === "light" || value === "dark" ? value : null;

// A device-local preference only; changing themes never resets archive/canvas state.
export function createThemeStore(browser, page) {
  let preference = null;
  try { preference = normalizeTheme(browser.localStorage.getItem(THEME_STORAGE_KEY)); } catch { /* Storage can be blocked. */ }
  const media = browser.matchMedia?.("(prefers-color-scheme: dark)");
  const resolve = () => preference || (media?.matches ? "dark" : "light");
  let theme = resolve();
  const listeners = new Set();
  const apply = () => {
    theme = resolve();
    page.documentElement.dataset.theme = theme;
    page.documentElement.style.colorScheme = theme;
    page.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#141516" : "#f5f5f2");
    listeners.forEach((listener) => listener());
  };
  const onSystemChange = () => { if (!preference) apply(); };
  const onStorage = (event) => {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
    preference = normalizeTheme(event.newValue);
    apply();
  };
  apply();

  return {
    getSnapshot: () => theme,
    subscribe(listener) {
      if (!listeners.size) {
        media?.addEventListener("change", onSystemChange);
        browser.addEventListener("storage", onStorage);
        // Catch system changes between module initialization and React subscribing.
        apply();
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          media?.removeEventListener("change", onSystemChange);
          browser.removeEventListener("storage", onStorage);
        }
      };
    },
    toggle() {
      preference = theme === "dark" ? "light" : "dark";
      try { browser.localStorage.setItem(THEME_STORAGE_KEY, preference); } catch { /* Keep the choice for this session. */ }
      apply();
    },
  };
}

export const themeStore = typeof window === "undefined"
  ? { getSnapshot: () => "light", subscribe: () => () => {}, toggle: () => {} }
  : createThemeStore(window, document);
