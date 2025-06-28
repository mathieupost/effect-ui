import { Effect } from "effect";
import { ASTNode, AttributeNode, ElementNode, TextNode } from "./ast";

export class TranspilerError {
  readonly _tag = "TranspilerError";
  constructor(readonly message: string) {}
}

export const transpile = (
  nodes: readonly ASTNode[]
): Effect.Effect<string, TranspilerError> =>
  Effect.gen(function* (_) {
    const transpiledNodes = yield* _(Effect.all(nodes.map(transpileNode)));
    return transpiledNodes.join("\n");
  });

const transpileNode = (
  node: ASTNode
): Effect.Effect<string, TranspilerError> => {
  switch (node.type) {
    case "Element":
      return transpileElement(node);
    case "Text":
      return transpileText(node);
    default:
      return Effect.succeed("");
  }
};

const transpileElement = (
  node: ElementNode
): Effect.Effect<string, TranspilerError> =>
  Effect.gen(function* (_) {
    const tagName = `'${node.tagName}'`;
    const attributes = yield* _(transpileAttributes(node.attributes));
    const childrenResult = yield* _(
      Effect.all(node.children.map(transpileNode))
    );
    const children = `[${childrenResult.join(", ")}]`;

    return `h(${tagName}, ${attributes}, ${children})`;
  });

const transpileText = (
  node: TextNode
): Effect.Effect<string, TranspilerError> => {
  return Effect.succeed(`'${node.content}'`);
};

const transpileAttributes = (
  attrs: readonly AttributeNode[]
): Effect.Effect<string, TranspilerError> =>
  Effect.gen(function* (_) {
    const propsEffect = attrs.map((attr) => {
      const key = `'${attr.name}'`;
      let value: Effect.Effect<string, TranspilerError>;

      switch (attr.value.type) {
        case "StringLiteral":
          value = Effect.succeed(`'${attr.value.value}'`);
          break;
        case "Expression":
          value = Effect.succeed(attr.value.content);
          break;
        default:
          value = Effect.succeed("''");
          break;
      }
      return value.pipe(Effect.map((v) => `${key}: ${v}`));
    });

    const props = yield* _(Effect.all(propsEffect));
    return `{ ${props.join(", ")} }`;
  });
