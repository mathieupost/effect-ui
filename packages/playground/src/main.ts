import { Effect } from "effect";
import { Component } from "effect-ui/core/component";
import "./style.css";

const App: Component<{}, never, never> = () =>
  Effect.sync(() => {
    const app = document.createElement("div");
    app.innerHTML = `
      <h1>Hello Effect-UI!</h1>
    `;
    return app;
  });

const program = App({});

// We will need a runtime to execute this effect and render the element.
// For now, let's just log the effect.
console.log(program);
