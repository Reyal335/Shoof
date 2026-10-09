"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

const ComingSoonContext = createContext(false);

/** True inside a "Coming soon" row: the row's control renders dimmed and out of the Tab order. */
export function useComingSoon() {
  return useContext(ComingSoonContext);
}

type Props = {
  title: string;
  /** Id of a labelable control (input, select, switch button): the title becomes its <label htmlFor>. */
  htmlFor?: string;
  /** Id for the title, for controls that point at it with aria-labelledby (tab lists, radio and chip groups). */
  titleId?: string;
  /** Render the title as a plain span, for controls that carry their own label (the collaborate checkbox, chips). */
  plainTitle?: boolean;
  description: string;
  descriptionId: string;
  comingSoon?: boolean;
  /** Stack the control under the text instead of beside it. */
  stacked?: boolean;
  /** Shown across from the text in a stacked row, like the chip count. */
  aside?: ReactNode;
  children: ReactNode;
};

/** One settings row: title and one-line description on the left, the control on the right (below on narrow screens). */
export function SettingRow({ title, htmlFor, titleId, plainTitle, description, descriptionId, comingSoon = false, stacked, aside, children }: Props) {
  const titleEl = plainTitle ? (
    <span className="lbl" id={titleId}>{title}</span>
  ) : (
    <label className="lbl" id={titleId} htmlFor={htmlFor}>{title}</label>
  );
  const text = (
    <div className="rtext">
      {comingSoon ? (
        <div className="rtitle">
          {titleEl}
          <span className="soon">Coming soon</span>
        </div>
      ) : (
        titleEl
      )}
      <span className="desc" id={descriptionId}>{description}</span>
    </div>
  );

  return (
    <div className={stacked ? "row col" : "row"}>
      {aside ? (
        <div className="rhead">
          {text}
          {aside}
        </div>
      ) : (
        text
      )}
      <ComingSoonContext.Provider value={comingSoon}>{children}</ComingSoonContext.Provider>
    </div>
  );
}
