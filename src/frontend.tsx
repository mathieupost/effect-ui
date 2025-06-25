/** @jsx h */
import * as Effect from "effect/Effect";
import * as Ref from "effect/Ref";

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

function render(vnode: VNode | string, mountNode: HTMLElement) {
  currentHookIndex = 0;
  mountNode.innerHTML = "";
  mountNode.appendChild(renderNode(vnode));
}

function renderNode(vnode: VNode | string): Node {
  if (typeof vnode !== "object") {
    return document.createTextNode(vnode);
  }
  if (typeof vnode.tag === "function") {
    return renderNode(vnode.tag(vnode.props, ...vnode.children));
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
    el.appendChild(renderNode(child));
  }
  return el;
}

// --- Minimal hook state system ---
let rerender: () => void = () => {};
let hookStates: any[] = [];
let currentHookIndex = 0;

function useReactiveState<T>(initial: T): [T, (fn: (v: T) => T) => void] {
  const idx = currentHookIndex++;
  if (!hookStates[idx]) {
    const ref = Ref.unsafeMake(initial);
    hookStates[idx] = ref;
  }
  const ref = hookStates[idx] as Ref.Ref<T>;
  const get = () => Effect.runSync(Ref.get(ref));
  const set = (fn: (v: T) => T) => {
    Effect.runSync(Ref.update(ref, fn));
    rerender();
  };
  return [get(), set];
}

// --- Counter as a JSX component ---
const Counter = () => {
  const [count, set] = useReactiveState(0);
  return (
    <div>
      <h1>Counter: {count}</h1>
      <button onClick={() => set((n) => n + 1)}>+1</button>
    </div>
  );
};

// --- App as a JSX component ---
const App = () => (
  <div>
    <Counter />
    <Counter />
  </div>
);

// --- Mount App at root and rerender on state changes ---
const root = document.getElementById("root");
if (root) {
  rerender = () => render(<App />, root);
  rerender();
}
