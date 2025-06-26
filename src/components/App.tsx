/** @jsxImportSource ../core */
import { Counter } from "./Counter";
import { LabeledCounter } from "./LabeledCounter";

export const App = () => (
  <div>
    <h1>Effect Dependency Injection Demo</h1>

    <Counter />
    <LabeledCounter />
  </div>
);
