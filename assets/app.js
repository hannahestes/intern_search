const STATUS_ORDER = ["Open", "Interviewing", "Applied", "Watching", "Offer", "Rejected", "Closed"];
const DAY = 86400000;

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "");
const fmtDate = (d) => new Date(d + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

let positions = [];

function daysUntil(date) {
  if (!date) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.round((new Date(date + "T00:00:00") - today) / DAY);
}

function deadlineHtml(p) {
  const d = daysUntil(p.deadline);
  if (d === null) return `<span class="deadline">Deadline: rolling / TBD</span>`;
  const cls = d < 0 ? "past" : d <= 21 ? "soon" : "";
  const rel = d < 0 ? "passed" : d === 0 ? "today" : `${d} days left`;
  return `<span class="deadline ${cls}">Due ${fmtDate(p.deadline)} · ${rel}</span>`;
}

function card(p) {
  const apply = safeUrl(p.applyUrl);
  const info = safeUrl(p.infoUrl);
  const reqs = (p.requirements || []).map((r) => `<li>${esc(r)}</li>`).join("");
  const extra = reqs || p.notes || p.pay
    ? `<details><summary>Requirements &amp; notes</summary>
        ${reqs ? `<ul>${reqs}</ul>` : ""}
        ${p.pay ? `<p><b>Pay:</b> ${esc(p.pay)}</p>` : ""}
        ${p.notes ? `<p>${esc(p.notes)}</p>` : ""}
      </details>` : "";
  return `<article class="card">
    <div class="card-top">
      <div>
        <div class="company">${esc(p.company)}</div>
        <div class="role">${esc(p.role)}</div>
      </div>
      <div class="badges"><span class="status" data-s="${esc(p.status)}">${esc(p.status)}</span></div>
    </div>
    <div class="meta">${esc(p.team)} · ${esc(p.location)}</div>
    <div class="meta">${deadlineHtml(p)}</div>
    ${p.summary ? `<p class="summary">${esc(p.summary)}</p>` : ""}
    ${p.whyFit ? `<p class="fit"><b>Why it fits:</b> ${esc(p.whyFit)}</p>` : ""}
    ${extra}
    <div class="chips">
      ${(p.focus || []).map((f) => `<span class="chip">${esc(f)}</span>`).join("")}
      ${(p.venues || []).map((v) => `<span class="chip venue">${esc(v)}</span>`).join("")}
    </div>
    <div class="actions">
      ${apply ? `<a class="btn primary" href="${esc(apply)}" target="_blank" rel="noopener">${p.status === "Open" ? "Apply" : "Check openings"} →</a>` : ""}
      ${info ? `<a class="btn" href="${esc(info)}" target="_blank" rel="noopener">Learn more</a>` : ""}
    </div>
  </article>`;
}

function sorted(list, key) {
  const by = {
    priority: (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || (a.deadline || "9999").localeCompare(b.deadline || "9999"),
    deadline: (a, b) => (a.deadline || "9999").localeCompare(b.deadline || "9999"),
    company: (a, b) => a.company.localeCompare(b.company),
    added: (a, b) => (b.added || "").localeCompare(a.added || ""),
  };
  return [...list].sort(by[key] || by.priority);
}

function render() {
  const q = $("q").value.trim().toLowerCase();
  const st = $("status").value;
  const fo = $("focus").value;
  const shown = sorted(positions.filter((p) =>
    (!st || p.status === st) &&
    (!fo || (p.focus || []).includes(fo)) &&
    (!q || JSON.stringify(p).toLowerCase().includes(q))
  ), $("sort").value);
  $("list").innerHTML = shown.length ? shown.map(card).join("") : `<p class="empty">No positions match.</p>`;
}

function renderStats() {
  const count = (s) => positions.filter((p) => p.status === s).length;
  const soon = positions.filter((p) => { const d = daysUntil(p.deadline); return d !== null && d >= 0 && d <= 30; }).length;
  const stats = [["Tracked", positions.length], ["Open now", count("Open")], ["Watching", count("Watching")], ["Applied", count("Applied") + count("Interviewing")], ["Due in 30 days", soon]];
  $("stats").innerHTML = stats.map(([l, n]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join("");
}

function renderUpdates(u) {
  if (!u) return;
  if (u.lastRefreshed) $("refreshed").textContent = `Last refreshed ${fmtDate(u.lastRefreshed)}`;
  const log = u.log || [];
  if (log[0]) $("whatsnew").innerHTML = `<p class="when">What's new · ${fmtDate(log[0].date)}</p><p>${esc(log[0].summary)}</p>`;
  if (log.length) $("log").innerHTML = `<h2>Refresh history</h2><ol>${log.map((e) =>
    `<li><span class="when">${esc(e.date)}</span>${esc((e.changes || []).join("; ") || e.summary)}</li>`).join("")}</ol>`;
}

function fillSelect(id, values) {
  $(id).insertAdjacentHTML("beforeend", values.map((v) => `<option>${esc(v)}</option>`).join(""));
}

async function load() {
  const [pos, upd] = await Promise.all([
    fetch("data/positions.json", { cache: "no-cache" }).then((r) => r.json()),
    fetch("data/updates.json", { cache: "no-cache" }).then((r) => r.json()).catch(() => null),
  ]);
  positions = pos;
  fillSelect("status", STATUS_ORDER.filter((s) => positions.some((p) => p.status === s)));
  fillSelect("focus", [...new Set(positions.flatMap((p) => p.focus || []))].sort());
  renderStats();
  renderUpdates(upd);
  render();
}

["q", "status", "focus", "sort"].forEach((id) => $(id).addEventListener("input", render));
load().catch((e) => { $("list").innerHTML = `<p class="empty">Couldn't load data (${esc(e.message)}).</p>`; });
