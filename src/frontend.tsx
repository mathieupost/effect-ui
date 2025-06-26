/** @jsxImportSource ./core */
import { App } from "./components/App";
import { mount } from "./core/renderer";

const root = document.getElementById("root");
if (root) {
  mount(root, App());
}
