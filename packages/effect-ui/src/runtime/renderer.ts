import { Effect } from "effect";
import { Element } from "../core/component";

export const render = (
  effect: Effect.Effect<Element, never, never>,
  container: globalThis.Element
) => {
  const program = Effect.flatMap(effect, (element) =>
    Effect.sync(() => {
      container.appendChild(element);
    })
  );

  return Effect.runPromise(program);
};
