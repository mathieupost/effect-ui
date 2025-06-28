import { Effect } from "effect";
import { ASTNode } from "./ast";
import { Token, TokenType } from "./token";

export class ParserError {
  _tag = "ParserError";
  constructor(readonly message: string) {}
}

class Parser {
  constructor(private readonly tokens: readonly Token[]) {}

  private current = 0;

  parse(): Effect.Effect<ASTNode[], ParserError> {
    return Effect.try({
      try: () => {
        const nodes: ASTNode[] = [];
        while (!this.isAtEnd()) {
          const node = this.declaration();
          if (node) {
            nodes.push(node);
          }
        }
        return nodes;
      },
      catch: (unknown) => new ParserError((unknown as Error).message),
    });
  }

  private declaration(): ASTNode | null {
    if (this.match(TokenType.LessThan)) {
      return this.element();
    }
    // Other top-level nodes like text, comments, etc. will go here
    // For now, we'll just advance past other tokens
    this.advance();
    return null; // Temporary
  }

  private element(): ASTNode {
    const tagName = this.consume(TokenType.Identifier, "Expected tag name.");
    this.consume(TokenType.GreaterThan, "Expected '>' after tag name.");

    // For now, we'll assume no children and an immediate closing tag
    this.consume(TokenType.LessThan, "Expected '<' for closing tag.");
    this.consume(TokenType.Slash, "Expected '/' for closing tag.");
    this.consume(
      TokenType.Identifier,
      `Expected closing tag for '${tagName.lexeme}'.`
    );
    this.consume(TokenType.GreaterThan, "Expected '>' after closing tag name.");

    return {
      type: "Element",
      tagName: tagName.lexeme,
      attributes: [],
      children: [],
    };
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new ParserError(message);
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }
}

export const parse = (
  tokens: readonly Token[]
): Effect.Effect<ASTNode[], ParserError> => {
  const parser = new Parser(tokens);
  return parser.parse();
};
