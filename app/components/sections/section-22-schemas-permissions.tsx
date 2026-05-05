import { SectionMarkup } from "./section-markup";

const html = `<div class="section-hero">
  <div class="section-num-big">23</div>
  <div class="section-tag">// programmability</div>
  <div class="section-title">Schemas & Permissions</div>
  <p class="section-desc">Schemas are PostgreSQL's namespace layer between a database and its objects. Combined with GRANT/REVOKE and Row-Level Security, they enable fine-grained multi-tenant access control entirely within the database.</p>
</div>

<h3 class="block-title">Schemas</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm">-- Create a schema for app objects and one for internal/admin use</span>
<span class="kw">CREATE SCHEMA</span> app;
<span class="kw">CREATE SCHEMA</span> internal;

<span class="cm">-- Create a table in a specific schema</span>
<span class="kw">CREATE</span> <span class="kw">TABLE</span> app.users (id <span class="fn">SERIAL</span> <span class="kw">PRIMARY KEY</span>, name <span class="fn">TEXT</span>);

<span class="cm">-- search_path controls which schema is searched when no schema is specified</span>
<span class="kw">SET</span> search_path = app, public;
<span class="kw">SELECT</span> * <span class="kw">FROM</span> users;  <span class="cm">-- resolves to app.users</span>

<span class="cm">-- Set default search_path for a role</span>
<span class="kw">ALTER ROLE</span> app_user <span class="kw">SET</span> search_path = app;</pre>
</div>

<h3 class="block-title">GRANT & REVOKE</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm">-- Grant schema usage (required before granting table-level permissions)</span>
<span class="kw">GRANT USAGE ON SCHEMA</span> app <span class="kw">TO</span> app_user;

<span class="cm">-- Grant on all existing tables in schema</span>
<span class="kw">GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA</span> app <span class="kw">TO</span> app_user;

<span class="cm">-- Grant on future tables automatically</span>
<span class="kw">ALTER DEFAULT PRIVILEGES IN SCHEMA</span> app
  <span class="kw">GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO</span> app_user;

<span class="cm">-- Read-only role pattern</span>
<span class="kw">CREATE ROLE</span> readonly_role;
<span class="kw">GRANT USAGE ON SCHEMA</span> app <span class="kw">TO</span> readonly_role;
<span class="kw">GRANT SELECT ON ALL TABLES IN SCHEMA</span> app <span class="kw">TO</span> readonly_role;
<span class="kw">GRANT</span> readonly_role <span class="kw">TO</span> alice;  <span class="cm">-- alice inherits SELECT on all tables</span></pre>
</div>

<div class="adv-box">
  <div class="adv-header"><span class="adv-icon">⚡</span><span class="adv-label">Advanced — Row-Level Security (RLS)</span><span class="adv-badge">MULTI-TENANT</span></div>
  <div class="adv-body">
    <p class="prose">RLS lets you attach per-row visibility policies to a table. Even a <code>SELECT *</code> will only return rows the current user is allowed to see — enforced at the database level, not the application.</p>
    <div class="code-block">
      <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
      <pre class="code"><span class="cm">-- 1. Enable RLS on the table</span>
<span class="kw">ALTER TABLE</span> app.orders <span class="kw">ENABLE ROW LEVEL SECURITY</span>;

<span class="cm">-- 2. Create a policy: users can only see their own orders</span>
<span class="kw">CREATE POLICY</span> orders_user_isolation <span class="kw">ON</span> app.orders
  <span class="kw">USING</span> (user_id = <span class="fn">current_setting</span>(<span class="str">'app.current_user_id'</span>)::<span class="fn">INT</span>);

<span class="cm">-- 3. In your application, set the context before querying</span>
<span class="kw">SET</span> app.current_user_id = <span class="str">'42'</span>;
<span class="kw">SELECT</span> * <span class="kw">FROM</span> app.orders;  <span class="cm">-- only returns rows where user_id = 42</span>

<span class="cm">-- Superusers and table owners bypass RLS by default</span>
<span class="cm">-- Use FORCE ROW LEVEL SECURITY to apply it to owners too</span>
<span class="kw">ALTER TABLE</span> app.orders <span class="kw">FORCE ROW LEVEL SECURITY</span>;</pre>
    </div>
  </div>
</div>`;

export default function Section22() {
  return <SectionMarkup html={html} />;
}
