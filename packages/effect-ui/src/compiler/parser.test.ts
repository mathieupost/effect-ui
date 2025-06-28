import { Effect, Either } from "effect";
import { describe, expect, it } from "vitest";
import { ASTNode } from "./ast";
import { LexerError, lex } from "./lexer";
import { ParserError, parse } from "./parser";

describe("Parser", () => {
  const runParser = (source: string) => {
    const program = Effect.flatMap(lex(source), (tokens) => parse(tokens));
    const result = Effect.runSync(Effect.either(program));
    return result;
  };

  const expectSuccess = (
    result: Either.Either<readonly ASTNode[], LexerError | ParserError>
  ): readonly ASTNode[] => {
    if (Either.isLeft(result)) {
      console.error("Test failed with error:", result.left);
      expect.fail("Expected parsing to succeed, but it failed.");
    }
    return result.right;
  };

  const expectFailure = (
    result: Either.Either<readonly ASTNode[], LexerError | ParserError>
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
        location: {
          start: { line: 1, column: 1 },
          end: { line: 1, column: 12 },
        },
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
            location: {
              start: { line: 1, column: 6 },
              end: { line: 1, column: 13 },
            },
          },
        ],
        location: {
          start: { line: 1, column: 1 },
          end: { line: 1, column: 19 },
        },
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
              location: {
                start: { line: 1, column: 12 },
                end: { line: 1, column: 18 },
              },
            },
          },
        ],
        children: [],
        location: {
          start: { line: 1, column: 1 },
          end: { line: 1, column: 25 },
        },
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
              location: {
                start: { line: 1, column: 12 },
                end: { line: 1, column: 21 },
              },
            },
          },
        ],
        children: [],
        location: {
          start: { line: 1, column: 1 },
          end: { line: 1, column: 28 },
        },
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
        children: [
          {
            type: "Text",
            content: "Hello",
            location: {
              start: { line: 1, column: 6 },
              end: { line: 1, column: 11 },
            },
          },
        ],
        location: {
          start: { line: 1, column: 1 },
          end: { line: 1, column: 17 },
        },
      },
    ];
    const result = runParser(source);
    const ast = expectSuccess(result);
    expect(ast).toEqual(expected);
  });

  it("should parse self-closing tags", () => {
    const source = "<div/>";
    const expected = [
      {
        type: "Element",
        tagName: "div",
        attributes: [],
        children: [],
        location: {
          start: { line: 1, column: 1 },
          end: { line: 1, column: 7 },
        },
      },
    ];
    const result = runParser(source);
    const ast = expectSuccess(result);
    expect(ast).toEqual(expected);
  });

  it("should parse an element with an expression child", () => {
    const source = "<div>{message}</div>";
    const expected = [
      {
        type: "Element",
        tagName: "div",
        attributes: [],
        children: [
          {
            type: "Expression",
            content: "message",
            location: {
              start: { line: 1, column: 6 },
              end: { line: 1, column: 15 },
            },
          },
        ],
        location: {
          start: { line: 1, column: 1 },
          end: { line: 1, column: 21 },
        },
      },
    ];
    const result = runParser(source);
    const ast = expectSuccess(result);
    expect(ast).toEqual(expected);
  });

  it("should parse a self-closing void element", () => {
    const source = "<br/>";
    const expected = [
      {
        type: "Element",
        tagName: "br",
        attributes: [],
        children: [],
        location: {
          start: { line: 1, column: 1 },
          end: { line: 1, column: 6 },
        },
      },
    ];
    const result = runParser(source);
    const ast = expectSuccess(result);
    expect(ast).toEqual(expected);
  });

  it("should fail to parse a void element with a closing tag", () => {
    const source = "<br></br>";
    const result = runParser(source);
    const error = expectFailure(result);
    expect(error).toBeInstanceOf(ParserError);
    if (error instanceof ParserError) {
      expect(error.message).toContain(
        "Void element <br> cannot have children and must be self-closing."
      );
    }
  });

  it("should fail to parse a void element with children", () => {
    const source = "<img>hello</img>";
    const result = runParser(source);
    const error = expectFailure(result);
    expect(error).toBeInstanceOf(ParserError);
    if (error instanceof ParserError) {
      expect(error.message).toContain(
        "Void element <img> cannot have children and must be self-closing."
      );
    }
  });

  it("should parse a self-closing void element with attributes", () => {
    const source = `<img src="cat.jpg"/>`;
    const expected = [
      {
        type: "Element",
        tagName: "img",
        attributes: [
          {
            type: "Attribute",
            name: "src",
            value: {
              type: "StringLiteral",
              value: "cat.jpg",
              location: {
                start: { line: 1, column: 10 },
                end: { line: 1, column: 19 },
              },
            },
          },
        ],
        children: [],
        location: {
          start: { line: 1, column: 1 },
          end: { line: 1, column: 21 },
        },
      },
    ];
    const result = runParser(source);
    const ast = expectSuccess(result);
    expect(ast).toEqual(expected);
  });

  it("should parse a complex structure with mixed content", () => {
    const source = `
      <div class="container">
        <h1>{title}</h1>
        <p>This is a paragraph with <strong>bold</strong> text.</p>
        <br/>
        <input type="text" value={initialValue}/>
      </div>
    `;
    const result = runParser(source.trim());
    const ast = expectSuccess(result);

    expect(ast).toHaveLength(1);
    const root = ast[0];
    expect(root.type).toBe("Element");

    if (root.type === "Element") {
      expect(root.tagName).toBe("div");
      expect(root.attributes).toHaveLength(1);
      expect(root.children).toHaveLength(9); // h1, p, br, input, and whitespace text nodes

      const h1 = root.children[1];
      if (h1.type === "Element") {
        expect(h1.tagName).toBe("h1");
        expect(h1.children[0].type).toBe("Expression");
      } else {
        expect.fail("Expected h1 element");
      }

      const p = root.children[3];
      if (p.type === "Element") {
        expect(p.tagName).toBe("p");
        expect(p.children).toHaveLength(3); // Text, strong, Text
        const strong = p.children[1];
        if (strong.type === "Element") {
          expect(strong.tagName).toBe("strong");
          expect(strong.children[0].type).toBe("Text");
        }
      } else {
        expect.fail("Expected p element");
      }
    }
  });

  it("should report an error for mismatched closing tags", () => {
    const source = "<div></p>";
    const result = runParser(source);
    const error = expectFailure(result);

    expect(error).toBeInstanceOf(ParserError);
    if (error instanceof ParserError) {
      expect(error.message).toContain(
        "Mismatched closing tag. Expected 'div' but got 'p'"
      );
      expect(error.line).toBe(1);
      expect(error.col).toBe(8);
    }
  });

  it("should report an error for unclosed tags", () => {
    const source = "<div>";
    const result = runParser(source);
    const error = expectFailure(result);

    expect(error).toBeInstanceOf(ParserError);
    if (error instanceof ParserError) {
      expect(error.message).toContain("Unclosed tag 'div'.");
      expect(error.line).toBe(1);
      expect(error.col).toBe(1);
    }
  });

  it("should report an error for unexpected closing tags", () => {
    const source = "</div>";
    const result = runParser(source);
    const error = expectFailure(result);

    expect(error).toBeInstanceOf(ParserError);
    if (error instanceof ParserError) {
      expect(error.message).toContain("Unexpected closing tag.");
      expect(error.line).toBe(1);
      expect(error.col).toBe(1);
    }
  });

  it("should report an error for unclosed expressions", () => {
    const source = "<div value={myValue";
    const result = runParser(source);
    const error = expectFailure(result);

    expect(error).toBeInstanceOf(ParserError);
    if (error instanceof ParserError) {
      expect(error.message).toContain("Expected '}'. Got EOF instead.");
      expect(error.line).toBe(1);
      expect(error.col).toBe(20);
    }
  });

  it("should report an error for missing closing >", () => {
    const source = "<div></div";
    const result = runParser(source);
    const error = expectFailure(result);

    expect(error).toBeInstanceOf(ParserError);
    if (error instanceof ParserError) {
      expect(error.message).toContain("Expected '>' after closing tag name.");
      expect(error.line).toBe(1);
      expect(error.col).toBe(11);
    }
  });
});
