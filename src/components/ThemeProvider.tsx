/** @jsxImportSource ../core */
import { VNode } from "@/core/jsx-runtime";
import { Context, Effect } from "effect";

// Define a Theme service
export interface Theme {
  primaryColor: string;
  backgroundColor: string;
}

export const Theme = Context.GenericTag<Theme>("Theme");

// Component that provides the theme
export const ThemeProvider = ({
  child,
  theme,
}: {
  child: Effect.Effect<VNode, any, any>;
  theme: Theme;
}) => Effect.provideService(child, Theme, theme);
