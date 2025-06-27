import { Effect } from "effect";

export type Element = globalThis.Element;

export type ComponentProps<P> = P & {
  children?: Effect.Effect<Element, never, never>[];
};

export type Component<P, E, R> = (
  props: ComponentProps<P>
) => Effect.Effect<Element, E, R>;
