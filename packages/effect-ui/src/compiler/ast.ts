export type ASTNode = ElementNode; // | TextNode | CommentNode etc.

export interface ElementNode {
  readonly type: "Element";
  readonly tagName: string;
  readonly attributes: readonly AttributeNode[];
  readonly children: readonly ASTNode[];
}

export interface AttributeNode {
  readonly type: "Attribute";
  readonly name: string;
  readonly value: StringLiteral | ExpressionNode;
}

export interface StringLiteral {
  readonly type: "StringLiteral";
  readonly value: string;
}

export interface TextNode {
  readonly type: "Text";
  readonly content: string;
}

export interface ExpressionNode {
  readonly type: "Expression";
  readonly content: string;
}
