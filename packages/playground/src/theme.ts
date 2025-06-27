import { Context, Layer } from "effect";

export interface Theme {
  readonly color: string;
}

export class Theme extends Context.Tag("playground/Theme")<
  Theme,
  {
    readonly color: string;
  }
>() {}

export const DefaultTheme = Layer.succeed(Theme, Theme.of({ color: "blue" }));
