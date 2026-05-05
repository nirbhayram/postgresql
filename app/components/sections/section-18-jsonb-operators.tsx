import { SectionMarkup } from "./section-markup";

const html = `<div class="section-hero">
  <div class="section-num-big">19</div>
  <div class="section-tag">// modern features</div>
  <div class="section-title">JSONB & JSON Operators</div>
  <p class="section-desc">JSONB is PostgreSQL's binary JSON type — stored in a decomposed binary format that enables fast key lookups, GIN indexing, and containment queries. It is one of PostgreSQL's most powerful differentiators.</p>
</div>

<h3 class="block-title">JSON vs JSONB</h3>
<div class="diff-grid">
  <div class="diff-card diff-mysql">
    <div class="diff-card-head">JSON</div>
    <pre class="code">Stores exact text input
Preserves key order &amp; duplicates
No indexing support
Faster to write</pre>
  </div>
  <div class="diff-card diff-pg">
    <div class="diff-card-head">JSONB (use this)</div>
    <pre class="code">Parsed &amp; stored as binary
Removes duplicate keys
Supports GIN indexes
Faster to read &amp; query</pre>
  </div>
</div>

<h3 class="block-title">Access Operators</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="kw">CREATE</span> <span class="kw">TABLE</span> products (
  id   <span class="fn">SERIAL</span> <span class="kw">PRIMARY KEY</span>,
  meta <span class="fn">JSONB</span>
);

<span class="kw">INSERT INTO</span> products (meta) <span class="kw">VALUES</span>
  (<span class="str">'{"name":"Widget","price":29.99,"tags":["sale","new"],"dims":{"w":10,"h":5}}'</span>);

<span class="cm">-- -> returns JSONB value</span>
<span class="kw">SELECT</span> meta -> <span class="str">'name'</span>       <span class="kw">FROM</span> products;   <span class="cm">-- "Widget"  (JSONB)</span>

<span class="cm">-- ->> returns text value</span>
<span class="kw">SELECT</span> meta ->> <span class="str">'name'</span>      <span class="kw">FROM</span> products;   <span class="cm">-- Widget   (TEXT)</span>

<span class="cm">-- #> path array → JSONB</span>
<span class="kw">SELECT</span> meta #> <span class="str">'{dims,w}'</span>   <span class="kw">FROM</span> products;   <span class="cm">-- 10  (JSONB)</span>

<span class="cm">-- #>> path array → text</span>
<span class="kw">SELECT</span> meta #>> <span class="str">'{dims,w}'</span>  <span class="kw">FROM</span> products;   <span class="cm">-- 10  (TEXT)</span>

<span class="cm">-- Array element by index</span>
<span class="kw">SELECT</span> meta -> <span class="str">'tags'</span> -> <span class="num">0</span>  <span class="kw">FROM</span> products;   <span class="cm">-- "sale"</span></pre>
</div>

<h3 class="block-title">Containment & Existence Operators</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm">-- @> "contains" — left contains right</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> products <span class="kw">WHERE</span> meta @> <span class="str">'{"name":"Widget"}'</span>;

<span class="cm">-- ? "key exists"</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> products <span class="kw">WHERE</span> meta ? <span class="str">'price'</span>;

<span class="cm">-- ?| "any key exists"</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> products <span class="kw">WHERE</span> meta ?| <span class="fn">ARRAY</span>[<span class="str">'price'</span>, <span class="str">'discount'</span>];

<span class="cm">-- ?& "all keys exist"</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> products <span class="kw">WHERE</span> meta ?& <span class="fn">ARRAY</span>[<span class="str">'name'</span>, <span class="str">'price'</span>];</pre>
</div>

<h3 class="block-title">Modifying JSONB</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm">-- || merge (right overwrites left on conflict)</span>
<span class="kw">UPDATE</span> products
<span class="kw">SET</span> meta = meta || <span class="str">'{"price":24.99,"on_sale":true}'</span>
<span class="kw">WHERE</span> id = <span class="num">1</span>;

<span class="cm">-- jsonb_set — update a nested path</span>
<span class="kw">UPDATE</span> products
<span class="kw">SET</span> meta = <span class="fn">jsonb_set</span>(meta, <span class="str">'{dims,w}'</span>, <span class="str">'15'</span>)
<span class="kw">WHERE</span> id = <span class="num">1</span>;

<span class="cm">-- - delete a key</span>
<span class="kw">UPDATE</span> products <span class="kw">SET</span> meta = meta - <span class="str">'on_sale'</span> <span class="kw">WHERE</span> id = <span class="num">1</span>;</pre>
</div>

<div class="adv-box">
  <div class="adv-header"><span class="adv-icon">⚡</span><span class="adv-label">Advanced — GIN Index & JSONB Aggregation</span><span class="adv-badge">HIGH PRIORITY</span></div>
  <div class="adv-body">
    <div class="code-block">
      <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
      <pre class="code"><span class="cm">-- GIN index accelerates @>, ?, ?|, ?& on the entire JSONB column</span>
<span class="kw">CREATE INDEX</span> idx_products_meta <span class="kw">ON</span> products <span class="kw">USING GIN</span> (meta);

<span class="cm">-- jsonb_agg — aggregate rows into a JSON array</span>
<span class="kw">SELECT</span> gender, <span class="fn">jsonb_agg</span>(<span class="fn">jsonb_build_object</span>(<span class="str">'id'</span>, id, <span class="str">'name'</span>, name)) <span class="kw">AS</span> users
<span class="kw">FROM</span> users
<span class="kw">GROUP BY</span> gender;

<span class="cm">-- jsonb_to_recordset — expand a JSONB array into rows</span>
<span class="kw">SELECT</span> *
<span class="kw">FROM</span> <span class="fn">jsonb_to_recordset</span>(<span class="str">'[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]'</span>)
  <span class="kw">AS</span> t(id <span class="fn">INT</span>, name <span class="fn">TEXT</span>);</pre>
    </div>
  </div>
</div>`;

export default function Section18() {
  return <SectionMarkup html={html} />;
}
