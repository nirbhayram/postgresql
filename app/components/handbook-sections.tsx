export type { HandbookSection } from "./sections/section-markup";

import type { HandbookSection } from "./sections/section-markup";
import Section0 from "./sections/section-00-installing-postgresql";
import Section1 from "./sections/section-01-databases-and-tables";
import Section2 from "./sections/section-02-working-with-tables";
import Section3 from "./sections/section-03-inserting-data";
import Section4 from "./sections/section-04-querying-data";
import Section5 from "./sections/section-05-update-and-delete";
import Section6 from "./sections/section-06-constraints";
import Section7 from "./sections/section-07-sql-functions";
import Section8 from "./sections/section-08-transactions";
import Section9 from "./sections/section-09-primary-and-foreign-keys";
import Section10 from "./sections/section-10-joins";
import Section11 from "./sections/section-11-views-union-indexes";
import Section12 from "./sections/section-12-subqueries-ctes-groupby";
import Section13 from "./sections/section-13-stored-procedures-triggers";
import Section14 from "./sections/section-14-explain-query-planning";
import Section15 from "./sections/section-15-performance-tuning";

export const HANDBOOK_SECTIONS: HandbookSection[] = [
  { id: 0,  key: "sec0",  Component: Section0  },
  { id: 1,  key: "sec1",  Component: Section1  },
  { id: 2,  key: "sec2",  Component: Section2  },
  { id: 3,  key: "sec3",  Component: Section3  },
  { id: 4,  key: "sec4",  Component: Section4  },
  { id: 5,  key: "sec5",  Component: Section5  },
  { id: 6,  key: "sec6",  Component: Section6  },
  { id: 7,  key: "sec7",  Component: Section7  },
  { id: 8,  key: "sec8",  Component: Section8  },
  { id: 9,  key: "sec9",  Component: Section9  },
  { id: 10, key: "sec10", Component: Section10 },
  { id: 11, key: "sec11", Component: Section11 },
  { id: 12, key: "sec12", Component: Section12 },
  { id: 13, key: "sec13", Component: Section13 },
  { id: 14, key: "sec14", Component: Section14 },
  { id: 15, key: "sec15", Component: Section15 },
];
