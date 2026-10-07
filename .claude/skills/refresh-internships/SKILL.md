---
name: refresh-internships
description: Refresh the Summer 2027 internship tracker. Re-check every posting in data/positions.json and every company in data/watchlist.json, add new research internships in human-centered SE and developer experience, update data/updates.json, then commit and push. Use when asked to refresh, update, or check for new internships, or when run on a schedule.
---

# Refresh the internship tracker

The site (GitHub Pages) lists **Summer 2027** internships for a PhD student working on
**human-centered software engineering and developer experience**. The best targets are labs whose
researchers publish at **ICSE, FSE, ASE, VL/HCC, CHI, CSCW, UIST**.

## The one rule that matters most

`data/positions.json` holds **only real job postings**. Every `applyUrl` must go to the posting itself,
the page with the Apply button. A careers homepage, a search page, or a team page is not allowed.
A company that fits but has no matching posting yet belongs in `data/watchlist.json`.

## Files

- `data/positions.json`: open postings (schema below)
- `data/watchlist.json`: `[{company, what, url, lastChecked}]`, companies to keep checking. `url` may be a careers search page.
- `data/updates.json`: `{ "lastRefreshed": "YYYY-MM-DD", "log": [ {date, summary, changes[]} ] }`, newest first

## Steps

1. **Read all three data files.**

2. **Re-check every position.** Load its `applyUrl`.
   - The posting is gone, returns 404, or says it is closed → `status: "Closed"`. Remove entries that have been
     `Closed` for more than 30 days.
   - Update `deadline`, `pay`, and `requirements` if the posting changed. Set `lastChecked` to today.
   - **Never change `Applied`, `Interviewing`, `Offer`, or `Rejected`.** The user sets those by hand.

3. **Check every watch-list company and look for new postings.** The job-board APIs below are more
   reliable than web search, so use them first:
   - **Workday** (Adobe `adobe.wd5/external_experienced`, Autodesk `autodesk.wd1/uni`, and others):
     `POST https://<tenant>.<wdN>.myworkdayjobs.com/wday/cxs/<tenant>/<site>/jobs` with
     `{"appliedFacets":{},"limit":20,"offset":0,"searchText":"2027 Intern Research"}`.
     For details, `GET .../wday/cxs/<tenant>/<site><externalPath>` and read `jobPostingInfo`.
     The apply URL is `https://<tenant>.<wdN>.myworkdayjobs.com/en-US/<site><externalPath>`.
   - **Microsoft:** `GET https://apply.careers.microsoft.com/api/pcsx/search?domain=microsoft.com&query=research%20intern&location=United%20States&start=0`
     (paginate `start` by 10). For details, use `.../api/pcsx/position_details?domain=microsoft.com&position_id=<id>`.
     The apply URL is `https://apply.careers.microsoft.com/careers/job/<id>`.
   - **Amazon:** `GET https://www.amazon.jobs/en/search.json?base_query=applied%20scientist%20intern%202027&loc_query=United%20States&result_limit=40&sort=recent`
   - **Google:** search for `site:google.com/about/careers "Summer 2027" PhD intern`. Google job pages embed
     **other** jobs' data too, so take pay and deadline only from the text right after "Minimum qualifications"
     and the "application window" sentence, and check that the location is in the US.
   - **Meta, IBM, JetBrains, GitHub:** use web search (extended mode) and WebFetch on the posting.
     Meta job IDs expire, so confirm that the page loads.
   - Aggregators to scan: https://github.com/SimplifyJobs/Summer2027-Internships and https://dion-jy.github.io/phd-intern-board/
   - Also try: Apple, Uber, Atlassian, Bloomberg, Salesforce, ServiceNow, Sourcegraph, Replit, Anthropic, OpenAI,
     and the national labs (LLNL, Sandia, ORNL, PNNL) for research-software-engineering roles.

   **What to include:** PhD-level research or research-adjacent roles (research intern, UX research intern,
   applied/data scientist intern, or SWE intern on developer tools) for Summer 2027, located in the US or Canada,
   that relate to developer experience or productivity, human factors in SE, AI-assisted programming,
   end-user programming, or SE/HCI. Skip pure ML, vision, robotics, ads, and AR-hardware roles.
   Don't add a second entry for the same posting; match on `applyUrl` and on company + role.

   When a watch-list company posts a fitting role, add it to `positions.json` and remove it from the watch list.
   Update `lastChecked` on every watch-list entry you checked.

4. **Write each entry so it's easy to read.** `summary` is 1–2 plain sentences about what the role is.
   `whyFit` is one honest sentence linking it to HCSE/DevEx and the venues; say "stretch fit" when it is one.
   Keep each requirement short.

5. **Don't make anything up.** `deadline` and `pay` come only from the posting's own text, otherwise `""`.
   Every `applyUrl` must be a page you actually loaded in this run.

6. **Update `data/updates.json`.** Set `lastRefreshed` to today and add a new entry at the **front** of `log`
   (1–2 sentence `summary` plus short `changes` items such as "Added: Meta – Research Scientist Intern, HCI"
   or "Closed: Adobe 2027 Research Intern"). If nothing changed, still add an entry that says "No changes".

7. **Validate, then publish.**
   ```bash
   python3 -c "import json; [json.load(open(f'data/{f}.json')) for f in ('positions','watchlist','updates')]"
   git add data && git commit -m "Refresh internships: <date>" && git push
   ```

8. **Report back:** what you added, what closed, and any deadlines in the next 30 days.

## Position schema

```json
{
  "id": "kebab-case-unique-id",
  "company": "", "role": "", "location": "",
  "summary": "", "whyFit": "",
  "requirements": [""], "pay": "",
  "focus": ["developer experience" | "developer productivity" | "empirical SE" | "AI for code" |
            "human-AI interaction" | "HCI" | "end-user programming" | "developer tools" | "..."],
  "venues": ["ICSE", "FSE", "CHI", "..."],
  "status": "Open" | "Applied" | "Interviewing" | "Offer" | "Rejected" | "Closed",
  "deadline": "YYYY-MM-DD" | "",
  "applyUrl": "https://<the posting itself>",
  "notes": "", "added": "YYYY-MM-DD", "lastChecked": "YYYY-MM-DD"
}
```
Reuse existing `focus` tags where possible, because the filter dropdown is built from them.
