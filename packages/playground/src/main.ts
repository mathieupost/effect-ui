import { Effect } from "effect";
import { createEffect, createSignal } from "effect-ui/core/state";
import { render } from "effect-ui/runtime/renderer";
import "./style.css";

const App = Effect.sync(() => {
  const [count, setCount] = createSignal(0);

  const h1 = document.createElement("h1");
  const button = document.createElement("button");

  createEffect(() => {
    h1.textContent = `Count: ${count()}`;
  });

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
  render(App, container);
}
