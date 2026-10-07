# Summer 2027 Internship Tracker

A GitHub Pages site that tracks research internships in **human-centered software engineering** and
**developer experience**, focused on labs that publish at ICSE, FSE, VL/HCC, CHI, CSCW, and UIST.

## How it works

- `data/positions.json`: open postings only, each linking directly to its application page.
- `data/updates.json`: refresh history. It feeds the "What's new" banner and the history list.
- `data/watchlist.json`: companies that fit but have no matching posting yet.
- `index.html` + `assets/`: a static page with no build step.
- `.claude/skills/refresh-internships/`: a Claude skill that re-checks every link, finds new postings,
  updates both data files, and commits.

## Refreshing

- **By hand:** in Claude Code, from this repo, run `/refresh-internships`.
- **On a schedule:** in Claude Code, run `/schedule` and create a routine against this GitHub repo, for example
  *"every Monday and Thursday at 8am, run the refresh-internships skill and push the changes"*.

## Tracking your own progress

Change an entry's `status` to `Applied`, `Interviewing`, `Offer`, or `Rejected`. The refresh skill
never overwrites those statuses.

## Local preview

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```
