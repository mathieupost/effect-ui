import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { lex } from "./lexer";
import { TokenType } from "./token";

describe("Lexer", () => {
  const runLexer = (source: string) => {
    const program = lex(source);
    const result = Effect.runSync(program);
    return result.map(({ type, lexeme }) => ({ type, lexeme }));
  };

  it("should tokenize single-character tokens", () => {
    const source = "<>/={}";
    const expected = [
      { type: TokenType.LessThan, lexeme: "<" },
      { type: TokenType.GreaterThan, lexeme: ">" },
      { type: TokenType.Slash, lexeme: "/" },
      { type: TokenType.Equals, lexeme: "=" },
      { type: TokenType.OpenBrace, lexeme: "{" },
      { type: TokenType.CloseBrace, lexeme: "}" },
      { type: TokenType.EOF, lexeme: "" },
    ];
    expect(runLexer(source)).toEqual(expected);
  });

  it("should tokenize identifiers, whitespace, and strings", () => {
    const source = `div "hello"`;
    const expected = [
      { type: TokenType.Identifier, lexeme: "div" },
      { type: TokenType.Whitespace, lexeme: " " },
      { type: TokenType.String, lexeme: `"hello"` },
      { type: TokenType.EOF, lexeme: "" },
    ];
    expect(runLexer(source)).toEqual(expected);
  });

  it("should tokenize a simple element structure with whitespace", () => {
    const source = "<div> Hello   World </div>";
    const expected = [
      { type: TokenType.LessThan, lexeme: "<" },
      { type: TokenType.Identifier, lexeme: "div" },
      { type: TokenType.GreaterThan, lexeme: ">" },
      { type: TokenType.Whitespace, lexeme: " " },
      { type: TokenType.Identifier, lexeme: "Hello" },
      { type: TokenType.Whitespace, lexeme: "   " },
      { type: TokenType.Identifier, lexeme: "World" },
      { type: TokenType.Whitespace, lexeme: " " },
      { type: TokenType.LessThan, lexeme: "<" },
      { type: TokenType.Slash, lexeme: "/" },
      { type: TokenType.Identifier, lexeme: "div" },
      { type: TokenType.GreaterThan, lexeme: ">" },
      { type: TokenType.EOF, lexeme: "" },
    ];
    expect(runLexer(source)).toEqual(expected);
  });

  it("should tokenize a self-closing tag", () => {
    const source = "<div/>";
    const expected = [
      { type: TokenType.LessThan, lexeme: "<" },
      { type: TokenType.Identifier, lexeme: "div" },
      { type: TokenType.Slash, lexeme: "/" },
      { type: TokenType.GreaterThan, lexeme: ">" },
      { type: TokenType.EOF, lexeme: "" },
    ];
    expect(runLexer(source)).toEqual(expected);
  });

  it("should tokenize attributes with string literals", () => {
    const source = `<div class="container">`;
    const expected = [
      { type: TokenType.LessThan, lexeme: "<" },
      { type: TokenType.Identifier, lexeme: "div" },
      { type: TokenType.Whitespace, lexeme: " " },
      { type: TokenType.Identifier, lexeme: "class" },
      { type: TokenType.Equals, lexeme: "=" },
      { type: TokenType.String, lexeme: `"container"` },
      { type: TokenType.GreaterThan, lexeme: ">" },
      { type: TokenType.EOF, lexeme: "" },
    ];
    expect(runLexer(source)).toEqual(expected);
  });

  it("should tokenize attributes with expression values", () => {
    const source = `<div class={myClass}>`;
    const expected = [
      { type: TokenType.LessThan, lexeme: "<" },
      { type: TokenType.Identifier, lexeme: "div" },
      { type: TokenType.Whitespace, lexeme: " " },
      { type: TokenType.Identifier, lexeme: "class" },
      { type: TokenType.Equals, lexeme: "=" },
      { type: TokenType.OpenBrace, lexeme: "{" },
      { type: TokenType.Identifier, lexeme: "myClass" },
      { type: TokenType.CloseBrace, lexeme: "}" },
      { type: TokenType.GreaterThan, lexeme: ">" },
      { type: TokenType.EOF, lexeme: "" },
    ];
    expect(runLexer(source)).toEqual(expected);
  });

  it("should tokenize spread attributes", () => {
    const source = `<div {...props}>`;
    const expected = [
      { type: TokenType.LessThan, lexeme: "<" },
      { type: TokenType.Identifier, lexeme: "div" },
      { type: TokenType.Whitespace, lexeme: " " },
      { type: TokenType.OpenBrace, lexeme: "{" },
      { type: TokenType.Spread, lexeme: "..." },
      { type: TokenType.Identifier, lexeme: "props" },
      { type: TokenType.CloseBrace, lexeme: "}" },
      { type: TokenType.GreaterThan, lexeme: ">" },
      { type: TokenType.EOF, lexeme: "" },
    ];
    expect(runLexer(source)).toEqual(expected);
  });

  it("should correctly tokenize an attribute with a > in its string value", () => {
    const source = `<div data-logic="if(x > 5)">Content</div>`;
    const expected = [
      { type: TokenType.LessThan, lexeme: "<" },
      { type: TokenType.Identifier, lexeme: "div" },
      { type: TokenType.Whitespace, lexeme: " " },
      { type: TokenType.Identifier, lexeme: "data-logic" },
      { type: TokenType.Equals, lexeme: "=" },
      { type: TokenType.String, lexeme: `"if(x > 5)"` },
      { type: TokenType.GreaterThan, lexeme: ">" },
      { type: TokenType.Text, lexeme: "Content" },
      { type: TokenType.LessThan, lexeme: "<" },
      { type: TokenType.Slash, lexeme: "/" },
      { type: TokenType.Identifier, lexeme: "div" },
      { type: TokenType.GreaterThan, lexeme: ">" },
      { type: TokenType.EOF, lexeme: "" },
    ];
    expect(runLexer(source)).toEqual(expected);
  });

  it("should tokenize text content with a > character as a single text token", () => {
    const source = `<div>Is 5 > 3?</div>`;
    const expected = [
      { type: TokenType.LessThan, lexeme: "<" },
      { type: TokenType.Identifier, lexeme: "div" },
      { type: TokenType.GreaterThan, lexeme: ">" },
      { type: TokenType.Text, lexeme: "Is 5 > 3?" },
      { type: TokenType.LessThan, lexeme: "<" },
      { type: TokenType.Slash, lexeme: "/" },
      { type: TokenType.Identifier, lexeme: "div" },
      { type: TokenType.GreaterThan, lexeme: ">" },
      { type: TokenType.EOF, lexeme: "" },
    ];
    expect(runLexer(source)).toEqual(expected);
  });
});
