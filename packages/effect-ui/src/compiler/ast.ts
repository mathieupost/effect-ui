export type ASTNode = ElementNode | TextNode | ExpressionNode;

export interface ElementNode {
  type: "Element";
  tagName: string;
  attributes: AttributeNode[];
  children: ASTNode[];
}

export type AttributeNode = NormalAttribute | SpreadAttribute;

export interface NormalAttribute {
  type: "Attribute";
  name: string;
  value: StringLiteral | ExpressionNode;
}

export interface SpreadAttribute {
  type: "SpreadAttribute";
  expression: ExpressionNode;
}

export interface StringLiteral {
  type: "StringLiteral";
  value: string;
}

export interface TextNode {
  type: "Text";
  content: string;
}

export interface ExpressionNode {
  type: "Expression";
  content: string;
}
