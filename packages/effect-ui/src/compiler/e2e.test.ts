import { Effect, Either } from "effect";
import { describe, expect, it } from "vitest";
import { lex } from "./lexer";
import { parse } from "./parser";
import { transpile } from "./transpiler";

describe("Compiler E2E", () => {
  const compile = (source: string) => {
    const program = Effect.gen(function* (_) {
      const tokens = yield* _(lex(source));
      const ast = yield* _(parse(tokens));
      const js = yield* _(transpile(ast));
      return js;
    });

    return Effect.runSync(Effect.either(program));
  };

  const expectSuccess = (result: Either.Either<string, any>): string => {
    if (Either.isLeft(result)) {
      console.error("Test failed with error:", result.left);
      expect.fail("Expected compilation to succeed, but it failed.");
    }
    return result.right;
  };

  it("should compile a simple div element", () => {
    const template = "<div></div>";
    const expectedJs = "h('div', {  }, [])";

    const result = compile(template);
    const transpiled = expectSuccess(result);
    expect(transpiled).toBe(expectedJs);
  });

  it("should compile a complex element with attributes and children", () => {
    const template = `<div class="container" id={id}>Hello {name}</div>`;
    const expectedJs = `h('div', { 'class': 'container', 'id': id }, ['Hello ', name])`;

    const result = compile(template);
    const transpiled = expectSuccess(result);
    expect(transpiled).toBe(expectedJs);
  });

  it("should compile a self-closing tag", () => {
    const template = "<div/>";
    const expectedJs = "h('div', {  }, [])";

    const result = compile(template);
    const transpiled = expectSuccess(result);
    expect(transpiled).toBe(expectedJs);
  });
});
