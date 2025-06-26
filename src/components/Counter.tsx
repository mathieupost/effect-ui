/** @jsxImportSource ../core */
import { Effect, SubscriptionRef } from "effect";
import { RefProps } from "../core/props";

export const Counter = ({ label = "Counter" }: RefProps<{ label?: string }>) =>
  Effect.gen(function* (_) {
    const count = yield* _(SubscriptionRef.make(0));
    const increment = SubscriptionRef.update(count, (n) => n + 1);

    return (
      <div style="border: 1px solid blue; padding: 10px;">
        <div>
          {label}: {count}
        </div>
        <button onClick={increment}>Increment</button>
      </div>
    );
  });
