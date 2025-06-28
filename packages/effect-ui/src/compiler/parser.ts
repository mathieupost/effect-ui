import { Effect, Ref } from "effect";
import { ASTNode, AttributeNode, TextNode } from "./ast";
import { Token, TokenType } from "./token";

// --- Error Types ---
export class ParserError {
  readonly _tag = "ParserError";
  constructor(readonly message: string, readonly token?: Token) {}
}

// --- Parser State ---
interface ParserState {
  readonly tokens: readonly Token[];
  readonly current: number;
}

const makeParserState = (tokens: readonly Token[]): ParserState => ({
  tokens,
  current: 0,
});

// --- Main Public API ---
export const parse = (
  tokens: readonly Token[]
): Effect.Effect<ASTNode[], ParserError> =>
  Effect.gen(function* (_) {
    // We don't care about whitespace during parsing
    const stateRef = yield* _(
      Ref.make(
        makeParserState(tokens.filter((t) => t.type !== TokenType.Whitespace))
      )
    );

    const loop: (
      nodes: readonly ASTNode[]
    ) => Effect.Effect<readonly ASTNode[], ParserError> = (nodes) =>
      Effect.gen(function* (_) {
        const state = yield* _(Ref.get(stateRef));
        if (isAtEnd(state)) {
          return nodes;
        }

        const node = yield* _(declaration(stateRef));
        const newNodes = node ? [...nodes, node] : nodes;
        return yield* _(loop(newNodes));
      });

    const allNodes = yield* _(loop([]));
    return allNodes as ASTNode[];
  });

// --- Recursive Descent Helpers ---

const declaration = (
  stateRef: Ref.Ref<ParserState>
): Effect.Effect<ASTNode | null, ParserError> =>
  Effect.gen(function* (_) {
    const state = yield* _(Ref.get(stateRef));
    if (peek(state).type === TokenType.LessThan) {
      if (peekNext(state).type === TokenType.Slash) {
        return yield* _(
          Effect.fail(
            new ParserError("Unexpected closing tag.", peekNext(state))
          )
        );
      }
      return yield* _(element(stateRef));
    }

    if (peek(state).type === TokenType.Identifier) {
      return yield* _(text(stateRef));
    }

    // Other top-level nodes like comments, etc. will go here
    // For now, we'll just advance past other tokens
    yield* _(advance(stateRef));
    return null; // Temporary
  });

const text = (
  stateRef: Ref.Ref<ParserState>
): Effect.Effect<TextNode, ParserError> =>
  Effect.gen(function* (_) {
    const token = yield* _(
      consume(stateRef, TokenType.Identifier, "Expected text content.")
    );
    return {
      type: "Text",
      content: token.lexeme,
    };
  });

const element = (
  stateRef: Ref.Ref<ParserState>
): Effect.Effect<ASTNode, ParserError> =>
  Effect.gen(function* (_) {
    const _consume = (type: TokenType, message: string) =>
      consume(stateRef, type, message);

    // Opening tag
    yield* _(_consume(TokenType.LessThan, "Expected '<' to start an element."));
    const tagNameToken = yield* _(
      _consume(TokenType.Identifier, "Expected tag name.")
    );
    const tagName = tagNameToken.lexeme;

    const attributesLoop: (
      attrs: readonly AttributeNode[]
    ) => Effect.Effect<readonly AttributeNode[], ParserError> = (attrs) =>
      Effect.gen(function* (_) {
        const state = yield* _(Ref.get(stateRef));
        if (peek(state).type !== TokenType.Identifier) {
          return attrs;
        }

        const nameToken = yield* _(
          _consume(TokenType.Identifier, "Expected attribute name.")
        );
        yield* _(
          _consume(TokenType.Equals, "Expected '=' after attribute name.")
        );

        const stateAfterEquals = yield* _(Ref.get(stateRef));
        let attributeValue: AttributeNode["value"];

        if (peek(stateAfterEquals).type === TokenType.String) {
          const valueToken = yield* _(
            _consume(
              TokenType.String,
              "Expected string literal for attribute value."
            )
          );
          attributeValue = {
            type: "StringLiteral",
            value: valueToken.literal as string,
          };
        } else if (peek(stateAfterEquals).type === TokenType.OpenBrace) {
          yield* _(_consume(TokenType.OpenBrace, "Expected '{'."));
          const expressionToken = yield* _(
            _consume(TokenType.Identifier, "Expected expression.")
          );
          yield* _(_consume(TokenType.CloseBrace, "Expected '}'."));
          attributeValue = {
            type: "Expression",
            content: expressionToken.lexeme,
          };
        } else {
          return yield* _(
            Effect.fail(
              new ParserError(
                "Expected string literal or expression for attribute value.",
                peek(stateAfterEquals)
              )
            )
          );
        }

        const attribute: AttributeNode = {
          type: "Attribute",
          name: nameToken.lexeme,
          value: attributeValue,
        };

        const newAttrs = [...attrs, attribute];
        return yield* _(attributesLoop(newAttrs));
      });

    const attributes = yield* _(attributesLoop([]));

    yield* _(_consume(TokenType.GreaterThan, "Expected '>' after tag name."));

    const childrenLoop: (
      nodes: readonly ASTNode[]
    ) => Effect.Effect<readonly ASTNode[], ParserError> = (nodes) =>
      Effect.gen(function* (_) {
        const state = yield* _(Ref.get(stateRef));

        if (
          peek(state).type === TokenType.LessThan &&
          peekNext(state).type === TokenType.Slash
        ) {
          return nodes;
        }

        if (isAtEnd(state)) {
          return yield* _(
            Effect.fail(
              new ParserError(`Unclosed tag '${tagName}'.`, tagNameToken)
            )
          );
        }

        const child = yield* _(declaration(stateRef));
        const newNodes = child ? [...nodes, child] : nodes;
        return yield* _(childrenLoop(newNodes));
      });

    const children = yield* _(childrenLoop([]));

    // Closing tag
    yield* _(
      _consume(TokenType.LessThan, `Expected closing tag for '${tagName}'.`)
    );
    yield* _(_consume(TokenType.Slash, "Expected '/' for closing tag."));
    const closingTagToken = yield* _(
      _consume(TokenType.Identifier, `Expected closing tag name '${tagName}'.`)
    );

    if (tagName !== closingTagToken.lexeme) {
      return yield* _(
        Effect.fail(
          new ParserError(
            `Mismatched closing tag. Expected '${tagName}' but got '${closingTagToken.lexeme}'.`,
            closingTagToken
          )
        )
      );
    }

    yield* _(
      _consume(TokenType.GreaterThan, "Expected '>' after closing tag name.")
    );

    return {
      type: "Element",
      tagName: tagName,
      attributes: attributes as AttributeNode[],
      children: children as ASTNode[],
    };
  });

// --- State & Token Helpers ---

const consume = (
  stateRef: Ref.Ref<ParserState>,
  type: TokenType,
  message: string
): Effect.Effect<Token, ParserError> =>
  Effect.gen(function* (_) {
    const state = yield* _(Ref.get(stateRef));
    return yield* _(
      Effect.if(check(state, type), {
        onTrue: () => advance(stateRef),
        onFalse: () => {
          const token = peek(state);
          return Effect.fail(
            new ParserError(`${message} Got ${token.type} instead.`, token)
          );
        },
      })
    );
  });

const check = (state: ParserState, type: TokenType): boolean => {
  if (isAtEnd(state)) return false;
  return peek(state).type === type;
};

const isAtEnd = (state: ParserState): boolean => {
  return peek(state).type === TokenType.EOF;
};

const peek = (state: ParserState): Token => {
  return state.tokens[state.current];
};

const peekNext = (state: ParserState): Token => {
  if (state.current + 1 >= state.tokens.length) {
    // Return EOF if we are at the end
    return state.tokens[state.tokens.length - 1];
  }
  return state.tokens[state.current + 1];
};

const advance = (stateRef: Ref.Ref<ParserState>): Effect.Effect<Token> =>
  Ref.modify(stateRef, (state) => {
    const consumedToken = peek(state);
    const nextState: ParserState = isAtEnd(state)
      ? state
      : { ...state, current: state.current + 1 };
    return [consumedToken, nextState];
  });
