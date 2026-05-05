import { SectionMarkup } from "./section-markup";

const html = `<div class="section-hero">
  <div class="section-num-big">20</div>
  <div class="section-tag">// modern features</div>
  <div class="section-title">Full-Text Search</div>
  <p class="section-desc">PostgreSQL has native full-text search built in — no Elasticsearch needed for many use cases. It uses tsvector (indexed document) and tsquery (search query) types with the @@ match operator.</p>
</div>

<h3 class="block-title">Core Types & Functions</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm">-- to_tsvector: converts text into a searchable tsvector (normalized tokens)</span>
<span class="kw">SELECT</span> <span class="fn">to_tsvector</span>(<span class="str">'english'</span>, <span class="str">'The quick brown foxes jumped over lazy dogs'</span>);
<span class="cm">-- 'brown':3 'dog':9 'fox':4 'jump':5 'lazi':8 'quick':2</span>

<span class="cm">-- to_tsquery: converts a query string into a tsquery</span>
<span class="kw">SELECT</span> <span class="fn">to_tsquery</span>(<span class="str">'english'</span>, <span class="str">'jump &amp; fox'</span>);

<span class="cm">-- plainto_tsquery: free-form text, no operators needed</span>
<span class="kw">SELECT</span> <span class="fn">plainto_tsquery</span>(<span class="str">'english'</span>, <span class="str">'jumping foxes'</span>);

<span class="cm">-- websearch_to_tsquery: Google-style input ("fox" OR dog -cat)</span>
<span class="kw">SELECT</span> <span class="fn">websearch_to_tsquery</span>(<span class="str">'english'</span>, <span class="str">'quick fox OR dog'</span>);

<span class="cm">-- @@ match operator</span>
<span class="kw">SELECT</span> <span class="fn">to_tsvector</span>(<span class="str">'english'</span>, <span class="str">'The quick brown fox'</span>)
    @@ <span class="fn">to_tsquery</span>(<span class="str">'english'</span>, <span class="str">'fox'</span>);  <span class="cm">-- true</span></pre>
</div>

<h3 class="block-title">Full-Text Search on a Table</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="kw">CREATE</span> <span class="kw">TABLE</span> articles (
  id      <span class="fn">SERIAL</span> <span class="kw">PRIMARY KEY</span>,
  title   <span class="fn">TEXT</span>,
  body    <span class="fn">TEXT</span>
);

<span class="cm">-- Search without index (slow on large tables)</span>
<span class="kw">SELECT</span> id, title
<span class="kw">FROM</span> articles
<span class="kw">WHERE</span> <span class="fn">to_tsvector</span>(<span class="str">'english'</span>, title || <span class="str">' '</span> || body)
   @@ <span class="fn">plainto_tsquery</span>(<span class="str">'english'</span>, <span class="str">'postgresql performance'</span>);</pre>
</div>

<h3 class="block-title">Generated tsvector Column + GIN Index</h3>
<p class="prose">The recommended approach: store the tsvector as a generated column and index it with GIN. Queries become fast and the vector stays in sync automatically.</p>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="kw">ALTER TABLE</span> articles
  <span class="kw">ADD COLUMN</span> search_vector <span class="fn">TSVECTOR</span>
    <span class="kw">GENERATED ALWAYS AS</span> (
      <span class="fn">setweight</span>(<span class="fn">to_tsvector</span>(<span class="str">'english'</span>, <span class="fn">COALESCE</span>(title, <span class="str">''</span>)), <span class="str">'A'</span>) ||
      <span class="fn">setweight</span>(<span class="fn">to_tsvector</span>(<span class="str">'english'</span>, <span class="fn">COALESCE</span>(body,  <span class="str">''</span>)), <span class="str">'B'</span>)
    ) <span class="kw">STORED</span>;

<span class="kw">CREATE INDEX</span> idx_articles_fts <span class="kw">ON</span> articles <span class="kw">USING GIN</span> (search_vector);

<span class="cm">-- Fast search using the index</span>
<span class="kw">SELECT</span> id, title
<span class="kw">FROM</span> articles
<span class="kw">WHERE</span> search_vector @@ <span class="fn">plainto_tsquery</span>(<span class="str">'english'</span>, <span class="str">'postgresql performance'</span>)
<span class="kw">ORDER BY</span> <span class="fn">ts_rank</span>(search_vector, <span class="fn">plainto_tsquery</span>(<span class="str">'english'</span>, <span class="str">'postgresql performance'</span>)) <span class="kw">DESC</span>;</pre>
</div>

<div class="info-tip info-box"><span class="icon">💡</span><span><code>setweight</code> assigns priority A–D to tokens. Title matches (A) rank higher than body matches (B) in <code>ts_rank()</code> scoring.</span></div>

<div class="adv-box">
  <div class="adv-header"><span class="adv-icon">⚡</span><span class="adv-label">Advanced — ts_headline: highlight matched terms in results</span><span class="adv-badge">UX FEATURE</span></div>
  <div class="adv-body">
    <div class="code-block">
      <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
      <pre class="code"><span class="kw">SELECT</span>
  title,
  <span class="fn">ts_headline</span>(
    <span class="str">'english'</span>, body,
    <span class="fn">plainto_tsquery</span>(<span class="str">'english'</span>, <span class="str">'postgresql performance'</span>),
    <span class="str">'MaxFragments=2, MaxWords=20, MinWords=5'</span>
  ) <span class="kw">AS</span> excerpt
<span class="kw">FROM</span> articles
<span class="kw">WHERE</span> search_vector @@ <span class="fn">plainto_tsquery</span>(<span class="str">'english'</span>, <span class="str">'postgresql performance'</span>);
<span class="cm">-- Returns snippets with matched words wrapped in &lt;b&gt;...&lt;/b&gt;</span></pre>
    </div>
  </div>
</div>`;

export default function Section19() {
  return <SectionMarkup html={html} />;
}
