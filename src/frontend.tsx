/** @jsx h */
import * as Effect from "effect/Effect";
import * as Ref from "effect/Ref";
import * as Stream from "effect/Stream";
import * as SubscriptionRef from "effect/SubscriptionRef";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

type VNode = {
  tag: string | ((props: any, ...children: any[]) => VNode);
  props: Record<string, any>;
  children: (VNode | string)[];
};

const h = (
  tag: string | ((props: any, ...children: any[]) => VNode),
  props: Record<string, any>,
  ...children: (VNode | string)[]
): VNode => ({
  tag,
  props,
  children,
});

// Render VNode to real DOM
function render(vnode: VNode | string): Node {
  if (typeof vnode !== "object") {
    return document.createTextNode(vnode);
  }
  // Support function components
  if (typeof vnode.tag === "function") {
    return render(vnode.tag(vnode.props, ...vnode.children));
  }
  const el = document.createElement(vnode.tag);
  for (const [k, v] of Object.entries(vnode.props || {})) {
    if (k.startsWith("on") && typeof v === "function") {
      el.addEventListener(k.slice(2).toLowerCase(), v);
    } else {
      el.setAttribute(k, v);
    }
  }
  for (const child of vnode.children) {
    el.appendChild(render(child));
  }
  return el;
}

// --- Reactive Counter Component using SubscriptionRef and Stream ---
const Counter = () =>
  Effect.gen(function* (_) {
    // Create a SubscriptionRef for state
    const ref = yield* _(SubscriptionRef.make(0));
    let node: Node | null = null;
    const root = document.getElementById("root");

    // Subscribe to changes and update DOM
    yield* _(
      Stream.runForEach(ref.changes, (count) =>
        Effect.sync(() => {
          const vnode = (
            <div>
              <h1>Counter: {count}</h1>
              <button
                onClick={() => {
                  Effect.runSync(Ref.update(ref, (n) => n + 1));
                }}
              >
                +1
              </button>
            </div>
          );
          const newNode = render(vnode);
          if (node && node.parentNode) {
            node.parentNode.replaceChild(newNode, node);
          } else if (!node && root) {
            root.innerHTML = "";
            root.appendChild(newNode);
          }
          node = newNode;
        })
      )
    );
  });

// --- App as an Effect ---
function App() {
  return Counter();
}

// --- Mount the App Effect ---
Effect.runPromise(App());
