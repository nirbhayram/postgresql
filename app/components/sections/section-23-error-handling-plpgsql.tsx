import { SectionMarkup } from "./section-markup";

const html = `<div class="section-hero">
  <div class="section-num-big">24</div>
  <div class="section-tag">// programmability</div>
  <div class="section-title">Error Handling in PL/pgSQL</div>
  <p class="section-desc">PL/pgSQL provides structured exception handling inside functions and procedures. Unlike MySQL, you can catch named exception types, re-raise errors, and use RAISE to emit custom messages at any severity level.</p>
</div>

<h3 class="block-title">EXCEPTION Blocks</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">PL/pgSQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="kw">CREATE OR REPLACE FUNCTION</span> safe_insert_user(p_email <span class="fn">TEXT</span>, p_name <span class="fn">TEXT</span>)
<span class="kw">RETURNS TEXT</span>
<span class="kw">LANGUAGE</span> plpgsql
<span class="kw">AS</span> $$
<span class="kw">BEGIN</span>
  <span class="kw">INSERT INTO</span> users (email, name) <span class="kw">VALUES</span> (p_email, p_name);
  <span class="kw">RETURN</span> <span class="str">'success'</span>;

<span class="kw">EXCEPTION</span>
  <span class="kw">WHEN</span> unique_violation <span class="kw">THEN</span>
    <span class="kw">RETURN</span> <span class="str">'email already exists'</span>;

  <span class="kw">WHEN</span> not_null_violation <span class="kw">THEN</span>
    <span class="kw">RETURN</span> <span class="str">'name cannot be null'</span>;

  <span class="kw">WHEN</span> <span class="fn">OTHERS</span> <span class="kw">THEN</span>
    <span class="kw">RETURN</span> <span class="str">'unexpected error: '</span> || SQLERRM;
<span class="kw">END</span>;
$$;</pre>
</div>

<h3 class="block-title">Common Exception Names</h3>
<table class="data-table">
  <tr><th>Exception Name</th><th>SQLSTATE</th><th>When it fires</th></tr>
  <tr><td><code>unique_violation</code></td><td>23505</td><td>UNIQUE or PRIMARY KEY constraint violated</td></tr>
  <tr><td><code>foreign_key_violation</code></td><td>23503</td><td>FK reference doesn't exist in parent table</td></tr>
  <tr><td><code>not_null_violation</code></td><td>23502</td><td>NOT NULL constraint violated</td></tr>
  <tr><td><code>check_violation</code></td><td>23514</td><td>CHECK constraint failed</td></tr>
  <tr><td><code>division_by_zero</code></td><td>22012</td><td>Division by zero in arithmetic</td></tr>
  <tr><td><code>no_data_found</code></td><td>P0002</td><td>SELECT INTO returned no rows</td></tr>
  <tr><td><code>too_many_rows</code></td><td>P0003</td><td>SELECT INTO returned more than one row</td></tr>
  <tr><td><code>OTHERS</code></td><td>—</td><td>Catch-all for any unhandled exception</td></tr>
</table>

<h3 class="block-title">RAISE — Emit Messages & Errors</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">PL/pgSQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm">-- NOTICE / WARNING: informational, doesn't abort</span>
<span class="kw">RAISE NOTICE</span> <span class="str">'Processing user id: %'</span>, p_id;
<span class="kw">RAISE WARNING</span> <span class="str">'Salary is unusually high: %'</span>, p_salary;

<span class="cm">-- EXCEPTION: aborts the current transaction block</span>
<span class="kw">RAISE EXCEPTION</span> <span class="str">'User % not found'</span>, p_id
  <span class="kw">USING ERRCODE</span> = <span class="str">'P0002'</span>;  <span class="cm">-- custom SQLSTATE</span>

<span class="cm">-- Re-raise the current exception (inside an EXCEPTION block)</span>
<span class="kw">EXCEPTION</span>
  <span class="kw">WHEN</span> <span class="fn">OTHERS</span> <span class="kw">THEN</span>
    <span class="kw">INSERT INTO</span> error_log (msg, code) <span class="kw">VALUES</span> (SQLERRM, SQLSTATE);
    <span class="kw">RAISE</span>;  <span class="cm">-- re-raise the original error</span></pre>
</div>

<div class="adv-box">
  <div class="adv-header"><span class="adv-icon">⚡</span><span class="adv-label">Advanced — Dynamic SQL & GET DIAGNOSTICS</span><span class="adv-badge">PATTERN</span></div>
  <div class="adv-body">
    <div class="code-block">
      <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">PL/pgSQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
      <pre class="code"><span class="cm">-- Dynamic SQL: build query strings at runtime</span>
<span class="kw">DECLARE</span>
  tbl_name <span class="fn">TEXT</span> := <span class="str">'users'</span>;
  row_count <span class="fn">INT</span>;
<span class="kw">BEGIN</span>
  <span class="kw">EXECUTE</span> <span class="str">'SELECT COUNT(*) FROM '</span> || <span class="fn">quote_ident</span>(tbl_name) <span class="kw">INTO</span> row_count;

<span class="cm">-- GET DIAGNOSTICS: how many rows were affected by the last DML?</span>
  <span class="kw">UPDATE</span> users <span class="kw">SET</span> is_active = <span class="kw">FALSE</span> <span class="kw">WHERE</span> last_login < <span class="fn">NOW</span>() - <span class="kw">INTERVAL</span> <span class="str">'1 year'</span>;
  <span class="kw">GET DIAGNOSTICS</span> row_count = ROW_COUNT;
  <span class="kw">RAISE NOTICE</span> <span class="str">'Deactivated % users'</span>, row_count;
<span class="kw">END</span>;</pre>
    </div>
    <div class="info-tip info-box" style="margin:0"><span class="icon">💡</span><span>Always use <code>quote_ident()</code> for identifiers and <code>quote_literal()</code> for values in dynamic SQL to prevent SQL injection.</span></div>
  </div>
</div>`;

export default function Section23() {
  return <SectionMarkup html={html} />;
}
