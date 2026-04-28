import { SectionMarkup } from "./section-markup";

const html = `<div class="section-hero">
  <div class="section-num-big">15</div>
  <div class="section-tag">// performance</div>
  <div class="section-title">EXPLAIN & Query Planning</div>
  <p class="section-desc">EXPLAIN reveals how PostgreSQL executes a query — which indexes it uses, how it joins tables, and where the cost lies. Reading query plans is the most important skill for optimizing slow queries.</p>
</div>

<h3 class="block-title">EXPLAIN vs EXPLAIN ANALYZE</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm">-- EXPLAIN: estimates cost without running the query</span>
<span class="kw">EXPLAIN SELECT</span> * <span class="kw">FROM</span> users <span class="kw">WHERE</span> email = <span class="str">'alice@ex.com'</span>;

<span class="cm">-- EXPLAIN ANALYZE: actually runs the query, shows real timings</span>
<span class="kw">EXPLAIN ANALYZE SELECT</span> * <span class="kw">FROM</span> users <span class="kw">WHERE</span> email = <span class="str">'alice@ex.com'</span>;

<span class="cm">-- Most detailed: includes buffer cache hits/misses</span>
<span class="kw">EXPLAIN</span> (ANALYZE, BUFFERS, FORMAT TEXT)
<span class="kw">SELECT</span> * <span class="kw">FROM</span> users <span class="kw">WHERE</span> salary > <span class="num">70000</span>;</pre>
</div>

<div class="info-warn info-box"><span class="icon">⚠️</span><span><code>EXPLAIN ANALYZE</code> actually executes the query — including writes. Wrap in <code>BEGIN; ... ROLLBACK;</code> if analyzing a destructive statement.</span></div>

<h3 class="block-title">Reading a Query Plan</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">PLAN OUTPUT</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm">-- Example output for: EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'a@b.com'</span>

Index Scan using users_email_key on users
      (cost=<span class="num">0.29</span>..<span class="num">8.31</span> rows=<span class="num">1</span> width=<span class="num">72</span>)
      (actual time=<span class="num">0.041</span>..<span class="num">0.043</span> rows=<span class="num">1</span> loops=<span class="num">1</span>)
  Index Cond: (email = <span class="str">'a@b.com'</span>)
Planning Time: <span class="num">0.2</span> ms
Execution Time: <span class="num">0.1</span> ms</pre>
</div>

<table class="data-table">
  <tr><th>Field</th><th>Meaning</th></tr>
  <tr><td><code>cost=0.29..8.31</code></td><td>Estimated cost: startup cost .. total cost (arbitrary units)</td></tr>
  <tr><td><code>rows=1</code></td><td>Estimated number of rows returned</td></tr>
  <tr><td><code>actual time=0.041..0.043</code></td><td>Real time in ms: first row .. last row</td></tr>
  <tr><td><code>loops=1</code></td><td>How many times this node was executed (multiply actual time × loops)</td></tr>
  <tr><td><code>width=72</code></td><td>Estimated average row size in bytes</td></tr>
</table>

<h3 class="block-title">Common Node Types</h3>
<table class="data-table">
  <tr><th>Node</th><th>What it means</th><th>Good or bad?</th></tr>
  <tr><td><code>Seq Scan</code></td><td>Full table scan — reads every row</td><td>Bad on large tables with filters</td></tr>
  <tr><td><code>Index Scan</code></td><td>Uses a B-tree index, fetches heap rows</td><td>Good for selective queries</td></tr>
  <tr><td><code>Index Only Scan</code></td><td>Satisfies query from index alone (no heap fetch)</td><td>Best — needs covering index</td></tr>
  <tr><td><code>Bitmap Heap Scan</code></td><td>Builds a bitmap of matching pages, then fetches</td><td>Good for moderate selectivity</td></tr>
  <tr><td><code>Hash Join</code></td><td>Builds hash table from smaller side, probes with larger</td><td>Good for large unsorted joins</td></tr>
  <tr><td><code>Nested Loop</code></td><td>For each outer row, scans inner relation</td><td>Good when inner is indexed + small</td></tr>
  <tr><td><code>Merge Join</code></td><td>Joins two pre-sorted inputs</td><td>Good when both sides are sorted</td></tr>
</table>

<div class="adv-box">
  <div class="adv-header"><span class="adv-icon">⚡</span><span class="adv-label">Advanced — pg_stat_statements: find slow queries across sessions</span><span class="adv-badge">PRODUCTION</span></div>
  <div class="adv-body">
    <p class="prose">While EXPLAIN shows one query at a time, <code>pg_stat_statements</code> tracks cumulative stats for every distinct query across all sessions — essential for finding production bottlenecks.</p>
    <div class="code-block">
      <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
      <pre class="code"><span class="kw">CREATE EXTENSION IF NOT EXISTS</span> pg_stat_statements;

<span class="cm">-- Top 5 slowest queries by total execution time</span>
<span class="kw">SELECT</span>
  <span class="fn">LEFT</span>(query, <span class="num">80</span>) <span class="kw">AS</span> query_snippet,
  calls,
  <span class="fn">ROUND</span>(total_exec_time::<span class="fn">NUMERIC</span>, <span class="num">2</span>) <span class="kw">AS</span> total_ms,
  <span class="fn">ROUND</span>((total_exec_time / calls)::<span class="fn">NUMERIC</span>, <span class="num">2</span>) <span class="kw">AS</span> avg_ms
<span class="kw">FROM</span> pg_stat_statements
<span class="kw">ORDER BY</span> total_exec_time <span class="kw">DESC</span>
<span class="kw">LIMIT</span> <span class="num">5</span>;</pre>
    </div>
  </div>
</div>`;

export default function Section14() {
  return <SectionMarkup html={html} />;
}
