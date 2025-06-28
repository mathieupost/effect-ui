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
}

const makeLexerState = (source: string): LexerState => ({
  source,
  tokens: [],
  start: 0,
  current: 0,
  line: 1,
  col: 1,
});

// --- Main Public API ---
export const scanTokens = (
  source: string
): Effect.Effect<readonly Token[], LexerError> =>
  Effect.gen(function* (_) {
    const stateRef = yield* _(Ref.make(makeLexerState(source)));

    const loop: Effect.Effect<void, LexerError> = Effect.gen(function* (_) {
      const state = yield* _(Ref.get(stateRef));
      if (state.current >= state.source.length) {
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
      literal: null,
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
    const char = yield* _(advance(stateRef));

    const _addToken = addToken(stateRef);

    switch (char) {
      case "<":
        return yield* _(_addToken(TokenType.LessThan));
      case ">":
        return yield* _(_addToken(TokenType.GreaterThan));
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

      // Ignore whitespace
      case " ":
      case "\r":
      case "\t":
        return;

      case "\n":
        return; // advance already handles line/col adjustment

      default: {
        const state = yield* _(Ref.get(stateRef));
        return yield* _(
          Effect.fail(new UnexpectedCharacterError(state.line, state.col, char))
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

const match = (
  stateRef: Ref.Ref<LexerState>,
  expected: string
): Effect.Effect<boolean> =>
  Effect.gen(function* (_) {
    const state = yield* _(Ref.get(stateRef));
    if (state.current >= state.source.length) {
      return false;
    }
    if (state.source.charAt(state.current) !== expected) {
      return false;
    }

    yield* _(Ref.update(stateRef, (s) => ({ ...s, current: s.current + 1 })));
    return true;
  });

const addToken =
  (stateRef: Ref.Ref<LexerState>) =>
  (type: TokenType, literal: any = null): Effect.Effect<void> =>
    Ref.update(stateRef, (state) => {
      const lexeme = state.source.substring(state.start, state.current);
      const token: Token = {
        type,
        lexeme,
        literal,
        line: state.line,
        col: state.col - lexeme.length + 1,
      };
      return { ...state, tokens: [...state.tokens, token] };
    });
