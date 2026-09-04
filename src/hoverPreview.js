export const HOVER_DISMISS_DELAY = 350;

// Both the source node and its floating preview own the same closing timer.
export function createHoverDismissal(onDismiss, {
  delay = HOVER_DISMISS_DELAY,
  shouldKeepOpen = () => false,
  setTimer = (callback, duration) => setTimeout(callback, duration),
  clearTimer = (timer) => clearTimeout(timer),
} = {}) {
  let pending = null;
  const cancel = () => {
    if (pending !== null) clearTimer(pending);
    pending = null;
  };
  const dismiss = () => {
    cancel();
    onDismiss();
  };
  const schedule = () => {
    cancel();
    pending = setTimer(() => {
      pending = null;
      if (!shouldKeepOpen()) onDismiss();
    }, delay);
  };
  return { cancel, dismiss, schedule };
}
