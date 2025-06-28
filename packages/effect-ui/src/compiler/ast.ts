export type Location = {
  start: { line: number; column: number };
  end: { line: number; column: number };
};

export type ASTNode = ElementNode | TextNode | ExpressionNode; // | CommentNode etc.

export type ElementNode = {
  type: "Element";
  tagName: string;
  attributes: readonly AttributeNode[];
  children: readonly ASTNode[];
  location: Location;
};

export interface AttributeNode {
  readonly type: "Attribute";
  readonly name: string;
  readonly value: StringLiteral | ExpressionNode;
}

export interface StringLiteral {
  readonly type: "StringLiteral";
  readonly value: string;
  readonly location: Location;
}

export type TextNode = {
  type: "Text";
  content: string;
  location: Location;
};

export interface ExpressionNode {
  readonly type: "Expression";
  readonly content: string;
  readonly location: Location;
}
