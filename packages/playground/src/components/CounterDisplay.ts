import { Effect } from "effect";
import { Component } from "effect-ui/core/component";
import { bindText } from "effect-ui/runtime/bindings";
import { Theme } from "../theme";

interface CounterDisplayProps {
  readonly count: () => number;
}

export const CounterDisplay: Component<CounterDisplayProps, never, Theme> = ({
  count,
}) =>
  Effect.gen(function* (_) {
    const theme = yield* _(Theme);

    const h1 = document.createElement("h1");
    h1.style.color = theme.color;

    const countPrefixText = document.createTextNode(`Count: `);
    const countText = document.createTextNode(`${count()}`);
    bindText(countText, () => `${count()}`);

    h1.appendChild(countPrefixText);
    h1.appendChild(countText);

    return h1;
  });
