import { Effect } from "effect";
import { Component } from "effect-ui/core/component";
import { bindText } from "effect-ui/runtime/bindings";
import { Theme } from "../theme";

interface DoubledCounterDisplayProps {
  readonly doubledCount: () => number;
}

export const DoubledCounterDisplay: Component<
  DoubledCounterDisplayProps,
  never,
  Theme
> = ({ doubledCount }) =>
  Effect.gen(function* (_) {
    const theme = yield* _(Theme);

    const h2 = document.createElement("h2");
    h2.style.color = theme.color;
    const doubledPrefixText = document.createTextNode(`Doubled: `);
    const doubledCountText = document.createTextNode(`${doubledCount()}`);
    bindText(doubledCountText, () => `${doubledCount()}`);
    h2.appendChild(doubledPrefixText);
    h2.appendChild(doubledCountText);

    return h2;
  });
