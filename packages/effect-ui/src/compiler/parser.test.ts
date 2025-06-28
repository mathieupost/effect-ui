import { Effect, Either } from "effect";
import { describe, expect, it } from "vitest";
import { ASTNode } from "./ast";
import { LexerError, lex } from "./lexer";
import { ParserError, parse } from "./parser";

describe("parser", () => {
  const runParser = (source: string) => {
    const program = Effect.flatMap(lex(source), (tokens) => parse(tokens));
    const result = Effect.runSync(Effect.either(program));
    return result;
  };

  const expectSuccess = (
    result: Either.Either<ASTNode[], LexerError | ParserError>
  ): ASTNode[] => {
    if (Either.isLeft(result)) {
      console.error("Test failed with error:", result.left);
      expect.fail("Expected parsing to succeed, but it failed.");
    }
    return result.right;
  };

  const expectFailure = (
    result: Either.Either<ASTNode[], LexerError | ParserError>
  ): LexerError | ParserError => {
    if (Either.isRight(result)) {
      console.error("Test succeeded unexpectedly with result:", result.right);
      expect.fail("Expected parsing to fail, but it succeeded.");
    }
    return result.left;
  };

  it("should parse a simple element", () => {
    const source = "<div></div>";
    const expected = [
      {
        type: "Element",
        tagName: "div",
        attributes: [],
        children: [],
      },
    ];
    const result = runParser(source);
    const ast = expectSuccess(result);
    expect(ast).toEqual(expected);
  });

  it("should parse nested elements", () => {
    const source = "<div><p></p></div>";
    const expected = [
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
    ];
    const result = runParser(source);
    const ast = expectSuccess(result);
    expect(ast).toEqual(expected);
  });

  it("should parse attributes on an element", () => {
    const source = `<div class="main"></div>`;
    const expected = [
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
    ];
    const result = runParser(source);
    const ast = expectSuccess(result);
    expect(ast).toEqual(expected);
  });

  it("should parse expression attributes", () => {
    const source = `<div value={myValue}></div>`;
    const expected = [
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
    ];
    const result = runParser(source);
    const ast = expectSuccess(result);
    expect(ast).toEqual(expected);
  });

  it("should parse text nodes within an element", () => {
    const source = "<div>Hello</div>";
    const expected = [
      {
        type: "Element",
        tagName: "div",
        attributes: [],
        children: [{ type: "Text", content: "Hello" }],
      },
    ];
    const result = runParser(source);
    const ast = expectSuccess(result);
    expect(ast).toEqual(expected);
  });

  it("should report an error for mismatched closing tags", () => {
    const source = "<div></p>";
    const result = runParser(source);
    const error = expectFailure(result);

    expect(error._tag).toBe("ParserError");
    expect((error as ParserError).message).toContain(
      "Mismatched closing tag. Expected 'div' but got 'p'"
    );
    expect((error as ParserError).line).toBe(1);
    expect((error as ParserError).col).toBe(6);
  });
});
