import { Ref } from "effect";
import * as Effect from "effect/Effect";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// A child can be a primitive, another VNode, or an Effect that resolves to one.
type vNodeChild =
  | string
  | number
  | boolean
  | null
  | undefined
  | VNode
  | Ref.Ref<any>;
export type VNodeChild = vNodeChild | Effect.Effect<vNodeChild>;

export interface VNode {
  tag: keyof HTMLElementTagNameMap;
  props: Record<string, any>;
  children: VNodeChild[];
}

export const jsx = (
  tag: keyof HTMLElementTagNameMap | Function,
  props: Record<string, any> = {}
) => {
  const { children = [], ...restProps } = props || {};
  if (typeof tag === "function") {
    return tag({ ...restProps, children });
  }
  return {
    tag,
    props: restProps,
    children,
  };
};

export const jsxs = jsx;
