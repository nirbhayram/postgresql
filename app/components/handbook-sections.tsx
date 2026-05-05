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
import Section16 from "./sections/section-16-locking-concurrency";
import Section17 from "./sections/section-17-table-partitioning";
import Section18 from "./sections/section-18-jsonb-operators";
import Section19 from "./sections/section-19-full-text-search";
import Section20 from "./sections/section-20-advanced-data-types";
import Section21 from "./sections/section-21-extensions";
import Section22 from "./sections/section-22-schemas-permissions";
import Section23 from "./sections/section-23-error-handling-plpgsql";
import Section24 from "./sections/section-24-backups-restore";
import Section25 from "./sections/section-25-replication";
import Section26 from "./sections/section-26-monitoring-maintenance";

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
  { id: 16, key: "sec16", Component: Section16 },
  { id: 17, key: "sec17", Component: Section17 },
  { id: 18, key: "sec18", Component: Section18 },
  { id: 19, key: "sec19", Component: Section19 },
  { id: 20, key: "sec20", Component: Section20 },
  { id: 21, key: "sec21", Component: Section21 },
  { id: 22, key: "sec22", Component: Section22 },
  { id: 23, key: "sec23", Component: Section23 },
  { id: 24, key: "sec24", Component: Section24 },
  { id: 25, key: "sec25", Component: Section25 },
  { id: 26, key: "sec26", Component: Section26 },
];
