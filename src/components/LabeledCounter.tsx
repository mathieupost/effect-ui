/** @jsxImportSource ../core */
import { ref, update } from "@/core/props";
import { Effect } from "effect";
import { Counter } from "./Counter";

export const LabeledCounter = () =>
  Effect.gen(function* (_) {
    const label = yield* ref(_, "Default Label");
    const setLabel = (l: string) => update(label, () => l);

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
