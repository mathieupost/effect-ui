import { Effect, Either } from "effect";
import { describe, expect, it } from "vitest";
import type { ElementNode } from "./ast";
import { TranspilerError, transpile } from "./transpiler";

describe("transpiler", () => {
  const location = {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 2 },
  };

  const runTranspiler = (
    ast: ElementNode[]
  ): Either.Either<string, TranspilerError> => {
    return Effect.runSync(Effect.either(transpile(ast)));
  };

  const expectSuccess = (
    result: Either.Either<string, TranspilerError>
  ): string => {
    if (Either.isLeft(result)) {
      console.error("Test failed with error:", result.left);
      expect.fail("Expected transpiling to succeed, but it failed.");
    }
    return result.right;
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
    const result = runTranspiler(ast);
    const transpiled = expectSuccess(result);
    expect(transpiled).toBe(expectedJs);
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
            value: { type: "StringLiteral", value: "container", location },
          },
          {
            type: "Attribute",
            name: "id",
            value: { type: "Expression", content: "myId", location },
          },
        ],
        children: [],
        location,
      },
    ];

    const expectedJs = "h('div', { 'class': 'container', 'id': myId }, [])";
    const result = runTranspiler(ast);
    const transpiled = expectSuccess(result);
    expect(transpiled).toBe(expectedJs);
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
    const result = runTranspiler(ast);
    const transpiled = expectSuccess(result);
    expect(transpiled).toBe(expectedJs);
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
    const result = runTranspiler(ast);
    const transpiled = expectSuccess(result);
    expect(transpiled).toBe(expectedJs);
  });

  it("should transpile an element with an expression child", () => {
    const ast: ElementNode[] = [
      {
        type: "Element",
        tagName: "div",
        attributes: [],
        children: [
          {
            type: "Expression",
            content: "message",
            location,
          },
        ],
        location,
      },
    ];

    const expectedJs = `h('div', {  }, [message])`;
    const result = runTranspiler(ast);
    const transpiled = expectSuccess(result);
    expect(transpiled).toBe(expectedJs);
  });
});
