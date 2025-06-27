export enum TokenType {
  // Single-character tokens
  LessThan, // <
  GreaterThan, // >
  Slash, // /
  Equals, // =
  OpenBrace, // {
  CloseBrace, // }

  // Literals
  Identifier,
  String,
  Text,

  // Keywords / Multi-character
  Dot, // .
  Spread, // ...

  // End of file
  EOF,
}

export interface Token {
  type: TokenType;
  lexeme: string;
  literal: any;
  line: number;
  col: number;
}
