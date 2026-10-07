const STATUS_ORDER = ["Open", "Interviewing", "Applied", "Offer", "Rejected", "Closed"];
const DAY = 86400000;

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "");
const fmtDate = (d) => new Date(d + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
const getJson = (path) => fetch(path, { cache: "no-cache" }).then((r) => r.json());

let positions = [];

function daysUntil(date) {
  if (!date) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.round((new Date(date + "T00:00:00") - today) / DAY);
}

function deadlineHtml(p) {
  const d = daysUntil(p.deadline);
  if (d === null) return "Rolling / no deadline";
  const cls = d < 0 ? "past" : d <= 21 ? "soon" : "";
  const rel = d < 0 ? "passed" : d === 0 ? "today" : `${d} days left`;
  return `<span class="${cls}">Due ${fmtDate(p.deadline)} · ${rel}</span>`;
}

function card(p) {
  const apply = safeUrl(p.applyUrl);
  const reqs = (p.requirements || []).map((r) => `<li>${esc(r)}</li>`).join("");
  const details = reqs || p.notes
    ? `<details><summary>Requirements &amp; notes</summary>${reqs ? `<ul>${reqs}</ul>` : ""}${p.notes ? `<p>${esc(p.notes)}</p>` : ""}</details>`
    : "";
  const tags = [...(p.focus || []), ...(p.venues || [])];
  return `<article class="card">
    <div class="card-top">
      <div>
        <div class="company">${esc(p.company)}</div>
        <div class="role">${esc(p.role)}</div>
      </div>
      <span class="status" data-s="${esc(p.status)}">${esc(p.status)}</span>
    </div>
    <div class="meta">${esc(p.location)}${p.pay ? `<span class="sep">·</span>${esc(p.pay)}` : ""}<span class="sep">·</span>${deadlineHtml(p)}</div>
    ${p.summary ? `<p class="summary">${esc(p.summary)}</p>` : ""}
    ${p.whyFit ? `<p class="fit"><b>Why it fits:</b> ${esc(p.whyFit)}</p>` : ""}
    ${details}
    ${tags.length ? `<div class="chips">${tags.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>` : ""}
    ${apply ? `<a class="btn" href="${esc(apply)}" target="_blank" rel="noopener">Apply →</a>` : ""}
  </article>`;
}

function sorted(list, key) {
  const deadline = (a, b) => (a.deadline || "9999").localeCompare(b.deadline || "9999");
  const by = {
    deadline: (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || deadline(a, b),
    company: (a, b) => a.company.localeCompare(b.company),
    added: (a, b) => (b.added || "").localeCompare(a.added || ""),
  };
  return [...list].sort(by[key] || by.deadline);
}

function render() {
  const q = $("q").value.trim().toLowerCase();
  const fo = $("focus").value;
  const shown = sorted(positions.filter((p) =>
    (!fo || (p.focus || []).includes(fo)) &&
    (!q || JSON.stringify(p).toLowerCase().includes(q))
  ), $("sort").value);
  $("list").innerHTML = shown.length ? shown.map(card).join("") : `<p class="empty">No positions match.</p>`;
}

function renderStats(watchCount) {
  const count = (...s) => positions.filter((p) => s.includes(p.status)).length;
  const soon = positions.filter((p) => { const d = daysUntil(p.deadline); return d !== null && d >= 0 && d <= 30; }).length;
  const stats = [["Open postings", count("Open")], ["Applied", count("Applied", "Interviewing", "Offer")], ["Due in 30 days", soon], ["On watch list", watchCount]];
  $("stats").innerHTML = stats.map(([l, n]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join("");
}

function renderWatch(watch) {
  $("watch").innerHTML = watch.map((w) => {
    const url = safeUrl(w.url);
    return `<li><div><div>${url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(w.company)}</a>` : esc(w.company)}</div>
      <div class="what">${esc(w.what)}</div></div>
      ${w.lastChecked ? `<span class="when">checked ${esc(w.lastChecked)}</span>` : ""}</li>`;
  }).join("");
}

function renderUpdates(u) {
  if (!u) return;
  if (u.lastRefreshed) $("refreshed").textContent = `Last refreshed ${fmtDate(u.lastRefreshed)}`;
  const log = u.log || [];
  if (!log.length) return;
  $("whatsnew").hidden = false;
  $("whatsnew").innerHTML = `<p class="when">What's new · ${fmtDate(log[0].date)}</p><p>${esc(log[0].summary)}</p>`;
  $("history").hidden = false;
  $("log").innerHTML = log.map((e) => `<li><span class="when">${esc(e.date)}</span>${esc((e.changes || []).join("; ") || e.summary)}</li>`).join("");
}

async function load() {
  const [pos, watch, upd] = await Promise.all([
    getJson("data/positions.json"),
    getJson("data/watchlist.json").catch(() => []),
    getJson("data/updates.json").catch(() => null),
  ]);
  positions = pos;
  $("focus").insertAdjacentHTML("beforeend",
    [...new Set(positions.flatMap((p) => p.focus || []))].sort().map((f) => `<option>${esc(f)}</option>`).join(""));
  renderStats(watch.length);
  renderWatch(watch);
  renderUpdates(upd);
  render();
}

["q", "focus", "sort"].forEach((id) => $(id).addEventListener("input", render));
load().catch((e) => { $("list").innerHTML = `<p class="empty">Couldn't load data (${esc(e.message)}).</p>`; });
