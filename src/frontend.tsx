/** @jsxImportSource ./core */
import { Effect, SubscriptionRef } from "effect";
import { mount } from "./core/renderer";

const Counter = () =>
  Effect.gen(function* (_) {
    const count = yield* _(SubscriptionRef.make(0));
    const increment = SubscriptionRef.update(count, (n) => n + 1);

    return (
      <div>
        <p>Count: {count}</p>
        <button onClick={increment}>Increment</button>
      </div>
    );
  });

const App = () => (
  <div>
    <Counter />
    <Counter />
  </div>
);

const root = document.getElementById("root");
if (root) {
  mount(root, App());
}
