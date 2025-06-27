import { Effect } from "effect";
import { Component } from "effect-ui/core/component";
import { createMemo, createSignal } from "effect-ui/core/state";
import { bindText } from "effect-ui/runtime/bindings";
import { render } from "effect-ui/runtime/renderer";
import "./style.css";
import { DefaultTheme, Theme } from "./theme";

const App: Component<{}, never, Theme> = () =>
  Effect.gen(function* (_: Effect.Adapter) {
    const theme = yield* _(Theme);
    const [count, setCount] = createSignal(0);
    const doubledCount = createMemo(() => count() * 2);

    const h1 = document.createElement("h1");
    const h2 = document.createElement("h2");
    const button = document.createElement("button");

    h1.style.color = theme.color;
    const countPrefixText = document.createTextNode(`Count: `);
    const countText = document.createTextNode(`${count()}`);
    bindText(countText, () => `${count()}`);
    h1.appendChild(countPrefixText);
    h1.appendChild(countText);

    h2.style.color = theme.color;
    const doubledPrefixText = document.createTextNode(`Doubled: `);
    const doubledCountText = document.createTextNode(`${doubledCount()}`);
    bindText(doubledCountText, () => `${doubledCount()}`);
    h2.appendChild(doubledPrefixText);
    h2.appendChild(doubledCountText);

    button.textContent = "Increment";
    button.onclick = () => {
      setCount(count() + 1);
    };

    const container = document.createElement("div");
    container.appendChild(h1);
    container.appendChild(h2);
    container.appendChild(button);

    return container;
  });

const container = document.querySelector("#app");

if (container) {
  const appEffect = App({});
  const runnable = Effect.provide(appEffect, DefaultTheme);
  render(runnable, container);
}
