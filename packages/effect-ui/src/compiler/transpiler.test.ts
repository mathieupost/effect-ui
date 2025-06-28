import { describe, expect, it } from "vitest";
import type { ElementNode } from "./ast";
import { transpile } from "./transpiler";

describe("transpiler", () => {
  const location = {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 2 },
  };

  it("should transpile a simple div element", () => {
    const ast: ElementNode[] = [
      {
        type: "Element",
        tagName: "div",
        attributes: [],
        children: [],
        location,
      },
    ];

    const expectedJs = "h('div', {  }, [])";
    expect(transpile(ast)).toBe(expectedJs);
  });

  it("should transpile an element with attributes", () => {
    const ast: ElementNode[] = [
      {
        type: "Element",
        tagName: "div",
        attributes: [
          {
            type: "Attribute",
            name: "class",
            value: { type: "StringLiteral", value: "container" },
          },
          {
            type: "Attribute",
            name: "id",
            value: { type: "Expression", content: "myId" },
          },
        ],
        children: [],
        location,
      },
    ];

    const expectedJs = "h('div', { 'class': 'container', 'id': myId }, [])";
    expect(transpile(ast)).toBe(expectedJs);
  });

  it("should transpile an element with a text child", () => {
    const ast: ElementNode[] = [
      {
        type: "Element",
        tagName: "div",
        attributes: [],
        children: [
          {
            type: "Text",
            content: "Hello, World!",
            location,
          },
        ],
        location,
      },
    ];

    const expectedJs = "h('div', {  }, ['Hello, World!'])";
    expect(transpile(ast)).toBe(expectedJs);
  });

  it("should transpile nested elements", () => {
    const ast: ElementNode[] = [
      {
        type: "Element",
        tagName: "div",
        attributes: [],
        children: [
          {
            type: "Element",
            tagName: "p",
            attributes: [],
            children: [
              {
                type: "Text",
                content: "Nested",
                location,
              },
            ],
            location,
          },
        ],
        location,
      },
    ];

    const expectedJs = `h('div', {  }, [h('p', {  }, ['Nested'])])`;
    expect(transpile(ast)).toBe(expectedJs);
  });
});
