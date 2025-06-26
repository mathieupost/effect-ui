/** @jsxImportSource ./core */
import { Effect, SubscriptionRef } from "effect";
import { RefProps } from "./core/props";
import { mount } from "./core/renderer";

const Counter = ({ label = "Counter" }: RefProps<{ label?: string }>) =>
  Effect.gen(function* (_) {
    const count = yield* _(SubscriptionRef.make(0));
    const increment = SubscriptionRef.update(count, (n) => n + 1);

    return (
      <div>
        <p>
          {label}: {count}
        </p>
        <button onClick={increment}>Increment</button>
      </div>
    );
  });

const LabeledCounter = () =>
  Effect.gen(function* (_) {
    const label = yield* _(SubscriptionRef.make(""));
    const setLabel = (l: string) => SubscriptionRef.update(label, () => l);
    return (
      <div>
        <input
          type="text"
          value={label}
          onInput={(e: Event) => setLabel((e.target as HTMLInputElement).value)}
          onChange={() => {
            console.log("onChange");
          }}
        />
        <Counter label={label} />
      </div>
    );
  });

const App = () => (
  <div>
    <Counter />
    <LabeledCounter />
  </div>
);

const root = document.getElementById("root");
if (root) {
  mount(root, App());
}
