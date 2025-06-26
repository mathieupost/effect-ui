# Effect UI Framework (Proof of Concept)

Effect UI is a declarative, reactive UI framework built on top of [Effect TS](https://github.com/Effect-TS/effect) and inspired by SolidJS. It provides fine-grained reactivity, dependency injection, and a fully Effect-driven component lifecycle with JSX support.

<a href="https://x.com/m9tdev"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#000" viewBox="0 0 16 16"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/></svg> @m9tdev</a>

## Philosophy

- **Effect-First:** All state, events, lifecycle, and side effects are managed via Effect
- **Fine-Grained Reactivity:** DOM updates are precise and efficient using SubscriptionRef for reactive state
- **Type-Safety (🔜):** Leverages TypeScript and Effect for robust, correct UIs with compile-time guarantees
- **Dependency Injection:** Built-in support for Effect Context for service injection and theming
- **Developer Experience:** Supports JSX for familiar, declarative UI authoring with custom JSX runtime

## Key Features

- **Reactive State**: Uses `SubscriptionRef` for fine-grained reactive updates
- **Effect-based Components**: Components are Effect computations that can access services and manage resources
- **Dependency Injection**: Built-in Context support for themes, services, and configuration
- **Custom JSX Runtime**: Tailored JSX implementation that works seamlessly with Effect
- **Hot Module Replacement**: Development server with HMR powered by Bun
- **Full-Stack Ready**: Includes both frontend framework and backend API routes

## File Structure

The core framework logic resides in the `src/core` directory, which contains the essential building blocks of Effect UI. The other files and folders primarily demonstrate how to use the framework in real-world applications.

```
effect-ui/
├── package.json
├── tsconfig.json
├── bunfig.toml
└── src/
    ├── core/                   # Framework Core
    │   ├── jsx-runtime.ts      # Custom JSX implementation
    │   ├── jsx-dev-runtime.ts  # JSX dev runtime
    │   ├── renderer.ts         # Reactive rendering engine
    │   └── props.ts            # Type utilities for reactive props
    ├── index.tsx     # Development server with API routes
    ├── frontend.tsx  # Frontend entry point
    ├── index.html    # HTML template
    ├── index.css     # Styles
    └── components/   # UI Components
        ├── App.tsx             # Main application component
        ├── Counter.tsx         # Reactive counter example
        ├── LabeledCounter.tsx  # Counter with props
        ├── ThemeProvider.tsx   # Theme context and provider
        └── ThemedButton.tsx    # Component using dependency injection
```

## Getting Started

1. **Install dependencies:**

   ```sh
   bun install
   ```

2. **Run the development server:**

   ```sh
   bun run dev
   ```

3. **Open your browser:**
   Navigate to the URL shown in the terminal (typically `http://localhost:3000`)

## Example Usage

A simple counter component:

```tsx
import { Effect, SubscriptionRef } from "effect";

export const Counter = () =>
  Effect.gen(function* (_) {
    const count = yield* _(SubscriptionRef.make(0));
    const increment = SubscriptionRef.update(count, (n) => n + 1);

    return <button onClick={increment}>You clicked {count} times</button>;
  });
```

See `src/components/App.tsx` for an example of how to use the framework.

## Architecture

Effect-UI combines several powerful concepts:

- **Reactive Rendering**: Uses Effect SubscriptionRef for automatic DOM updates when state changes
- **Effect-based Lifecycle**: Components are Effect computations that can manage resources, handle errors, and access services
- **Context System**: Built on Effect Context for dependency injection and service management
- **Custom JSX**: Tailored JSX runtime that understands Effect computations and reactive values
- **Scoped Resources**: Automatic cleanup of subscriptions and resources when components unmount

## About

This project demonstrates how Effect can power a modern, reactive UI framework with fine-grained updates, dependency injection, and a declarative API. It showcases the potential for Effect to provide a robust foundation for frontend applications.
