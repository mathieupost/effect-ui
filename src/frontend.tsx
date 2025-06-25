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
  tag: string;
  props: Record<string, any>;
  children: (VNode | string)[];
};

const h = (
  tag: string,
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

// Effect TS state management
const counterRef = Ref.unsafeMake(0);

function Counter() {
  const count = Effect.runSync(Ref.get(counterRef));
  return (
    <div>
      <h1>Counter: {count}</h1>
      <button
        onClick={() => {
          Effect.runSync(Ref.update(counterRef, (n) => n + 1));
          rerender();
        }}
      >
        +1
      </button>
    </div>
  );
}

// Mount and rerender logic
const root = document.getElementById("root");
function rerender() {
  if (!root) return;
  root.innerHTML = "";
  root.appendChild(render(Counter()));
}

// Initial render
rerender();
