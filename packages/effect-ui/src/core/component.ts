import { Effect } from "effect";

export type Element = globalThis.Element;

export type ComponentProps<P> = P & {
  children?: Effect.Effect<Element, any, any>[];
};

export type Component<P = {}, E = never, R = never> = (
  props: ComponentProps<P>
) => Effect.Effect<Element, E, R>;

export const createElement = <P, E, R>(
  component: Component<P, E, R>,
  props: P,
  ...children: Effect.Effect<Element, any, any>[]
): Effect.Effect<Element, E, R> => {
  return component({ ...(props as any), children });
};
