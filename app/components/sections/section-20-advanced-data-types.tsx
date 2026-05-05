import { SectionMarkup } from "./section-markup";

const html = `<div class="section-hero">
  <div class="section-num-big">21</div>
  <div class="section-tag">// modern features</div>
  <div class="section-title">Advanced Data Types</div>
  <p class="section-desc">PostgreSQL's type system goes far beyond MySQL: native ENUMs, arrays, range types, generated columns, and domain types reduce application logic and catch data integrity issues at the database level.</p>
</div>

<h3 class="block-title">ENUM Types</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="cm">-- Create a reusable enum type</span>
<span class="kw">CREATE TYPE</span> order_status <span class="kw">AS ENUM</span> (<span class="str">'pending'</span>, <span class="str">'processing'</span>, <span class="str">'shipped'</span>, <span class="str">'delivered'</span>, <span class="str">'cancelled'</span>);

<span class="kw">CREATE</span> <span class="kw">TABLE</span> orders (
  id     <span class="fn">SERIAL</span> <span class="kw">PRIMARY KEY</span>,
  status order_status <span class="kw">DEFAULT</span> <span class="str">'pending'</span>
);

<span class="cm">-- ENUMs have order — you can compare and sort them</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> orders <span class="kw">WHERE</span> status > <span class="str">'processing'</span>;  <span class="cm">-- shipped, delivered, cancelled</span>

<span class="cm">-- Add a new value (append only)</span>
<span class="kw">ALTER TYPE</span> order_status <span class="kw">ADD VALUE</span> <span class="str">'refunded'</span> <span class="kw">AFTER</span> <span class="str">'cancelled'</span>;</pre>
</div>

<h3 class="block-title">Arrays</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="kw">CREATE</span> <span class="kw">TABLE</span> posts (
  id   <span class="fn">SERIAL</span> <span class="kw">PRIMARY KEY</span>,
  tags <span class="fn">TEXT</span>[]   <span class="cm">-- array of text</span>
);

<span class="kw">INSERT INTO</span> posts (tags) <span class="kw">VALUES</span> (<span class="str">'{postgresql,performance,indexes}'</span>);

<span class="cm">-- Array element access (1-indexed)</span>
<span class="kw">SELECT</span> tags[<span class="num">1</span>] <span class="kw">FROM</span> posts;  <span class="cm">-- 'postgresql'</span>

<span class="cm">-- @> contains — does tags contain 'performance'?</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> posts <span class="kw">WHERE</span> tags @> <span class="fn">ARRAY</span>[<span class="str">'performance'</span>];

<span class="cm">-- && overlap — any tag in common?</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> posts <span class="kw">WHERE</span> tags && <span class="fn">ARRAY</span>[<span class="str">'performance'</span>, <span class="str">'indexes'</span>];

<span class="cm">-- ANY — does any element equal a value?</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> posts <span class="kw">WHERE</span> <span class="str">'postgresql'</span> = <span class="kw">ANY</span>(tags);

<span class="cm">-- unnest — expand array to rows</span>
<span class="kw">SELECT</span> <span class="fn">unnest</span>(tags) <span class="kw">AS</span> tag <span class="kw">FROM</span> posts;

<span class="cm">-- array_append, array_remove</span>
<span class="kw">UPDATE</span> posts <span class="kw">SET</span> tags = <span class="fn">array_append</span>(tags, <span class="str">'new'</span>) <span class="kw">WHERE</span> id = <span class="num">1</span>;
<span class="kw">UPDATE</span> posts <span class="kw">SET</span> tags = <span class="fn">array_remove</span>(tags, <span class="str">'new'</span>) <span class="kw">WHERE</span> id = <span class="num">1</span>;</pre>
</div>

<h3 class="block-title">Range Types</h3>
<div class="code-block">
  <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
  <pre class="code"><span class="kw">CREATE</span> <span class="kw">TABLE</span> subscriptions (
  user_id   <span class="fn">INT</span>,
  plan      <span class="fn">TEXT</span>,
  active    <span class="fn">DATERANGE</span>   <span class="cm">-- start and end date as a single column</span>
);

<span class="kw">INSERT INTO</span> subscriptions <span class="kw">VALUES</span>
  (<span class="num">1</span>, <span class="str">'pro'</span>, <span class="str">'[2025-01-01, 2025-12-31]'</span>);

<span class="cm">-- @> contains a date?</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> subscriptions <span class="kw">WHERE</span> active @> <span class="str">'2025-06-15'</span>::<span class="fn">DATE</span>;

<span class="cm">-- && overlaps?</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> subscriptions
<span class="kw">WHERE</span> active && <span class="str">'[2025-06-01, 2025-06-30]'</span>::<span class="fn">DATERANGE</span>;</pre>
</div>

<div class="adv-box">
  <div class="adv-header"><span class="adv-icon">⚡</span><span class="adv-label">Advanced — Generated Columns & Domain Types</span><span class="adv-badge">PATTERN</span></div>
  <div class="adv-body">
    <div class="code-block">
      <div class="code-bar"><div class="code-dots"><div class="code-dot cd1"></div><div class="code-dot cd2"></div><div class="code-dot cd3"></div></div><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">copy</button></div>
      <pre class="code"><span class="cm">-- Generated column: auto-computed from other columns, always in sync</span>
<span class="kw">CREATE</span> <span class="kw">TABLE</span> products (
  price_usd  <span class="fn">NUMERIC</span>(<span class="num">10</span>,<span class="num">2</span>),
  tax_rate   <span class="fn">NUMERIC</span>(<span class="num">4</span>,<span class="num">2</span>),
  price_total <span class="fn">NUMERIC</span>(<span class="num">10</span>,<span class="num">2</span>)
    <span class="kw">GENERATED ALWAYS AS</span> (price_usd * (<span class="num">1</span> + tax_rate)) <span class="kw">STORED</span>
);

<span class="cm">-- Domain type: a custom type with built-in validation</span>
<span class="kw">CREATE DOMAIN</span> positive_int <span class="kw">AS</span> <span class="fn">INT</span>
  <span class="kw">CHECK</span> (VALUE > <span class="num">0</span>);

<span class="kw">CREATE DOMAIN</span> email_address <span class="kw">AS</span> <span class="fn">TEXT</span>
  <span class="kw">CHECK</span> (VALUE ~ <span class="str">'^[^@]+@[^@]+\.[^@]+$'</span>);

<span class="kw">CREATE</span> <span class="kw">TABLE</span> contacts (
  id    <span class="fn">SERIAL</span> <span class="kw">PRIMARY KEY</span>,
  email email_address,   <span class="cm">-- reusable validated type</span>
  score positive_int
);</pre>
    </div>
  </div>
</div>`;

export default function Section20() {
  return <SectionMarkup html={html} />;
}
