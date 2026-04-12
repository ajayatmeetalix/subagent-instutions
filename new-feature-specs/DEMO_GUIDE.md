# Demo Guide

Dev server: `npx next dev` → `http://localhost:3000`

---

## Demo 1: Estate list — status badges

**What you're showing:** Estate pipeline health at a glance.

1. Load `http://localhost:3000`
2. The estates table renders with the Status column showing colored pill badges:
   - Green **Active** — most rows
   - Blue **Completed** — Bunny 2Folger
   - Red **Churned** — Luke Skywalker
3. **Microsoft Zune** is highlighted in red — this is the primary demo estate (all jurisdiction features are wired to it)

---

## Demo 2: Jobs board — all four kanban columns

**What you're showing:** A live, multi-status jobs board for a probate estate.

1. Click the **Microsoft Zune** row (highlighted in red)
2. In the left sidebar, click **Jobs Board**
3. All four columns are populated:
   - **To Do** — "Validate Asset Classification" with a red **High** priority badge
   - **In Progress** — "Publish Creditor Notice in Newspaper" with a red **High** badge
   - **Awaiting Review** — "Coordinate Probate Attorney Engagement" with an amber **Medium** badge
   - **Completed** — three admin tasks

---

## Demo 3: Priority filter

**What you're showing:** Filtering the board to focus on critical work.

1. On the Jobs Board (from Demo 2)
2. In the toolbar, change the **Priority** dropdown to **High**
3. Only the two high-priority tasks remain — all other columns empty out
4. Switch back to **Priority** to restore all tasks

---

## Demo 4: Jurisdiction deep-link

**What you're showing:** Jurisdiction context and case status accessible at a glance, without cluttering the board.

1. On the Jobs Board for Microsoft Zune
2. Below the Executor(s) line in the estate header, two lines are visible:
   - A small purple link: **"Los Angeles County, CA · View jurisdiction rules"**
   - A muted line: **"Case 24STPB01882 · Probate — Independent Administration"**
3. Click the purple link — opens `/probate-research?state=california&county=los-angeles-county` directly pre-loaded on Los Angeles County
4. All jurisdiction detail (local requirements, fees, timelines, e-filing, courthouse info) is available in the Research Tool without interrupting the board

---

## Demo 5: Small estate threshold — SAUL task modal

**What you're showing:** Automatic small estate eligibility detection surfaced in context.

The $485k mock estate correctly exceeds California's threshold. This is evaluated and shown inside the **t1 modal** (Validate Legal Administration Path) — not on the board itself.

1. Complete the SAUL workflow through Demo 6 steps 1–3 to reach the t1 modal
2. The modal shows: SEA threshold evaluation ($485k vs $184,500 CA threshold) — flagged as **not eligible**
3. To see an eligible estate, find `SAUL_LEGAL_PATH_RESPONSE` (~line 320) in `app/page.tsx` and change `countable_value: 485000` to `countable_value: 44200`, then re-open the t1 modal

---

## Demo 6: SAUL workflow — the existing validation sequence

**What you're showing:** The full AI-assisted probate task sequence.

Starting from the Jobs Board for Microsoft Zune:

1. **t2 starts in "Processing"** — amber spinner badge is visible on the card. After ~5 seconds it becomes clickable (or shows a red "Error" badge — ~10% chance, just hit Retry).
2. **Click t2** (Validate Asset Classification) → asset classification modal. 10 assets classified with confidence scores, bucket labels, rationale. Supports overrides with required reason.
3. **Approve t2** → t1 (Validate Legal Administration Path) becomes visible in To Do. Click it → SEA threshold evaluation ($485k vs $184,500 CA threshold) and IAEA rationale.
4. **Approve t1** → t3 (Validate Probate Plan) becomes visible → full multi-track plan: Probate, Trust, SEA, and Non-probate tracks with action items and form names.

---

## Demo 7: Probate Research Tool

**What you're showing:** The full jurisdiction reference panel, standalone.

1. Navigate to `http://localhost:3000/probate-research`

2. **Search:** Type `jefferson` — filters to Jefferson County across multiple states, showing how the tool handles ~3,100 counties.

3. **Click Jefferson County, Alabama** — right panel loads with all cards:
   - Quick Reference (state-level: small estate threshold, filing deadline, creditor period)
   - Overview — sentence-split paragraphs via `formatProse()`, not a wall of concatenated text
   - Fees and Estimated Timelines
   - Courthouse — address, phone with copy-to-clipboard, hours
   - E-Filing status
   - Filing Steps — numbered procedure list
   - Local Requirements — `formatProse()` applied (Bessemer Cutoff note appears here for the Bessemer Division)
   - Forms with direct court links
   - FAQs collapsible accordion
   - Resources

4. **E-filing filter:** Select "E-Filing Required" in the top bar — left list filters to only e-filing counties. Green lightning bolt icons on list rows correspond.

5. **State dropdown:** Select "California" → narrows to 58 CA counties. Click "Los Angeles County" to see the same jurisdiction as the demo estate.

6. **Shareable URLs:** Every selection updates the URL (e.g. `?state=california&county=los-angeles-county`). Reload and the exact selection restores.

---

## Known gaps (not yet built)

| Feature | Status |
|---------|--------|
| t1 and t3 task modals | Only appear after approving prior SAUL tasks in sequence |
| t4 task modal | Only appears after the "add asset" flow inside t2 |
| Jurisdiction panel inside task modals | Sprint 3 — not built yet |
| Forms checklist in task modal | Sprint 3 — not built yet |
| Publication newspaper auto-fill | Sprint 3 — not built yet |
