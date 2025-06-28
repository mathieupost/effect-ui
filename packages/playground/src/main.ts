import { Effect } from "effect";
import { Component } from "effect-ui/core/component";
import { createMemo, createSignal } from "effect-ui/core/state";
import { render } from "effect-ui/runtime/renderer";
import { CounterDisplay } from "./components/CounterDisplay";
import { DoubledCounterDisplay } from "./components/DoubledCounterDisplay";
import { IncrementButton } from "./components/IncrementButton";
import "./style.css";
import { DefaultTheme, Theme } from "./theme";

const App: Component<{}, never, Theme> = () =>
  Effect.gen(function* (_: Effect.Adapter) {
    const [count, setCount] = createSignal(0);
    const doubledCount = createMemo(() => count() * 2);

    const container = document.createElement("div");
    container.appendChild(yield* _(CounterDisplay({ count })));
    container.appendChild(yield* _(DoubledCounterDisplay({ doubledCount })));
    container.appendChild(
      yield* _(IncrementButton({ onIncrement: () => setCount(count() + 1) }))
    );

    return container;
  });

const container = document.querySelector("#app");

if (container) {
  const appEffect = App({});
  const runnable = Effect.provide(appEffect, DefaultTheme);
  render(runnable, container);
}
