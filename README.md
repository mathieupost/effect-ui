# Effect-UI Proof-of-Concept

Effect-UI is a declarative UI framework inspired by SolidJS and powered by Effect-TS. It demonstrates fine-grained reactivity, type-safety, and a fully Effect-driven component lifecycle.

## Philosophy

- **Effect-First:** All state, events, and lifecycle are managed via Effect-TS.
- **Fine-Grained Reactivity:** DOM updates are precise and efficient, inspired by SolidJS.
- **Type-Safety:** Leverages TypeScript and Effect-TS for robust, correct UIs.
- **Developer Experience:** Supports JSX for familiar, declarative UI authoring.

## File Structure

```
/
├── index.html
├── package.json
├── tsconfig.json
└── src/
    ├── core/
    │   ├── jsx-runtime.ts
    │   └── renderer.ts
    └── index.ts
```

## Getting Started

1. **Install dependencies:**
   ```sh
   bun install
   ```
2. **Run the proof-of-concept app:**
   ```sh
   bun run dev
   ```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## About

This project is a minimal demonstration of how Effect-TS can power a modern, reactive UI framework with fine-grained updates and a declarative API.
