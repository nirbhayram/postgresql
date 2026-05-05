import { SectionMarkup } from "./section-markup";

const html = `<div class="section-hero">
  <div class="section-num-big">18</div>
  <div class="section-tag">// performance</div>
  <div class="section-title">Table Partitioning</div>
  <p class="section-desc">Partitioning splits a large table into smaller physical sub-tables while presenting a single logical table to queries. PostgreSQL supports range, list, and hash partitioning declaratively since version 10.</p>
</div>

<h3 class="block-title">Range Partitioning</h3>
<p class="prose">Ideal for time-series data (logs, events, orders). Each partition holds rows for a specific date range. The planner prunes partitions the query doesn't need, scanning only relevant ones.</p>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm">-- Parent table — no data stored here, only partitions hold data</span>
<span class="kw">CREATE</span> <span class="kw">TABLE</span> events (
  id         <span class="fn">BIGINT</span> <span class="kw">GENERATED ALWAYS AS IDENTITY</span>,
  event_type <span class="fn">TEXT</span>,
  payload    <span class="fn">JSONB</span>,
  created_at <span class="fn">TIMESTAMPTZ</span> <span class="kw">DEFAULT</span> <span class="fn">NOW</span>()
) <span class="kw">PARTITION BY RANGE</span> (created_at);

<span class="cm">-- Child partitions</span>
<span class="kw">CREATE</span> <span class="kw">TABLE</span> events_2024 <span class="kw">PARTITION OF</span> events
  <span class="kw">FOR VALUES FROM</span> (<span class="str">'2024-01-01'</span>) <span class="kw">TO</span> (<span class="str">'2025-01-01'</span>);

<span class="kw">CREATE</span> <span class="kw">TABLE</span> events_2025 <span class="kw">PARTITION OF</span> events
  <span class="kw">FOR VALUES FROM</span> (<span class="str">'2025-01-01'</span>) <span class="kw">TO</span> (<span class="str">'2026-01-01'</span>);

<span class="cm">-- Default partition catches rows that don't fit any range</span>
<span class="kw">CREATE</span> <span class="kw">TABLE</span> events_default <span class="kw">PARTITION OF</span> events <span class="kw">DEFAULT</span>;

<span class="cm">-- INSERTs are routed automatically</span>
<span class="kw">INSERT INTO</span> events (event_type, created_at)
<span class="kw">VALUES</span> (<span class="str">'login'</span>, <span class="str">'2025-06-15'</span>);  <span class="cm">-- goes to events_2025</span>

<span class="cm">-- Query touches only events_2025 (partition pruning)</span>
<span class="kw">EXPLAIN SELECT</span> * <span class="kw">FROM</span> events
<span class="kw">WHERE</span> created_at >= <span class="str">'2025-01-01'</span> <span class="kw">AND</span> created_at < <span class="str">'2026-01-01'</span>;</pre>
</div>

<h3 class="block-title">List Partitioning</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="kw">CREATE</span> <span class="kw">TABLE</span> orders (
  id      <span class="fn">BIGINT</span> <span class="kw">GENERATED ALWAYS AS IDENTITY</span>,
  region  <span class="fn">TEXT</span>,
  amount  <span class="fn">NUMERIC</span>
) <span class="kw">PARTITION BY LIST</span> (region);

<span class="kw">CREATE</span> <span class="kw">TABLE</span> orders_india  <span class="kw">PARTITION OF</span> orders <span class="kw">FOR VALUES IN</span> (<span class="str">'IN'</span>);
<span class="kw">CREATE</span> <span class="kw">TABLE</span> orders_us     <span class="kw">PARTITION OF</span> orders <span class="kw">FOR VALUES IN</span> (<span class="str">'US'</span>);
<span class="kw">CREATE</span> <span class="kw">TABLE</span> orders_europe <span class="kw">PARTITION OF</span> orders <span class="kw">FOR VALUES IN</span> (<span class="str">'DE'</span>, <span class="str">'FR'</span>, <span class="str">'GB'</span>);
<span class="kw">CREATE</span> <span class="kw">TABLE</span> orders_other  <span class="kw">PARTITION OF</span> orders <span class="kw">DEFAULT</span>;</pre>
</div>

<h3 class="block-title">Hash Partitioning</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm">-- Distribute rows evenly across 4 partitions by user_id hash</span>
<span class="kw">CREATE</span> <span class="kw">TABLE</span> user_activity (
  user_id    <span class="fn">INT</span>,
  action     <span class="fn">TEXT</span>,
  created_at <span class="fn">TIMESTAMPTZ</span>
) <span class="kw">PARTITION BY HASH</span> (user_id);

<span class="kw">CREATE</span> <span class="kw">TABLE</span> user_activity_0 <span class="kw">PARTITION OF</span> user_activity
  <span class="kw">FOR VALUES WITH</span> (MODULUS <span class="num">4</span>, REMAINDER <span class="num">0</span>);
<span class="kw">CREATE</span> <span class="kw">TABLE</span> user_activity_1 <span class="kw">PARTITION OF</span> user_activity
  <span class="kw">FOR VALUES WITH</span> (MODULUS <span class="num">4</span>, REMAINDER <span class="num">1</span>);
<span class="cm">-- ... _2, _3</span></pre>
</div>

<div class="adv-box">
  <div class="adv-header"><span class="adv-icon">⚡</span><span class="adv-label">Advanced — Attaching & Detaching Partitions</span><span class="adv-badge">PATTERN</span></div>
  <div class="adv-body">
    <p class="prose">One of the biggest benefits of partitioning: dropping old data is instant. Detaching a partition is a metadata operation — no rows are moved or deleted.</p>
    <div class="code-block">
      <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
      <pre class="code"><span class="cm">-- Detach a partition (table still exists, just not part of the partitioned table)</span>
<span class="kw">ALTER TABLE</span> events <span class="kw">DETACH PARTITION</span> events_2024;

<span class="cm">-- Drop the old partition instantly (no row-by-row DELETE)</span>
<span class="kw">DROP TABLE</span> events_2024;

<span class="cm">-- Attach an existing table as a new partition</span>
<span class="kw">ALTER TABLE</span> events <span class="kw">ATTACH PARTITION</span> events_2026
  <span class="kw">FOR VALUES FROM</span> (<span class="str">'2026-01-01'</span>) <span class="kw">TO</span> (<span class="str">'2027-01-01'</span>);

<span class="cm">-- Indexes on the parent are NOT auto-inherited — create on each partition</span>
<span class="kw">CREATE INDEX</span> <span class="kw">ON</span> events_2025 (event_type);</pre>
    </div>
  </div>
</div>`;

export default function Section17() {
  return <SectionMarkup html={html} />;
}
