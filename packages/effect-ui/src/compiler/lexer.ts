import { Token, TokenType } from "./token";

export class Lexer {
  private readonly source: string;
  private tokens: Token[] = [];

  private start = 0;
  private current = 0;
  private line = 1;
  private col = 1;

  constructor(source: string) {
    this.source = source;
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push({
      type: TokenType.EOF,
      lexeme: "",
      literal: null,
      line: this.line,
      col: this.col,
    });
    return this.tokens;
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private scanToken(): void {
    // This is where the magic will happen.
    // We'll implement this in the next steps.
    const char = this.advance();

    switch (char) {
      case "<":
        this.addToken(TokenType.LessThan);
        break;
      case ">":
        this.addToken(TokenType.GreaterThan);
        break;

      case "/":
        this.addToken(TokenType.Slash);
        break;
      case "=":
        this.addToken(TokenType.Equals);
        break;
      case "{":
        this.addToken(TokenType.OpenBrace);
        break;
      case "}":
        this.addToken(TokenType.CloseBrace);
        break;
      case ".":
        if (this.match(".") && this.match(".")) {
          this.addToken(TokenType.Spread);
        } else {
          this.addToken(TokenType.Dot);
        }
        break;

      // Ignore whitespace
      case " ":
      case "\r":
      case "\t":
        break;

      case "\n":
        this.line++;
        this.col = 1;
        break;

      default:
        // For now, we'll just log an error for unrecognized characters.
        // We will handle text nodes, identifiers, and strings later.
        console.error(
          `[Line ${this.line}] Error: Unexpected character: ${char}`
        );
        break;
    }
  }

  private advance(): string {
    this.current++;
    this.col++;
    return this.source.charAt(this.current - 1);
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) !== expected) return false;

    this.current++;
    this.col++;
    return true;
  }

  private addToken(type: TokenType, literal: any = null): void {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push({
      type,
      lexeme: text,
      literal,
      line: this.line,
      col: this.col - text.length + 1, // beginning of the token
    });
  }
}
