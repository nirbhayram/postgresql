import { SectionMarkup } from "./section-markup";

const html = `<div class="section-hero">
  <div class="section-num-big">22</div>
  <div class="section-tag">// modern features</div>
  <div class="section-title">Extensions</div>
  <p class="section-desc">PostgreSQL's extension system allows first-class capabilities to be added without forking the database. pg_trgm, pgvector, and PostGIS are production-grade tools used at massive scale — all installable with a single command.</p>
</div>

<h3 class="block-title">Installing Extensions</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm">-- List available extensions</span>
<span class="kw">SELECT</span> name, default_version, comment
<span class="kw">FROM</span> pg_available_extensions
<span class="kw">ORDER BY</span> name;

<span class="cm">-- Install (requires superuser or pg_extension_owner)</span>
<span class="kw">CREATE EXTENSION IF NOT EXISTS</span> pg_trgm;
<span class="kw">CREATE EXTENSION IF NOT EXISTS</span> pgvector;
<span class="kw">CREATE EXTENSION IF NOT EXISTS</span> postgis;

<span class="cm">-- List installed extensions</span>
<span class="kw">SELECT</span> extname, extversion <span class="kw">FROM</span> pg_extension;</pre>
</div>

<h3 class="block-title">pg_trgm — Fuzzy Text Search</h3>
<p class="prose">Trigram similarity splits strings into 3-character chunks and measures overlap — perfect for "did you mean?" search or matching user input with typos.</p>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="kw">CREATE EXTENSION IF NOT EXISTS</span> pg_trgm;

<span class="cm">-- similarity() returns 0.0–1.0; % operator uses pg_trgm.similarity_threshold (default 0.3)</span>
<span class="kw">SELECT</span> <span class="fn">similarity</span>(<span class="str">'postgresql'</span>, <span class="str">'posrgresql'</span>);  <span class="cm">-- ~0.6 despite the typo</span>

<span class="cm">-- Find similar product names</span>
<span class="kw">SELECT</span> name, <span class="fn">similarity</span>(name, <span class="str">'Widgit'</span>) <span class="kw">AS</span> score
<span class="kw">FROM</span> products
<span class="kw">WHERE</span> name % <span class="str">'Widgit'</span>
<span class="kw">ORDER BY</span> score <span class="kw">DESC</span>;

<span class="cm">-- GIN or GiST index makes this fast at scale</span>
<span class="kw">CREATE INDEX</span> idx_products_trgm <span class="kw">ON</span> products <span class="kw">USING GIN</span> (name gin_trgm_ops);

<span class="cm">-- ILIKE also benefits from the trigram index</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> products <span class="kw">WHERE</span> name <span class="kw">ILIKE</span> <span class="str">'%widget%'</span>;</pre>
</div>

<h3 class="block-title">pgvector — Vector Similarity Search</h3>
<p class="prose">pgvector stores ML embedding vectors (from OpenAI, Gemini, etc.) and performs similarity search directly in PostgreSQL — enabling semantic search without a separate vector database.</p>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="kw">CREATE EXTENSION IF NOT EXISTS</span> vector;

<span class="kw">CREATE</span> <span class="kw">TABLE</span> documents (
  id        <span class="fn">SERIAL</span> <span class="kw">PRIMARY KEY</span>,
  content   <span class="fn">TEXT</span>,
  embedding <span class="fn">vector</span>(<span class="num">1536</span>)   <span class="cm">-- dimension matches your model (e.g., OpenAI ada-002)</span>
);

<span class="cm">-- IVFFlat index for approximate nearest-neighbour search</span>
<span class="kw">CREATE INDEX</span> idx_docs_embedding <span class="kw">ON</span> documents
  <span class="kw">USING ivfflat</span> (embedding vector_cosine_ops) <span class="kw">WITH</span> (lists = <span class="num">100</span>);

<span class="cm">-- Find 5 most similar documents to a query embedding</span>
<span class="kw">SELECT</span> id, content,
  embedding &lt;=&gt; <span class="str">'[0.12,0.34,...]'</span>::<span class="fn">vector</span> <span class="kw">AS</span> cosine_distance
<span class="kw">FROM</span> documents
<span class="kw">ORDER BY</span> embedding &lt;=&gt; <span class="str">'[0.12,0.34,...]'</span>::<span class="fn">vector</span>
<span class="kw">LIMIT</span> <span class="num">5</span>;</pre>
</div>

<table class="data-table">
  <tr><th>Operator</th><th>Distance metric</th></tr>
  <tr><td><code>&lt;-&gt;</code></td><td>Euclidean (L2) distance</td></tr>
  <tr><td><code>&lt;#&gt;</code></td><td>Negative inner product</td></tr>
  <tr><td><code>&lt;=&gt;</code></td><td>Cosine distance (most common for text embeddings)</td></tr>
</table>

<div class="adv-box">
  <div class="adv-header"><span class="adv-icon">⚡</span><span class="adv-label">Advanced — PostGIS & btree_gist overview</span><span class="adv-badge">REFERENCE</span></div>
  <div class="adv-body">
    <div class="code-block">
      <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
      <pre class="code"><span class="cm">-- PostGIS: geometry types for geospatial queries</span>
<span class="kw">CREATE EXTENSION IF NOT EXISTS</span> postgis;

<span class="kw">SELECT</span> <span class="fn">ST_Distance</span>(
  <span class="fn">ST_MakePoint</span>(<span class="num">77.59</span>, <span class="num">12.97</span>)::geography,   <span class="cm">-- Bengaluru</span>
  <span class="fn">ST_MakePoint</span>(<span class="num">72.87</span>, <span class="num">19.07</span>)::geography    <span class="cm">-- Mumbai</span>
) / <span class="num">1000</span> <span class="kw">AS</span> distance_km;

<span class="cm">-- btree_gist: required for EXCLUDE constraints on scalar types (see Constraints section)</span>
<span class="kw">CREATE EXTENSION IF NOT EXISTS</span> btree_gist;</pre>
    </div>
  </div>
</div>`;

export default function Section21() {
  return <SectionMarkup html={html} />;
}
