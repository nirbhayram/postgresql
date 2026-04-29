import { SectionMarkup } from "./section-markup";

const html = `<div class="section-hero">
  <div class="section-num-big">16</div>
  <div class="section-tag">// performance</div>
  <div class="section-title">Performance Tuning & Indexes</div>
  <p class="section-desc">Beyond creating indexes, performance tuning involves covering indexes, finding unused indexes, understanding VACUUM, and tuning key memory parameters. These are the levers that separate a fast database from a slow one.</p>
</div>

<h3 class="block-title">Covering Indexes (INCLUDE clause)</h3>
<p class="prose">A covering index stores extra columns alongside the index key so that queries can be satisfied entirely from the index — without touching the heap (table). This is called an Index Only Scan.</p>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm">-- Query: SELECT name, salary FROM users WHERE email = ?</span>
<span class="cm">-- Without covering index: Index Scan + heap fetch for name/salary</span>
<span class="kw">CREATE INDEX</span> idx_email <span class="kw">ON</span> users(email);

<span class="cm">-- With covering index: Index Only Scan, no heap fetch needed</span>
<span class="kw">CREATE INDEX</span> idx_email_covering <span class="kw">ON</span> users(email) <span class="kw">INCLUDE</span> (name, salary);

<span class="cm">-- Verify with EXPLAIN ANALYZE</span>
<span class="kw">EXPLAIN ANALYZE SELECT</span> name, salary <span class="kw">FROM</span> users <span class="kw">WHERE</span> email = <span class="str">'alice@ex.com'</span>;</pre>
</div>

<h3 class="block-title">Finding Unused Indexes</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm">-- Indexes with zero scans since last stats reset</span>
<span class="kw">SELECT</span>
  schemaname,
  tablename,
  indexname,
  idx_scan  <span class="kw">AS</span> times_used,
  <span class="fn">pg_size_pretty</span>(<span class="fn">pg_relation_size</span>(indexrelid)) <span class="kw">AS</span> index_size
<span class="kw">FROM</span> pg_stat_user_indexes
<span class="kw">WHERE</span> idx_scan = <span class="num">0</span>
  <span class="kw">AND</span> indexrelname <span class="kw">NOT LIKE</span> <span class="str">'%_pkey'</span>  <span class="cm">-- exclude primary keys</span>
<span class="kw">ORDER BY</span> pg_relation_size(indexrelid) <span class="kw">DESC</span>;</pre>
</div>

<div class="info-tip info-box"><span class="icon">💡</span><span>Stats reset on server restart. Run this query on a production server after at least a week of uptime for reliable results.</span></div>

<h3 class="block-title">VACUUM & ANALYZE</h3>
<table class="data-table">
  <tr><th>Command</th><th>What it does</th><th>When to run</th></tr>
  <tr><td><code>VACUUM</code></td><td>Reclaims dead tuple space for reuse (does NOT shrink file)</td><td>Autovacuum handles this automatically</td></tr>
  <tr><td><code>VACUUM FULL</code></td><td>Rewrites table to reclaim disk space — acquires full lock</td><td>After large bulk deletes; maintenance window only</td></tr>
  <tr><td><code>ANALYZE</code></td><td>Updates planner statistics so the optimizer makes better choices</td><td>After bulk loads or major data changes</td></tr>
  <tr><td><code>VACUUM ANALYZE</code></td><td>Both in one pass</td><td>Most common manual maintenance command</td></tr>
</table>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="kw">VACUUM ANALYZE</span> users;       <span class="cm">-- specific table</span>
<span class="kw">VACUUM ANALYZE</span>;             <span class="cm">-- all tables in current database</span>
<span class="kw">VACUUM</span> (VERBOSE) users;     <span class="cm">-- show detailed output</span>

<span class="cm">-- Check dead tuple accumulation</span>
<span class="kw">SELECT</span> relname, n_dead_tup, n_live_tup, last_autovacuum
<span class="kw">FROM</span> pg_stat_user_tables
<span class="kw">ORDER BY</span> n_dead_tup <span class="kw">DESC</span>;</pre>
</div>

<div class="adv-box">
  <div class="adv-header"><span class="adv-icon">⚡</span><span class="adv-label">Advanced — Key Memory Parameters</span><span class="adv-badge">INTERVIEW</span></div>
  <div class="adv-body">
    <table class="data-table">
      <tr><th>Parameter</th><th>Default</th><th>What it controls</th></tr>
      <tr><td><code>shared_buffers</code></td><td>128 MB</td><td>PostgreSQL's own page cache. Set to 25% of RAM.</td></tr>
      <tr><td><code>effective_cache_size</code></td><td>4 GB</td><td>Hint to planner about OS cache. Set to 50–75% of RAM.</td></tr>
      <tr><td><code>work_mem</code></td><td>4 MB</td><td>Per sort/hash operation. Raising it speeds up ORDER BY and hash joins but multiplies with connections.</td></tr>
      <tr><td><code>maintenance_work_mem</code></td><td>64 MB</td><td>Used by VACUUM, CREATE INDEX, ALTER TABLE. Can be set high (512 MB+) for maintenance.</td></tr>
    </table>
    <div class="code-block">
      <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
      <pre class="code"><span class="cm">-- View current settings</span>
<span class="kw">SHOW</span> shared_buffers;
<span class="kw">SHOW</span> work_mem;

<span class="cm">-- Temporarily raise work_mem for a heavy query in this session</span>
<span class="kw">SET</span> work_mem = <span class="str">'256MB'</span>;
<span class="kw">SELECT</span> * <span class="kw">FROM</span> large_table <span class="kw">ORDER BY</span> salary <span class="kw">DESC</span>;
<span class="kw">RESET</span> work_mem;</pre>
    </div>
  </div>
</div>

<div class="adv-box">
  <div class="adv-header"><span class="adv-icon">⚡</span><span class="adv-label">Advanced — EXISTS vs IN vs JOIN for performance</span><span class="adv-badge">INTERVIEW</span></div>
  <div class="adv-body">
    <p class="prose">For checking existence, <code>EXISTS</code> short-circuits at the first match and is generally fastest. <code>IN</code> with a subquery materializes the full result set. <code>JOIN</code> is equivalent but relies on the planner to optimize.</p>
    <div class="code-block">
      <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
      <pre class="code"><span class="cm">-- Prefer EXISTS for large subqueries (short-circuits)</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> users u
<span class="kw">WHERE EXISTS</span> (
  <span class="kw">SELECT</span> <span class="num">1</span> <span class="kw">FROM</span> orders o <span class="kw">WHERE</span> o.user_id = u.id
);

<span class="cm">-- NOT IN is dangerous with NULLs — use NOT EXISTS instead</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> users u
<span class="kw">WHERE NOT EXISTS</span> (
  <span class="kw">SELECT</span> <span class="num">1</span> <span class="kw">FROM</span> orders o <span class="kw">WHERE</span> o.user_id = u.id
);</pre>
    </div>
  </div>
</div>`;

export default function Section15() {
  return <SectionMarkup html={html} />;
}
