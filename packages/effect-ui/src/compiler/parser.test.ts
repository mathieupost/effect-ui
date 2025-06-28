import { Effect, Either } from "effect";
import { describe, expect, it } from "vitest";
import { lex } from "./lexer";
import { parse } from "./parser";

describe("Parser", () => {
  it("should parse a simple element", () => {
    const template = `<div></div>`;
    const program = Effect.gen(function* (_) {
      const tokens = yield* _(lex(template));
      const ast = yield* _(parse(tokens));
      return ast;
    });

    const result = Effect.runSync(Effect.either(program));

    expect(result._tag).toBe("Right");
    expect((result as Either.Right<unknown, unknown>).right).toEqual([
      {
        type: "Element",
        tagName: "div",
        attributes: [],
        children: [],
      },
    ]);
  });
});
