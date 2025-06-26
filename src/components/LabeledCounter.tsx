/** @jsxImportSource ../core */
import { Effect, SubscriptionRef } from "effect";
import { Counter } from "./Counter";

export const LabeledCounter = () =>
  Effect.gen(function* (_) {
    const label = yield* _(SubscriptionRef.make("Default Label"));
    const setLabel = (l: string) => SubscriptionRef.update(label, () => l);
    return (
      <div>
        Edit the label to see the counter update:{" "}
        <input
          type="text"
          value={label}
          onInput={(e: Event) => setLabel((e.target as HTMLInputElement).value)}
        />
        <Counter label={label} />
      </div>
    );
  });
