---
name: refresh-internships
description: Refresh the Summer 2027 internship tracker. Re-check every position in data/positions.json, find new research internships in human-centered SE and developer experience, update data/updates.json, then commit and push. Use when asked to refresh, update, or check for new internships, or when run on a schedule.
---

# Refresh the internship tracker

The site (GitHub Pages) shows research internships for **Summer 2027** for a PhD student working on
**human-centered software engineering and developer experience**. The best targets are labs whose
researchers publish at **ICSE, FSE, ASE, VL/HCC, CHI, CSCW, UIST**.

Files:
- `data/positions.json`: array of positions (schema below). The page renders straight from it.
- `data/updates.json`: `{ "lastRefreshed": "YYYY-MM-DD", "log": [ {date, summary, changes[]} ] }`, newest first.

## Steps

1. **Read both data files.**

2. **Re-check every existing position.** Fetch its `applyUrl` (and `infoUrl` if needed).
   - A `Watching` entry now has a real Summer 2027 posting → set `status: "Open"`, point `applyUrl`
     at the specific posting, and fill in `deadline`, `pay`, and `requirements` **only from what the posting says**.
   - An `Open` posting is gone or says it is closed → `status: "Closed"`.
   - A link is broken → find the current URL. If you can't, keep the old URL and say so in `notes`.
   - Set `lastChecked` to today on each entry you checked.
   - **Never change `Applied`, `Interviewing`, `Offer`, or `Rejected`.** The user sets those by hand.
     You may still fix the links and the deadline on those entries.

3. **Look for new positions.** Use web search (extended mode) and check these:
   - Company careers pages: Google, Microsoft Research, Microsoft CoreAI, Meta, JetBrains Research,
     GitHub, Adobe Research, IBM Research, Amazon/AWS, Autodesk Research, Apple, Uber, Atlassian,
     Bloomberg, Salesforce, ServiceNow, Sourcegraph, Replit, Anthropic, OpenAI, plus national labs
     (LLNL, Sandia, ORNL, PNNL) for research-software-engineering roles.
   - Aggregators: https://github.com/SimplifyJobs/Summer2027-Internships and https://dion-jy.github.io/phd-intern-board/
   - Queries like: "research intern 2027 developer productivity", "PhD intern 2027 human-AI programming",
     "research intern 2027 software engineering HCI", "UX researcher intern 2027 developer tools".
   - Add a role only if it is a PhD-level research (or research-adjacent) internship for Summer 2027
     (or one that accepts Summer 2027 starts) **and** it relates to developer experience, developer
     productivity, human factors in SE, AI-assisted programming, end-user programming, or SE/HCI.
     Skip pure ML, vision, robotics, and ads roles.
   - Don't add a second entry for the same posting. Match on `applyUrl` and on company + role.

4. **Write each entry so it's easy to read.** `summary` is 1–2 plain sentences about what the role is.
   `whyFit` is one sentence linking the role to HCSE/DevEx and the target venues. Keep each requirement short.

5. **Don't make anything up.** Leave `deadline` as `""` unless the posting states a date. Leave `pay` as `""`
   unless it is stated. Don't guess team names or URLs. Every `applyUrl` must be a page you actually loaded.

6. **Update `data/updates.json`.** Set `lastRefreshed` to today and add a new entry at the **front** of `log`:
   `summary` is 1–2 sentences for the "What's new" banner, and `changes` is a short list such as
   "Added: Meta – Research Scientist Intern, Developer Productivity" or "Google SWE PhD → Closed".
   If nothing changed, still add an entry that says "No changes", so the site shows the check happened.

7. **Validate, then publish.**
   ```bash
   python3 -c "import json; json.load(open('data/positions.json')); json.load(open('data/updates.json'))"
   git add data && git commit -m "Refresh internships: <date>" && git push
   ```

8. **Report back:** what you added, what changed status, and any deadlines in the next 30 days.

## Position schema

```json
{
  "id": "kebab-case-unique-id",
  "company": "", "role": "", "team": "", "location": "",
  "summary": "", "whyFit": "",
  "requirements": [""], "pay": "",
  "focus": ["developer experience" | "developer productivity" | "human factors" | "empirical SE" |
            "AI for code" | "human-AI interaction" | "HCI" | "end-user programming" | "developer tools" | "IDEs" | "..."],
  "venues": ["ICSE", "FSE", "CHI", "..."],
  "status": "Open" | "Watching" | "Applied" | "Interviewing" | "Offer" | "Rejected" | "Closed",
  "deadline": "YYYY-MM-DD" | "",
  "applyUrl": "https://...", "infoUrl": "https://...",
  "notes": "", "added": "YYYY-MM-DD", "lastChecked": "YYYY-MM-DD"
}
```
Reuse existing `focus` tags where possible, because the site's filter dropdown is built from them.
