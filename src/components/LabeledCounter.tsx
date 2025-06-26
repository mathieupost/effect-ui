/** @jsxImportSource ../core */
import { Effect, SubscriptionRef } from "effect";
import { Counter } from "./Counter";

export const LabeledCounter = () =>
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
