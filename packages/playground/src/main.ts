import { Effect } from "effect";
import { createSignal } from "effect-ui/core/state";
import { bindText } from "effect-ui/runtime/bindings";
import { render } from "effect-ui/runtime/renderer";
import "./style.css";

const App = Effect.sync(() => {
  const [count, setCount] = createSignal(0);

  const h1 = document.createElement("h1");
  const button = document.createElement("button");

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
  render(App, container);
}
