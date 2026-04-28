import type { ReactElement } from "react";

export type HandbookSection = { id: number; key: string; Component: () => ReactElement };

export function SectionMarkup({ html }: { html: string }) {
  return <article className="handbook-content" dangerouslySetInnerHTML={{ __html: html }} />;
}
