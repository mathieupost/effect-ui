import { ASTNode, AttributeNode, ElementNode, TextNode } from "./ast";

export const transpile = (nodes: readonly ASTNode[]): string => {
  return nodes.map(transpileNode).join("\n");
};

const transpileNode = (node: ASTNode): string => {
  switch (node.type) {
    case "Element":
      return transpileElement(node);
    case "Text":
      return transpileText(node);
    default:
      // A safe default for unhandled node types
      return "";
  }
};

const transpileElement = (node: ElementNode): string => {
  // We'll use a hypothetical 'h' function (hyperscript-like) for now
  // h(tagName, attributes, children)
  const tagName = `'${node.tagName}'`;
  const attributes = transpileAttributes(node.attributes);
  const children = `[${node.children.map(transpileNode).join(", ")}]`;

  return `h(${tagName}, ${attributes}, ${children})`;
};

const transpileText = (node: TextNode): string => {
  return `'${node.content}'`;
};

const transpileAttributes = (attrs: readonly AttributeNode[]): string => {
  const props = attrs.map((attr) => {
    const key = `'${attr.name}'`;
    let value: string;

    switch (attr.value.type) {
      case "StringLiteral":
        value = `'${attr.value.value}'`;
        break;
      case "Expression":
        value = attr.value.content;
        break;
      default:
        // Handle potential new attribute value types safely
        value = "''";
        break;
    }
    return `${key}: ${value}`;
  });

  return `{ ${props.join(", ")} }`;
};
