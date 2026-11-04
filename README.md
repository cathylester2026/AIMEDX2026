# By Design · Arthur's Return (v0.3, short facilitated game)

About 30 minutes of play and a 10-minute debrief. One facilitator screen (projector) and one phone per table.
Standalone: this repo and its own Supabase project do not touch AIMedX 9.5 or the 2026 short build.

## Set up in the browser (no local install)

### 1. Supabase (new project)
1. supabase.com → New project.
2. SQL Editor → New query → paste all of `sql/supabase_schema.sql` → Run. The last result should list `bd_sessions` and `bd_tables` with `rls = true`.
3. Project Settings → API. Copy the **Project URL** and the **anon public** key.

### 2. GitHub (new repository)
1. Create a new repository, then Add file → Upload files, and drag in the *contents* of this folder (everything except `.github`).
2. Add file → Create new file. Name it `.github/workflows/deploy.yml` (typing the slashes creates the folders) and paste the contents of `.github/workflows/deploy.yml` from this package.
3. Settings → Secrets and variables → Actions → New repository secret. Add both:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Settings → Pages → Source: **GitHub Actions**.
5. Actions tab → wait for "Deploy to GitHub Pages" to finish. Your site is `https://<you>.github.io/<repo>/`.

### 3. Check before the room fills
Open `https://<you>.github.io/<repo>/#/check`. Every line should be green. The line **"Read the table back"** is the exact test for the "session not found" problem: it fails with a plain-English reason if the row is not visible.
If you change secrets, re-run the workflow (Actions → Deploy → Run workflow). Keys are baked in at build time.

## Running a room
- Facilitator: open the site → *Facilitate a room* → project the screen. Use Next/Back at the top. Notes (Say / Ask) sit at the bottom and can be hidden.
- Tables: open the site (or scan the QR) → *Join a table* → code + table number. Phones at the same table share one table state.
- Solo: *Play on your own* needs no Supabase.

## Images
`public/img` has the 8 base images. The reveal looks for state-specific images and uses a colour-treated base image if they are missing. To add them, drop 1200×800 JPGs named exactly as in `IMAGE_PROMPTS.md` into `public/img`; no code change needed.

## Rules in one screen
- Budget 8 Capital / 9 Change. Up to 3 investments before moment 1; one move in the learning round (add, swap, or hold); 4 maximum at the end.
- Each moment is **Helped**, **Helped, but fragile**, **No direct effect**, or **Hurt**.
- **Hurt** has one cause: an AI tool that faces Arthur (navigation, recovery assistant, monitoring) with no person behind it. Hand-off ownership backs navigation and the assistant. Staffed review covers up to 2 tools, and 1 in the surge.
- "Holds" is a hard gate. Anything without its funded person or space is shown as **Designed, not yet operational**.
- All rules live in `src/engine.js`. Costs, thresholds and the Independence/Continuity requirements are at the top of that file.

## Tests (optional, needs Node)
`npm install` then `npm test` runs the rule checks and an exhaustive pass over every legal play.
