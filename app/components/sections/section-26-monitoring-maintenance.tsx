import { SectionMarkup } from "./section-markup";

const html = `<div class="section-hero">
  <div class="section-num-big">27</div>
  <div class="section-tag">// production & ops</div>
  <div class="section-title">Monitoring & Maintenance</div>
  <p class="section-desc">PostgreSQL ships with a rich set of pg_stat_* views that expose everything from active queries to table bloat. Knowing how to read these views is essential for diagnosing production issues quickly.</p>
</div>

<h3 class="block-title">Active Queries — pg_stat_activity</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm">-- All currently running queries (excluding idle)</span>
<span class="kw">SELECT</span>
  pid,
  usename,
  application_name,
  state,
  wait_event_type,
  wait_event,
  <span class="fn">NOW</span>() - query_start <span class="kw">AS</span> duration,
  <span class="fn">LEFT</span>(query, <span class="num">100</span>) <span class="kw">AS</span> query_snippet
<span class="kw">FROM</span> pg_stat_activity
<span class="kw">WHERE</span> state != <span class="str">'idle'</span>
<span class="kw">ORDER BY</span> duration <span class="kw">DESC</span>;

<span class="cm">-- Kill a long-running query (graceful)</span>
<span class="kw">SELECT</span> <span class="fn">pg_cancel_backend</span>(<span class="num">12345</span>);

<span class="cm">-- Force-terminate a session</span>
<span class="kw">SELECT</span> <span class="fn">pg_terminate_backend</span>(<span class="num">12345</span>);</pre>
</div>

<h3 class="block-title">Table Health — pg_stat_user_tables</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm">-- Tables with high dead tuple counts (need VACUUM)</span>
<span class="kw">SELECT</span>
  relname <span class="kw">AS</span> table_name,
  n_live_tup,
  n_dead_tup,
  <span class="fn">ROUND</span>(n_dead_tup::numeric / <span class="fn">NULLIF</span>(n_live_tup + n_dead_tup, <span class="num">0</span>) * <span class="num">100</span>, <span class="num">1</span>) <span class="kw">AS</span> dead_pct,
  last_autovacuum,
  last_autoanalyze
<span class="kw">FROM</span> pg_stat_user_tables
<span class="kw">WHERE</span> n_dead_tup > <span class="num">1000</span>
<span class="kw">ORDER BY</span> n_dead_tup <span class="kw">DESC</span>;</pre>
</div>

<h3 class="block-title">Database & Table Sizes</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm">-- Size of all databases</span>
<span class="kw">SELECT</span> datname, <span class="fn">pg_size_pretty</span>(<span class="fn">pg_database_size</span>(datname)) <span class="kw">AS</span> size
<span class="kw">FROM</span> pg_database <span class="kw">ORDER BY</span> <span class="fn">pg_database_size</span>(datname) <span class="kw">DESC</span>;

<span class="cm">-- Largest tables including indexes and toast</span>
<span class="kw">SELECT</span>
  relname <span class="kw">AS</span> table_name,
  <span class="fn">pg_size_pretty</span>(<span class="fn">pg_total_relation_size</span>(oid)) <span class="kw">AS</span> total_size,
  <span class="fn">pg_size_pretty</span>(<span class="fn">pg_relation_size</span>(oid))        <span class="kw">AS</span> table_size,
  <span class="fn">pg_size_pretty</span>(<span class="fn">pg_indexes_size</span>(oid))         <span class="kw">AS</span> index_size
<span class="kw">FROM</span> pg_class
<span class="kw">WHERE</span> relkind = <span class="str">'r'</span>
<span class="kw">ORDER BY</span> <span class="fn">pg_total_relation_size</span>(oid) <span class="kw">DESC</span>
<span class="kw">LIMIT</span> <span class="num">10</span>;</pre>
</div>

<h3 class="block-title">Cache Hit Rate</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm">-- Buffer cache hit rate — should be > 99% for OLTP workloads</span>
<span class="kw">SELECT</span>
  <span class="fn">SUM</span>(heap_blks_hit) <span class="kw">AS</span> cache_hits,
  <span class="fn">SUM</span>(heap_blks_read) <span class="kw">AS</span> disk_reads,
  <span class="fn">ROUND</span>(
    <span class="fn">SUM</span>(heap_blks_hit)::numeric /
    <span class="fn">NULLIF</span>(<span class="fn">SUM</span>(heap_blks_hit) + <span class="fn">SUM</span>(heap_blks_read), <span class="num">0</span>) * <span class="num">100</span>, <span class="num">2</span>
  ) <span class="kw">AS</span> cache_hit_pct
<span class="kw">FROM</span> pg_statio_user_tables;</pre>
</div>

<div class="adv-box">
  <div class="adv-header"><span class="adv-icon">⚡</span><span class="adv-label">Advanced — pg_stat_statements Top Queries Report</span><span class="adv-badge">PRODUCTION</span></div>
  <div class="adv-body">
    <div class="code-block">
      <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
      <pre class="code"><span class="cm">-- Most time-consuming queries (total time across all executions)</span>
<span class="kw">SELECT</span>
  <span class="fn">ROUND</span>(total_exec_time::<span class="fn">NUMERIC</span>, <span class="num">0</span>) <span class="kw">AS</span> total_ms,
  calls,
  <span class="fn">ROUND</span>((total_exec_time / calls)::<span class="fn">NUMERIC</span>, <span class="num">2</span>) <span class="kw">AS</span> avg_ms,
  <span class="fn">ROUND</span>(rows / calls::<span class="fn">NUMERIC</span>, <span class="num">1</span>) <span class="kw">AS</span> avg_rows,
  <span class="fn">LEFT</span>(query, <span class="num">100</span>) <span class="kw">AS</span> query
<span class="kw">FROM</span> pg_stat_statements
<span class="kw">ORDER BY</span> total_exec_time <span class="kw">DESC</span>
<span class="kw">LIMIT</span> <span class="num">10</span>;

<span class="cm">-- Reset stats (do this after tuning to get a fresh baseline)</span>
<span class="kw">SELECT</span> <span class="fn">pg_stat_statements_reset</span>();</pre>
    </div>
  </div>
</div>`;

export default function Section26() {
  return <SectionMarkup html={html} />;
}
