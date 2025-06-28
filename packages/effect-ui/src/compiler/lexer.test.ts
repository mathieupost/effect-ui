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
});
