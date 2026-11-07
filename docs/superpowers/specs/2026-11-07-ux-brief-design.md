# UX brief: what the redesign must do for prospective students and parents

Source: the owner's written answers on 2026-11-07 (users, challenges, admired features, one weakness to validate, visual trust, homepage, Discover story, leave-out / add-in features, one emerging technology). This file keeps only the requirements; the plan in `docs/superpowers/plans/2026-11-07-ux-brief-plan.md` refers to them by ID.

## Users
Prospective students and parents matter most (courses, fees, placements, admission dates, first impression). Then current students, faculty and staff, researchers, recruiters, alumni. A large share of visitors are on phones with slow data.

## Requirements
- **R1 Findability.** A new visitor reaches programme and admission details within 2–3 clicks.
- **R2 Answers, not just links.** A query like "B.Tech CSE fees" or "last date to apply" gets a short answer card with a source link. Fee numbers stay labelled illustrative until the official schedule is loaded.
- **R3 Clear apply path.** A visible admissions deadline strip and a persistent Apply button on phones.
- **R4 No auto-playing carousels.** Anything that moves by itself has a pause control and respects reduced-motion.
- **R5 Bot protection for DAAS.** After 3 messages the assistant asks for an email and a one-time code before continuing. The limit is enforced by the server, not the browser. (Owner dropped the Telugu idea on 2026-11-07.)
- **R6 Trustworthy AI search.** Answers show their source, have "Was this helpful?", accept voice input where the browser supports it, and are measured without storing personal data.
- **R7 Discover.** A "Student innovation" section (SRMSAT-style cross-department projects, labs, startups, alumni) reachable from the menu, the homepage, and the department directory. Every story has a real source.
- **R8 Ask a current student.** Short honest answers from real students, tagged by topic and department. No invented students or answers.
- **R9 Validation.** A click-depth check in tests and a usability-test script (8–10 people, timed tasks, wrong clicks) with numeric pass marks.

## Non-goals
- Real fee figures (not available to us; stays illustrative).
- A "last updated" field for every statistic on the site (separate data migration).
- Real student answers beyond what is already sourced (needs the students' consent).
- Performance work already done in the earlier phone pass.
