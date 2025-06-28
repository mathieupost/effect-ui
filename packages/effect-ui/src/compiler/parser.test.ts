import { Effect, Either } from "effect";
import { describe, expect, it } from "vitest";
import { ASTNode } from "./ast";
import { lex } from "./lexer";
import { parse } from "./parser";

describe("parser", () => {
  it("should parse a simple element", () => {
    const source = "<div></div>";
    const program = Effect.flatMap(lex(source), (tokens) => parse(tokens));
    const result = Effect.runSync(Effect.either(program));

    expect(Either.isRight(result)).toBe(true);
    const ast = (result as Either.Right<any, ASTNode[]>).right;
    expect(ast).toEqual([
      {
        type: "Element",
        tagName: "div",
        attributes: [],
        children: [],
      },
    ]);
  });

  it("should parse nested elements", () => {
    const source = "<div><p></p></div>";
    const program = Effect.flatMap(lex(source), (tokens) => parse(tokens));
    const result = Effect.runSync(Effect.either(program));

    expect(Either.isRight(result)).toBe(true);
    const ast = (result as Either.Right<any, ASTNode[]>).right;
    expect(ast).toEqual([
      {
        type: "Element",
        tagName: "div",
        attributes: [],
        children: [
          {
            type: "Element",
            tagName: "p",
            attributes: [],
            children: [],
          },
        ],
      },
    ]);
  });

  it("should parse attributes on an element", () => {
    const source = `<div class="main"></div>`;
    const program = Effect.flatMap(lex(source), (tokens) => parse(tokens));
    const result = Effect.runSync(Effect.either(program));

    expect(Either.isRight(result)).toBe(true);
    const ast = (result as Either.Right<any, ASTNode[]>).right;

    expect(ast).toEqual([
      {
        type: "Element",
        tagName: "div",
        attributes: [
          {
            type: "Attribute",
            name: "class",
            value: {
              type: "StringLiteral",
              value: "main",
            },
          },
        ],
        children: [],
      },
    ]);
  });

  it("should parse expression attributes", () => {
    const source = `<div value={myValue}></div>`;
    const program = Effect.flatMap(lex(source), (tokens) => parse(tokens));
    const result = Effect.runSync(Effect.either(program));

    expect(Either.isRight(result)).toBe(true);
    const ast = (result as Either.Right<any, ASTNode[]>).right;

    expect(ast).toEqual([
      {
        type: "Element",
        tagName: "div",
        attributes: [
          {
            type: "Attribute",
            name: "value",
            value: {
              type: "Expression",
              content: "myValue",
            },
          },
        ],
        children: [],
      },
    ]);
  });
});
