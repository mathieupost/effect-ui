/** @jsxImportSource ../core */
import { ref, RefProps, update } from "@/core/props";
import { Effect } from "effect";

export const Counter = ({ label = "Counter" }: RefProps<{ label?: string }>) =>
  Effect.gen(function* (_) {
    const count = yield* ref(_, 0);
    const increment = update(count, (n) => n + 1);

    return (
      <div style="border: 1px solid blue; padding: 10px;">
        <div>
          {label}: {count}
        </div>
        <button onClick={increment}>Increment</button>
      </div>
    );
  });
