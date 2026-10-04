import type { JSX } from "react";

/** A literal card element written out in a page's JSX (an <article>, or a row <div>). */
export type Card = JSX.Element;

/** Reads one of a card's data-* attributes, like `element.dataset[name]` in the design scripts. */
export function dataOf(card: Card, name: string): string {
  return card.props[`data-${name}`];
}
