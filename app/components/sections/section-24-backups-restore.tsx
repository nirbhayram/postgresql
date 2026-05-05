import { SectionMarkup } from "./section-markup";

const html = `<div class="section-hero">
  <div class="section-num-big">25</div>
  <div class="section-tag">// production & ops</div>
  <div class="section-title">Backups & Restore</div>
  <p class="section-desc">PostgreSQL provides pg_dump for logical backups of individual databases and pg_basebackup for physical cluster backups. Understanding the difference — and knowing how to restore — is essential for any production system.</p>
</div>

<h3 class="block-title">pg_dump — Logical Backup</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">BASH</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm"># Plain SQL format (human-readable, restores with psql)</span>
pg_dump -U postgres -d mydb -f mydb_backup.sql

<span class="cm"># Custom format (compressed, selective restore with pg_restore)</span>
pg_dump -U postgres -d mydb -F c -f mydb_backup.dump

<span class="cm"># Directory format (parallel dump — fastest for large databases)</span>
pg_dump -U postgres -d mydb -F d -j 4 -f mydb_backup_dir/

<span class="cm"># Exclude a table from the backup</span>
pg_dump -U postgres -d mydb --exclude-table=logs -f mydb_backup.sql

<span class="cm"># Schema-only (no data)</span>
pg_dump -U postgres -d mydb --schema-only -f schema.sql

<span class="cm"># Data-only (no DDL)</span>
pg_dump -U postgres -d mydb --data-only -f data.sql</pre>
</div>

<h3 class="block-title">pg_restore & psql — Restore</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">BASH</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm"># Restore plain SQL backup</span>
psql -U postgres -d newdb -f mydb_backup.sql

<span class="cm"># Restore custom/directory format (parallel, -j workers)</span>
pg_restore -U postgres -d newdb -F c -j 4 mydb_backup.dump

<span class="cm"># Restore only one specific table from a custom backup</span>
pg_restore -U postgres -d newdb -t users mydb_backup.dump

<span class="cm"># Create database and restore in one step</span>
pg_restore -U postgres -C -d postgres mydb_backup.dump</pre>
</div>

<h3 class="block-title">pg_dumpall — Cluster-Level Backup</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">BASH</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm"># Dumps all databases + roles + tablespaces</span>
pg_dumpall -U postgres -f full_cluster_backup.sql

<span class="cm"># Roles only (no database data) — useful for replicating permissions</span>
pg_dumpall -U postgres --roles-only -f roles.sql</pre>
</div>

<table class="data-table">
  <tr><th>Tool</th><th>Scope</th><th>Includes roles?</th><th>Restore with</th></tr>
  <tr><td><code>pg_dump</code></td><td>Single database</td><td>No</td><td><code>psql</code> or <code>pg_restore</code></td></tr>
  <tr><td><code>pg_dumpall</code></td><td>Entire cluster</td><td>Yes</td><td><code>psql</code></td></tr>
  <tr><td><code>pg_basebackup</code></td><td>Physical cluster files</td><td>Yes</td><td>File copy + WAL replay</td></tr>
</table>

<div class="adv-box">
  <div class="adv-header"><span class="adv-icon">⚡</span><span class="adv-label">Advanced — pg_basebackup & Point-in-Time Recovery (PITR)</span><span class="adv-badge">PRODUCTION</span></div>
  <div class="adv-body">
    <p class="prose">Physical backups with WAL archiving enable PITR — restoring to any specific point in time, not just the last backup. Essential for compliance and recovering from accidental data deletion.</p>
    <div class="code-block">
      <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">BASH</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
      <pre class="code"><span class="cm"># Physical base backup (no SQL parsing — very fast)</span>
pg_basebackup -U replication_user -D /backup/base -Ft -z -P

<span class="cm"># postgresql.conf settings to enable WAL archiving</span>
<span class="cm"># wal_level = replica</span>
<span class="cm"># archive_mode = on</span>
<span class="cm"># archive_command = 'cp %p /wal_archive/%f'</span>

<span class="cm"># recovery.conf (or postgresql.conf in PG12+) for PITR</span>
<span class="cm"># restore_command = 'cp /wal_archive/%f %p'</span>
<span class="cm"># recovery_target_time = '2025-06-15 14:30:00'</span></pre>
    </div>
  </div>
</div>`;

export default function Section24() {
  return <SectionMarkup html={html} />;
}
