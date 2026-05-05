import { SectionMarkup } from "./section-markup";

const html = `<div class="section-hero">
  <div class="section-num-big">17</div>
  <div class="section-tag">// performance</div>
  <div class="section-title">Locking & Concurrency</div>
  <p class="section-desc">PostgreSQL's MVCC engine means readers never block writers. But explicit locking is still needed for coordinating concurrent updates, implementing job queues, and preventing race conditions.</p>
</div>

<h3 class="block-title">Row-Level Locking</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm">-- FOR UPDATE: lock rows for update — other transactions block until this one commits</span>
<span class="kw">BEGIN</span>;
<span class="kw">SELECT</span> * <span class="kw">FROM</span> accounts <span class="kw">WHERE</span> id = <span class="num">1</span> <span class="kw">FOR UPDATE</span>;
<span class="kw">UPDATE</span> accounts <span class="kw">SET</span> balance = balance - <span class="num">100</span> <span class="kw">WHERE</span> id = <span class="num">1</span>;
<span class="kw">COMMIT</span>;

<span class="cm">-- FOR SHARE: allows other SELECT FOR SHARE, blocks SELECT FOR UPDATE</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> users <span class="kw">WHERE</span> id = <span class="num">5</span> <span class="kw">FOR SHARE</span>;

<span class="cm">-- FOR NO KEY UPDATE: weaker than FOR UPDATE — allows FK lookups to proceed</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> users <span class="kw">WHERE</span> id = <span class="num">5</span> <span class="kw">FOR NO KEY UPDATE</span>;

<span class="cm">-- NOWAIT: fail immediately instead of waiting if row is locked</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> orders <span class="kw">WHERE</span> id = <span class="num">10</span> <span class="kw">FOR UPDATE NOWAIT</span>;</pre>
</div>

<h3 class="block-title">SKIP LOCKED — Job Queue Pattern</h3>
<p class="prose"><code>SKIP LOCKED</code> skips rows currently locked by another transaction instead of waiting. This is the standard pattern for concurrent job queues — multiple workers can each grab a distinct job without stepping on each other.</p>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm">-- Worker picks up ONE pending job, skipping jobs locked by other workers</span>
<span class="kw">BEGIN</span>;

<span class="kw">SELECT</span> id, payload
<span class="kw">FROM</span> jobs
<span class="kw">WHERE</span> status = <span class="str">'pending'</span>
<span class="kw">ORDER BY</span> created_at
<span class="kw">LIMIT</span> <span class="num">1</span>
<span class="kw">FOR UPDATE SKIP LOCKED</span>;  <span class="cm">-- key: skip what other workers hold</span>

<span class="cm">-- Process the job, then mark complete</span>
<span class="kw">UPDATE</span> jobs <span class="kw">SET</span> status = <span class="str">'done'</span> <span class="kw">WHERE</span> id = :job_id;

<span class="kw">COMMIT</span>;</pre>
</div>

<h3 class="block-title">Detecting Locks & Deadlocks</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm">-- See all current locks</span>
<span class="kw">SELECT</span> pid, relation::<span class="fn">regclass</span>, mode, granted
<span class="kw">FROM</span> pg_locks
<span class="kw">WHERE</span> relation <span class="kw">IS NOT NULL</span>;

<span class="cm">-- Find blocking sessions</span>
<span class="kw">SELECT</span>
  blocked.pid   <span class="kw">AS</span> blocked_pid,
  blocked.query <span class="kw">AS</span> blocked_query,
  blocking.pid  <span class="kw">AS</span> blocking_pid,
  blocking.query <span class="kw">AS</span> blocking_query
<span class="kw">FROM</span> pg_stat_activity <span class="kw">AS</span> blocked
<span class="kw">JOIN</span> pg_stat_activity <span class="kw">AS</span> blocking
  <span class="kw">ON</span> blocking.pid = <span class="kw">ANY</span>(<span class="fn">pg_blocking_pids</span>(blocked.pid))
<span class="kw">WHERE</span> blocked.wait_event_type = <span class="str">'Lock'</span>;</pre>
</div>

<div class="info-tip info-box"><span class="icon">💡</span><span>PostgreSQL auto-detects deadlocks and cancels one of the conflicting transactions with error <code>ERROR: deadlock detected</code>. The <code>deadlock_timeout</code> setting (default 1s) controls how long it waits before checking.</span></div>

<div class="adv-box">
  <div class="adv-header"><span class="adv-icon">⚡</span><span class="adv-label">Advanced — Advisory Locks (application-level coordination)</span><span class="adv-badge">PATTERN</span></div>
  <div class="adv-body">
    <p class="prose">Advisory locks are application-defined locks not tied to any table row. Useful for ensuring only one process runs a specific job (e.g., a cron task) at a time.</p>
    <div class="code-block">
      <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
      <pre class="code"><span class="cm">-- Try to acquire lock id 12345; returns true if acquired, false if already held</span>
<span class="kw">SELECT</span> <span class="fn">pg_try_advisory_lock</span>(<span class="num">12345</span>);

<span class="cm">-- Release it</span>
<span class="kw">SELECT</span> <span class="fn">pg_advisory_unlock</span>(<span class="num">12345</span>);

<span class="cm">-- Transaction-scoped (auto-released on COMMIT/ROLLBACK)</span>
<span class="kw">SELECT</span> <span class="fn">pg_try_advisory_xact_lock</span>(<span class="num">12345</span>);</pre>
    </div>
  </div>
</div>`;

export default function Section16() {
  return <SectionMarkup html={html} />;
}
