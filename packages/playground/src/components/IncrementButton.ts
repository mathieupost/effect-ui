import { Effect } from "effect";
import { Component } from "effect-ui/core/component";

interface IncrementButtonProps {
  readonly onIncrement: () => void;
}

export const IncrementButton: Component<IncrementButtonProps> = ({
  onIncrement,
}) =>
  Effect.sync(() => {
    const button = document.createElement("button");
    button.textContent = "Increment";
    button.onclick = onIncrement;
    return button;
  });
