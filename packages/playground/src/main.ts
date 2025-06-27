import { Effect } from "effect";
import { Component } from "effect-ui/core/component";
import { createSignal } from "effect-ui/core/state";
import { bindText } from "effect-ui/runtime/bindings";
import { render } from "effect-ui/runtime/renderer";
import "./style.css";
import { DefaultTheme, Theme } from "./theme";

const App: Component<{}, never, Theme> = () =>
  Effect.gen(function* (_: Effect.Adapter) {
    const theme = yield* _(Theme);
    const [count, setCount] = createSignal(0);

    const h1 = document.createElement("h1");
    const button = document.createElement("button");

    h1.style.color = theme.color;
    bindText(h1, () => `Count: ${count()}`);

    button.textContent = "Increment";
    button.onclick = () => {
      setCount(count() + 1);
    };

    const container = document.createElement("div");
    container.appendChild(h1);
    container.appendChild(button);

    return container;
  });

const container = document.querySelector("#app");

if (container) {
  const appEffect = App({});
  const runnable = Effect.provide(appEffect, DefaultTheme);
  render(runnable, container);
}
