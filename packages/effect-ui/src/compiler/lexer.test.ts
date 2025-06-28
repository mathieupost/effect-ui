import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { scanTokens } from "./lexer";
import { TokenType } from "./token";

describe("Lexer", () => {
  it("should tokenize single-character tokens", () => {
    const source = "<>/={}";
    const expectedTokens = [
      { type: TokenType.LessThan, lexeme: "<" },
      { type: TokenType.GreaterThan, lexeme: ">" },
      { type: TokenType.Slash, lexeme: "/" },
      { type: TokenType.Equals, lexeme: "=" },
      { type: TokenType.OpenBrace, lexeme: "{" },
      { type: TokenType.CloseBrace, lexeme: "}" },
      { type: TokenType.EOF, lexeme: "" },
    ];

    const program = scanTokens(source);
    const result = Effect.runSync(program);

    // We only check the type and lexeme for simplicity
    const simplifiedResult = result.map(({ type, lexeme }) => ({
      type,
      lexeme,
    }));

    expect(simplifiedResult).toEqual(expectedTokens);
  });

  it("should tokenize an identifier", () => {
    const source = "my_identifier";
    const expectedTokens = [
      { type: TokenType.Identifier, lexeme: "my_identifier" },
      { type: TokenType.EOF, lexeme: "" },
    ];

    const program = scanTokens(source);
    const result = Effect.runSync(program);
    const simplifiedResult = result.map(({ type, lexeme }) => ({
      type,
      lexeme,
    }));

    expect(simplifiedResult).toEqual(expectedTokens);
  });

  it("should tokenize a string literal", () => {
    const source = `"hello world"`;
    const expectedTokens = [
      { type: TokenType.String, lexeme: `"hello world"` },
      { type: TokenType.EOF, lexeme: "" },
    ];

    const program = scanTokens(source);
    const result = Effect.runSync(program);
    const simplifiedResult = result.map(({ type, lexeme }) => ({
      type,
      lexeme,
    }));

    expect(simplifiedResult).toEqual(expectedTokens);
  });
});
