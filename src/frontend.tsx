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

// --- useReactiveState hook ---
function useReactiveState<T>(
  initial: T,
  mountNode: HTMLElement,
  renderFn: (value: T, set: (fn: (v: T) => T) => void) => VNode
) {
  return Effect.gen(function* (_) {
    const ref = yield* _(SubscriptionRef.make(initial));
    let node: Node | null = null;
    const set = (fn: (v: T) => T) => Effect.runSync(Ref.update(ref, fn));
    yield* _(
      Stream.runForEach(ref.changes, (value) =>
        Effect.sync(() => {
          const vnode = renderFn(value, set);
          const newNode = render(vnode);
          if (node && node.parentNode) {
            node.parentNode.replaceChild(newNode, node);
          } else if (!node && mountNode) {
            mountNode.innerHTML = "";
            mountNode.appendChild(newNode);
          }
          node = newNode;
        })
      )
    );
  });
}

const Counter = (mountNode: HTMLElement) =>
  useReactiveState(0, mountNode, (count, set) => (
    <div>
      <h1>Counter: {count}</h1>
      <button onClick={() => set((n) => n + 1)}>+1</button>
    </div>
  ));

// --- Mount Counter at root ---
const root = document.getElementById("root");
if (root) {
  Effect.runPromise(Counter(root));
}
