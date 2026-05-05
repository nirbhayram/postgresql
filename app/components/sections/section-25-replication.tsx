import { SectionMarkup } from "./section-markup";

const html = `<div class="section-hero">
  <div class="section-num-big">26</div>
  <div class="section-tag">// production & ops</div>
  <div class="section-title">Replication & High Availability</div>
  <p class="section-desc">PostgreSQL supports streaming replication for physical standbys and logical replication for selective table syncing. Streaming replication is the foundation of most HA setups, while logical replication enables zero-downtime migrations.</p>
</div>

<h3 class="block-title">Streaming Replication Overview</h3>
<table class="data-table">
  <tr><th>Concept</th><th>Description</th></tr>
  <tr><td>Primary</td><td>Accepts reads and writes; streams WAL to standbys</td></tr>
  <tr><td>Standby (replica)</td><td>Read-only; continuously applies WAL from primary</td></tr>
  <tr><td>Synchronous</td><td>Primary waits for at least one standby to confirm WAL write before commit</td></tr>
  <tr><td>Asynchronous</td><td>Primary doesn't wait — faster, but small data-loss window on failover</td></tr>
  <tr><td>Replication slot</td><td>Ensures the primary retains WAL until a standby consumes it</td></tr>
</table>

<h3 class="block-title">Replication Slots</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm">-- Create a physical replication slot (run on primary)</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> <span class="fn">pg_create_physical_replication_slot</span>(<span class="str">'standby_slot_1'</span>);

<span class="cm">-- Monitor replication lag</span>
<span class="kw">SELECT</span>
  application_name,
  state,
  sent_lsn,
  write_lsn,
  flush_lsn,
  replay_lsn,
  <span class="fn">pg_size_pretty</span>(
    <span class="fn">pg_wal_lsn_diff</span>(sent_lsn, replay_lsn)
  ) <span class="kw">AS</span> replication_lag
<span class="kw">FROM</span> pg_stat_replication;

<span class="cm">-- List all replication slots and their WAL retention</span>
<span class="kw">SELECT</span> slot_name, slot_type, active,
  <span class="fn">pg_size_pretty</span>(<span class="fn">pg_wal_lsn_diff</span>(<span class="fn">pg_current_wal_lsn</span>(), restart_lsn)) <span class="kw">AS</span> retained_wal
<span class="kw">FROM</span> pg_replication_slots;</pre>
</div>

<div class="info-warn info-box"><span class="icon">⚠️</span><span>An inactive replication slot causes the primary to retain WAL indefinitely — this can fill your disk. Monitor slot lag and drop unused slots promptly.</span></div>

<h3 class="block-title">Logical Replication</h3>
<p class="prose">Logical replication replicates at the row level for specific tables — useful for cross-version migrations, selective sync, or sending data to analytics databases.</p>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm">-- On the SOURCE (publisher) database</span>
<span class="cm">-- Requires wal_level = logical in postgresql.conf</span>
<span class="kw">CREATE PUBLICATION</span> my_pub <span class="kw">FOR TABLE</span> users, orders;

<span class="cm">-- On the TARGET (subscriber) database</span>
<span class="kw">CREATE SUBSCRIPTION</span> my_sub
  <span class="kw">CONNECTION</span> <span class="str">'host=primary-host dbname=mydb user=replication_user'</span>
  <span class="kw">PUBLICATION</span> my_pub;

<span class="cm">-- Monitor subscription status</span>
<span class="kw">SELECT</span> subname, subenabled, received_lsn <span class="kw">FROM</span> pg_stat_subscription;</pre>
</div>

<div class="adv-box">
  <div class="adv-header"><span class="adv-icon">⚡</span><span class="adv-label">Advanced — PgBouncer Connection Pooling</span><span class="adv-badge">PRODUCTION</span></div>
  <div class="adv-body">
    <p class="prose">PostgreSQL spawns a process per connection — expensive at scale. PgBouncer sits in front and multiplexes thousands of application connections onto a small pool of real database connections.</p>
    <table class="data-table">
      <tr><th>Mode</th><th>How it works</th><th>Best for</th></tr>
      <tr><td><strong>Session</strong></td><td>One server connection per client session</td><td>Long-lived clients; session variables safe</td></tr>
      <tr><td><strong>Transaction</strong></td><td>Server connection held only during a transaction</td><td>Most web apps — highest efficiency</td></tr>
      <tr><td><strong>Statement</strong></td><td>Server connection released after each statement</td><td>Simple read-only queries only</td></tr>
    </table>
    <div class="info-tip info-box" style="margin:0"><span class="icon">💡</span><span>Transaction mode is the recommended default. Note: prepared statements and <code>SET</code> session variables don't survive across transactions in this mode.</span></div>
  </div>
</div>`;

export default function Section25() {
  return <SectionMarkup html={html} />;
}
