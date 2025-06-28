export enum TokenType {
  // Single-character tokens
  LessThan = "LessThan", // <
  GreaterThan = "GreaterThan", // >
  Slash = "Slash", // /
  Equals = "Equals", // =
  OpenBrace = "OpenBrace", // {
  CloseBrace = "CloseBrace", // }

  // Literals
  Identifier = "Identifier",
  String = "String",
  Text = "Text",
  Whitespace = "Whitespace",

  // Keywords / Multi-character
  Dot = "Dot", // .
  Spread = "Spread", // ...

  // End of file
  EOF = "EOF",
}

export interface Token {
  type: TokenType;
  lexeme: string;
  literal?: string;
  line: number;
  col: number;
}
