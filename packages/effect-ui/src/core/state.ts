import { Effect, Ref } from "effect";

// --- The Core Reactive Context ---

type Subscriber = () => void;

// A simple stack to track the currently running effect.
const effectStack: Subscriber[] = [];

// A map from a signal's Ref to the set of effects that depend on it.
const subscriptions = new WeakMap<Ref.Ref<any>, Set<Subscriber>>();

const subscribe = (ref: Ref.Ref<any>) => {
  const currentEffect = effectStack[effectStack.length - 1];
  if (currentEffect) {
    if (!subscriptions.has(ref)) {
      subscriptions.set(ref, new Set());
    }
    subscriptions.get(ref)!.add(currentEffect);
  }
};

const notify = (ref: Ref.Ref<any>) => {
  if (subscriptions.has(ref)) {
    subscriptions.get(ref)!.forEach((effect) => effect());
  }
};

// --- The Public API ---

/**
 * Creates a reactive signal.
 *
 * A signal is a piece of state that can be read and written to.
 * When a signal's value changes, it can notify other parts of the application
 * that depend on it, allowing for fine-grained reactivity.
 *
 * @param initial - The initial value of the signal.
 * @returns A tuple containing a getter and a setter function.
 */
export const createSignal = <A>(initial: A): [() => A, (a: A) => void] => {
  const ref = Effect.runSync(Ref.make(initial));

  const get = () => {
    subscribe(ref);
    return Effect.runSync(Ref.get(ref));
  };

  const set = (a: A) => {
    Effect.runSync(Ref.set(ref, a));
    notify(ref);
  };

  return [get, set];
};

/**
 * Creates an effect that automatically tracks its dependencies and re-runs
 * when those dependencies change.
 *
 * @param fn - The function to run as an effect.
 */
export const createEffect = <A>(fn: () => A): void => {
  const effect = () => {
    effectStack.push(effect);
    try {
      fn();
    } finally {
      effectStack.pop();
    }
  };
  effect();
};
