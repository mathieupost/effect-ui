import { createEffect } from "../core/state";

/**
 * Binds a reactive computation to the textContent of an element.
 *
 * @param element The element to bind to.
 * @param fn A function that returns the text content. This function will be
 *   re-run whenever the signals it depends on change.
 */
export const bindText = (element: HTMLElement, fn: () => string) => {
  createEffect(() => {
    element.textContent = fn();
  });
};
