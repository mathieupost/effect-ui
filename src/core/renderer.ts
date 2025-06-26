import { Effect, Fiber, Scope, Stream, SubscriptionRef } from "effect";
import { VNode, VNodeChild } from "./jsx-runtime";

/**
 * The main entry point. Mounts a component into a DOM container.
 */
export const mount = (
  container: HTMLElement,
  rootComponent: VNode | Effect.Effect<VNode>
) => {
  // Create a scope that will live for the lifetime of the app.
  // When this scope is closed, all child effects are interrupted.
  const appScope = Scope.make();

  // The main program: render the root component and add it to the scope.
  const program = Effect.gen(function* (_) {
    const scope = yield* _(appScope);
    const root = Effect.isEffect(rootComponent)
      ? yield* _(rootComponent)
      : rootComponent;
    const { node } = yield* _(renderReactive(root));
    container.appendChild(node);
  }).pipe(Effect.scoped); // Run this within the app's scope

  // Run the entire application. We keep the fiber to be able to unmount it.
  const appFiber = Effect.runFork(program);

  // Return an unmount function
  return () => Effect.runFork(Fiber.interrupt(appFiber));
};

/**
 * Helper function to check if a value is a Stream
 */
function isStream(value: any): value is Stream.Stream<any> {
  return (
    value &&
    typeof value === "object" &&
    "_tag" in value &&
    value._tag === "Stream"
  );
}

/**
 * Helper function to check if a value is a SubscriptionRef
 */
export function isSubscriptionRef<T>(
  value: T | SubscriptionRef.SubscriptionRef<T>
): value is SubscriptionRef.SubscriptionRef<T> {
  return (
    value &&
    typeof value === "object" &&
    "changes" in value &&
    value.changes !== undefined
  );
}

/**
 * Enhanced recursive rendering function with reactivity support.
 * Returns both the DOM node and cleanup effects.
 */
function renderReactive(
  vnode: VNodeChild
): Effect.Effect<
  { node: Node; cleanup: Effect.Effect<void> },
  never,
  Scope.Scope
> {
  // 1. Handle primitive nodes (strings, numbers)
  if (
    typeof vnode === "string" ||
    typeof vnode === "number" ||
    typeof vnode === "boolean"
  ) {
    return Effect.succeed({
      node: document.createTextNode(String(vnode)),
      cleanup: Effect.void,
    });
  }

  // 2. Handle null or empty nodes
  if (vnode === null || vnode === undefined) {
    return Effect.succeed({
      node: document.createComment("empty"),
      cleanup: Effect.void,
    });
  }

  // 3. Handle SubscriptionRef nodes (reactive state) with proper subscriptions
  if (isSubscriptionRef(vnode)) {
    return Effect.gen(function* (_) {
      // Get initial value and render it
      const initialValue = yield* _(SubscriptionRef.get(vnode));

      const { node: initialNode, cleanup: initialCleanup } = yield* _(
        renderReactive(initialValue)
      );

      let currentNode = initialNode;
      let currentCleanup = initialCleanup;

      // Subscribe to the SubscriptionRef changes stream
      const subscriptionFiber = yield* _(
        Effect.gen(function* (_) {
          // Get the changes stream directly from the SubscriptionRef
          const changesStream = vnode.changes;

          // We want ALL changes, not skipping the first one since we're setting up after initial render
          yield* _(
            Stream.runForEach(changesStream, (newValue) =>
              Effect.gen(function* (_) {
                // Clean up previous render
                yield* _(currentCleanup);

                // Render new value
                const { node: newNode, cleanup: newCleanup } = yield* _(
                  renderReactive(newValue)
                );

                // Replace in DOM
                if (currentNode.parentNode) {
                  currentNode.parentNode.replaceChild(newNode, currentNode);
                }

                currentNode = newNode;
                currentCleanup = newCleanup;
              })
            )
          );
        }).pipe(Effect.forkDaemon)
      );

      return {
        node: initialNode,
        cleanup: Effect.gen(function* (_) {
          yield* _(currentCleanup);
          yield* _(Fiber.interrupt(subscriptionFiber));
        }),
      };
    });
  }

  // 4. Handle Stream nodes (continuous reactive data)
  if (isStream(vnode)) {
    return Effect.gen(function* (_) {
      const placeholder = document.createComment("stream-boundary");
      let currentNode: Node = placeholder;
      let currentCleanup = Effect.void;

      // Subscribe to stream updates
      const subscriptionFiber = yield* _(
        Effect.gen(function* (_) {
          yield* _(
            Stream.runForEach(vnode, (newValue) =>
              Effect.gen(function* (_) {
                // Clean up previous render
                yield* _(currentCleanup);

                // Render new value
                const { node: newNode, cleanup: newCleanup } = yield* _(
                  renderReactive(newValue)
                );

                // Replace in DOM
                if (currentNode.parentNode) {
                  currentNode.parentNode.replaceChild(newNode, currentNode);
                }

                currentNode = newNode;
                currentCleanup = newCleanup;
              })
            )
          );
        }).pipe(Effect.forkDaemon)
      );

      return {
        node: placeholder,
        cleanup: Effect.gen(function* (_) {
          yield* _(currentCleanup);
          yield* _(Fiber.interrupt(subscriptionFiber));
        }),
      };
    });
  }

  // 5. Handle VNodes that are Effects
  if (Effect.isEffect(vnode)) {
    return Effect.gen(function* (_) {
      // Run the Effect to get the value
      const resolvedValue = yield* _(vnode);

      // Render the resolved value
      return yield* _(renderReactive(resolvedValue));
    });
  }

  // 6. Handle regular element nodes (e.g., <div>)
  return Effect.gen(function* (_) {
    const element = document.createElement(vnode.tag);
    const childCleanups: Effect.Effect<void>[] = [];

    // Process props (attributes and event listeners)
    for (const key in vnode.props) {
      if (key.startsWith("on")) {
        // Event handlers are Effects to be run
        const handler = vnode.props[key] as
          | Effect.Effect<void>
          | ((...args: any[]) => Effect.Effect<void>)
          | ((...args: any[]) => void);
        element.addEventListener(key.slice(2).toLowerCase(), (...args) => {
          if (typeof handler === "function") {
            const result = handler(...args);
            if (Effect.isEffect(result)) {
              Effect.runFork(result);
            }
          } else {
            Effect.runFork(handler);
          }
        });
      } else if (key !== "children") {
        // Handle reactive props
        const propValue = vnode.props[key];
        if (isSubscriptionRef(propValue)) {
          // Set initial value
          const initialValue = yield* _(SubscriptionRef.get(propValue));
          element.setAttribute(key, String(initialValue));

          // Subscribe to changes
          const propSubscriptionFiber = yield* _(
            Effect.gen(function* (_) {
              // Skip the first value since we already set it
              const changesStream = Stream.drop(propValue.changes, 1);

              yield* _(
                Stream.runForEach(changesStream, (newValue) =>
                  Effect.sync(() => element.setAttribute(key, String(newValue)))
                )
              );
            }).pipe(Effect.forkDaemon)
          );

          childCleanups.push(Fiber.interrupt(propSubscriptionFiber));
        } else {
          element.setAttribute(key, String(propValue));
        }
      }
    }

    // Recursively render and append children
    for (const child of vnode.children) {
      const { node: childNode, cleanup: childCleanup } = yield* _(
        renderReactive(child)
      );
      element.appendChild(childNode);
      childCleanups.push(childCleanup);
    }

    return {
      node: element,
      cleanup: Effect.all(childCleanups, { discard: true }),
    };
  });
}
