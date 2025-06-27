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

    // For now, let's just log the character and move on.
    console.log(`Scanning character: ${char}`);
  }

  private advance(): string {
    this.current++;
    this.col++;
    return this.source.charAt(this.current - 1);
  }
}
