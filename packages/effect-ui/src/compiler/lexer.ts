import { Effect, Ref } from "effect";
import { Token, TokenType } from "./token";

// --- Error Types ---
export class UnexpectedCharacterError {
  readonly _tag = "UnexpectedCharacterError";
  constructor(
    readonly line: number,
    readonly col: number,
    readonly char: string
  ) {}
}

export type LexerError = UnexpectedCharacterError;

// --- Lexer State ---
interface LexerState {
  readonly source: string;
  readonly tokens: readonly Token[];
  readonly start: number;
  readonly current: number;
  readonly line: number;
  readonly col: number;
  readonly mode: "tag" | "content";
}

const makeLexerState = (source: string): LexerState => ({
  source,
  tokens: [],
  start: 0,
  current: 0,
  line: 1,
  col: 1,
  mode: "content",
});

// --- Main Public API ---
export const lex = (
  source: string
): Effect.Effect<readonly Token[], LexerError> =>
  Effect.gen(function* (_) {
    const stateRef = yield* _(Ref.make(makeLexerState(source)));

    const loop: Effect.Effect<void, LexerError> = Effect.gen(function* (_) {
      const state = yield* _(Ref.get(stateRef));
      if (isAtEnd(state)) {
        return;
      }

      yield* _(Ref.update(stateRef, (s) => ({ ...s, start: s.current })));
      yield* _(scanToken(stateRef));
      yield* _(loop);
    });

    yield* _(loop);

    const finalState = yield* _(Ref.get(stateRef));
    const eofToken: Token = {
      type: TokenType.EOF,
      lexeme: "",
      line: finalState.line,
      col: finalState.col,
    };

    return [...finalState.tokens, eofToken] as const;
  });

// --- Private Helpers ---

const scanToken = (
  stateRef: Ref.Ref<LexerState>
): Effect.Effect<void, LexerError> =>
  Effect.gen(function* (_) {
    const state = yield* _(Ref.get(stateRef));

    if (state.mode === "content") {
      // If we are at a delimiter, switch back to tag mode and let the next
      // pass handle the delimiter token. Don't consume anything.
      const peeked = peek(state);
      if (isAtEnd(state) || peeked === "<" || peeked === "{") {
        yield* _(Ref.update(stateRef, (s) => ({ ...s, mode: "tag" as const })));
        return;
      }

      // We have text content. Consume characters until we hit the next delimiter.
      yield* _(
        advanceWhile(
          stateRef,
          (s) => !isAtEnd(s) && peek(s) !== "<" && peek(s) !== "{"
        )
      );

      // Create a single token for the entire text block.
      const afterState = yield* _(Ref.get(stateRef));
      const textContent = afterState.source.substring(
        afterState.start,
        afterState.current
      );

      if (textContent.length > 0) {
        return yield* _(addToken(stateRef)(TokenType.Text, textContent));
      }
      return;
    }

    // --- Tag Mode ---
    const char = yield* _(advance(stateRef));
    const _addToken = addToken(stateRef);

    switch (char) {
      case "<":
        return yield* _(_addToken(TokenType.LessThan));
      case ">": {
        // After a '>', we switch to content mode to handle text nodes.
        yield* _(
          Ref.update(stateRef, (s) => ({ ...s, mode: "content" as const }))
        );
        return yield* _(_addToken(TokenType.GreaterThan));
      }
      case "/":
        return yield* _(_addToken(TokenType.Slash));
      case "=":
        return yield* _(_addToken(TokenType.Equals));
      case "{":
        return yield* _(_addToken(TokenType.OpenBrace));
      case "}":
        return yield* _(_addToken(TokenType.CloseBrace));
      case ".": {
        const isSpread = yield* _(match(stateRef, "."));
        if (isSpread) {
          const isReallySpread = yield* _(match(stateRef, "."));
          if (isReallySpread) {
            return yield* _(_addToken(TokenType.Spread));
          }
        }
        return yield* _(_addToken(TokenType.Dot));
      }

      case '"':
      case "'":
        return yield* _(string(stateRef, char));

      // Whitespace is only tokenized in tag mode.
      case " ":
      case "\r":
      case "\t":
      case "\n": {
        yield* _(advanceWhile(stateRef, (state) => isWhitespace(peek(state))));
        return yield* _(_addToken(TokenType.Whitespace));
      }

      default: {
        if (isAlpha(char)) {
          return yield* _(identifier(stateRef));
        }

        const currentState = yield* _(Ref.get(stateRef));
        return yield* _(
          Effect.fail(
            new UnexpectedCharacterError(
              currentState.line,
              currentState.col,
              char
            )
          )
        );
      }
    }
  });

const advance = (stateRef: Ref.Ref<LexerState>): Effect.Effect<string> =>
  Ref.modify(stateRef, (state) => {
    const char = state.source.charAt(state.current);
    const newCol = char === "\n" ? 1 : state.col + 1;
    const newLine = char === "\n" ? state.line + 1 : state.line;
    const newState: LexerState = {
      ...state,
      current: state.current + 1,
      line: newLine,
      col: newCol,
    };
    return [char, newState];
  });

const advanceWhile = (
  stateRef: Ref.Ref<LexerState>,
  condition: (state: LexerState) => boolean
): Effect.Effect<void> =>
  Effect.gen(function* (_) {
    const state = yield* _(Ref.get(stateRef));
    if (!condition(state)) {
      return;
    }
    yield* _(advance(stateRef));
    yield* _(advanceWhile(stateRef, condition));
  });

const match = (
  stateRef: Ref.Ref<LexerState>,
  expected: string
): Effect.Effect<boolean> =>
  Effect.gen(function* (_) {
    const state = yield* _(Ref.get(stateRef));
    if (isAtEnd(state) || state.source.charAt(state.current) !== expected) {
      return false;
    }
    yield* _(advance(stateRef));
    return true;
  });

const addToken =
  (stateRef: Ref.Ref<LexerState>) =>
  (type: TokenType, literal?: string): Effect.Effect<void> =>
    Ref.update(stateRef, (state) => {
      const lexeme = state.source.substring(state.start, state.current);
      const token: Token = {
        type,
        lexeme,
        literal,
        line: state.line,
        col: state.col - lexeme.length,
      };
      return { ...state, tokens: [...state.tokens, token] };
    });

const string = (
  stateRef: Ref.Ref<LexerState>,
  quoteType: '"' | "'"
): Effect.Effect<void, LexerError> =>
  Effect.gen(function* (_) {
    yield* _(
      advanceWhile(
        stateRef,
        (state) => peek(state) !== quoteType && !isAtEnd(state)
      )
    );

    const state = yield* _(Ref.get(stateRef));
    if (isAtEnd(state)) {
      return yield* _(
        Effect.fail(new UnexpectedCharacterError(state.line, state.col, "EOF"))
      );
    }

    // The closing quote.
    yield* _(advance(stateRef));

    // Trim the surrounding quotes.
    const endState = yield* _(Ref.get(stateRef));
    const value = endState.source.substring(
      endState.start + 1,
      endState.current - 1
    );
    yield* _(addToken(stateRef)(TokenType.String, value));
  });

const identifier = (
  stateRef: Ref.Ref<LexerState>
): Effect.Effect<void, LexerError> =>
  Effect.gen(function* (_) {
    yield* _(advanceWhile(stateRef, (state) => isAlphaNumeric(peek(state))));
    yield* _(addToken(stateRef)(TokenType.Identifier));
  });

const isAtEnd = (state: LexerState): boolean =>
  state.current >= state.source.length;

const peek = (state: LexerState): string => {
  if (isAtEnd(state)) return "\0";
  return state.source.charAt(state.current);
};

const isAlpha = (char: string): boolean => {
  return (
    (char >= "a" && char <= "z") || (char >= "A" && char <= "Z") || char === "_"
  );
};

const isAlphaNumeric = (char: string): boolean => {
  return isAlpha(char) || (char >= "0" && char <= "9") || char === "-";
};

const isWhitespace = (char: string): boolean => {
  return char === " " || char === "\t" || char === "\r" || char === "\n";
};
