/** @jsxImportSource ../core */
import { Counter } from "./Counter";
import { LabeledCounter } from "./LabeledCounter";
import { Theme, ThemeProvider } from "./ThemeProvider";
import { ThemedButton } from "./ThemedButton";

export const App = () => {
  const darkTheme: Theme = {
    primaryColor: "#61dafb",
    backgroundColor: "#282c34",
  };

  const lightTheme: Theme = {
    primaryColor: "#2c5aa0",
    backgroundColor: "#f5f5f5",
  };

  return (
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <h1>Effect UI Demo</h1>

      {/* Regular components without theme */}
      <Counter />
      <LabeledCounter />

      {/* Themed components using dependency injection */}
      <ThemeProvider
        theme={darkTheme}
        child={<ThemedButton text="Dark Button" />}
      />

      <ThemeProvider
        theme={lightTheme}
        child={<ThemedButton text="Light Button" />}
      />
    </div>
  );
};
