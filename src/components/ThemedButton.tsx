/** @jsxImportSource ../core */
import { Effect, SubscriptionRef } from "effect";
import { Theme } from "./ThemeProvider";

// Component that consumes the theme
export const ThemedButton = ({ text }: { text: string }) =>
  Effect.gen(function* (_) {
    // Access the theme service
    const theme = yield* _(Theme);
    const count = yield* _(SubscriptionRef.make(0));
    const increment = SubscriptionRef.update(count, (n) => n + 1);

    return (
      <button
        onClick={increment}
        style={`
          background-color: ${theme.primaryColor};
          color: ${theme.backgroundColor};
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        `}
      >
        {text}: {count}
      </button>
    );
  });
