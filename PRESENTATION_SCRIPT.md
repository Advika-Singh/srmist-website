# Rethinking srmist.edu.in — presentation script (~10 minutes)

Two speakers: **A** covers the problem, **B** covers the solution and demo. Swap to suit you.
Observations about the original site were made on 5 Nov 2026. The site changes, so re-check the items marked ✔ the day before.

---

## 1 · Title (0:30) — A
**On screen:** "Rethinking srmist.edu.in: find what you need in seconds"
**Say:** "SRMIST's website is the front door for applicants, parents, students and staff. We looked at it the way a first-time visitor would, found where people get stuck, and rebuilt the experience."

## 2 · Who uses it (1:00) — A
**On screen:** four groups: applicant/parent, current student, faculty and staff, international applicant.
**Say:** "An applicant wants programmes, scholarships, placements and a way to apply. A student wants exams and the library. Faculty want their gateway. The test is simple: can each of them reach their goal in about ten seconds?"

## 3 · What wasn't working (2:00) — A
**On screen:** one line per problem. Keep it factual, not harsh.
Open with: "The official site is comprehensive and authoritative. Our point is clarity, not criticism."

1. **A pop-up covers the page on arrival.** ✔ *Show it live.* It hides the content and the main menu before anyone has read anything, and is harder to close on a phone.
2. **Too many choices.** ✔ The home page carries roughly 250 links, a three-tier header, and main-menu items that go nowhere (they link to "#"). Many pages can be reached several ways, so visitors can't tell which is the right one.
3. **Key messages are baked into pictures.** ✔ Headline banners such as the NIRF ranking are images with text in them. That text can't be searched or read aloud by assistive technology, and it doesn't resize cleanly on a phone. *(Check alt text before claiming it is missing.)*
4. **Information that looks out of date or inconsistent.** ✔ Admissions PDFs from 2024–25 are still linked from the home page, menu labels mix "Admissions 2026" and "2027", and public documents give different campus counts (six vs eight) and student numbers (about 53,000 to 85,000). Visitors lose trust when numbers disagree.
5. **Headline statistics don't show real numbers in the page itself.** ✔ The counters (students, departments, programmes) read "0" in the page source and rely on a script to animate them. *(Confirm live that they fill in; if they do, present this as a fragility, not a bug.)*
6. **No guided path.** A visitor has to know that Programme Finder, scholarships and "Apply" live in different places. There is no "what should I do next?"
7. **Heavy, page-builder markup.** ✔ The home page's HTML alone is about 700 KB before images and scripts. *(Insert Lighthouse score for the original: ____ )*
8. **Faculty and staff tools feel like a separate site** with a different look and navigation.

## 4 · Our principles (0:45) — B
**On screen:** Facts first · One clear next step · Keep what's familiar · One design language · Honest data
**Say:** "We kept the structure people already know, but removed the noise and gave every screen one job."

## 5 · Home page (1:30) — B *(demo)*
- Cinematic hero in real, readable text. No pop-up.
- "What do you want to study?" is a live search over the eight fields.
- Three pathways: India, Medical, International.
- Recognition up front, with sources: NAAC A++, NIRF 2025 (11th among universities, 22nd overall), placements 2023–24 (980+ companies, 52 LPA highest, 7.19 LPA average).
**Say:** "The things a parent asks first are on the first screen, in text, and checked against the official site."

## 6 · Navigation (1:00) — B *(demo: hover a menu, then phone width)*
**Say:** "We deliberately kept the official layout: utility strip, logo and quick links, mega menus. Nobody has to relearn it. What changed: menus are grouped, **Faculty & Staff** is highlighted, Admissions has one clear button, and every link was checked (84 external links, none broken). On a phone it becomes a simple accordion."

## 7 · Applying (1:00) — B *(demo)*
**Say:** "Four steps with a progress bar, answers kept as you move between steps, a review screen with edit links, and a confirmation. No guessing where you are."

## 8 · Faculty & staff (0:45) — B *(demo: filter by campus, open contact form)*
**Say:** "A gateway for leadership and resources, and a directory with search and filters for campus, school and designation. Same look and feel as the rest of the site."

## 9 · AI assistant (1:15) — B *(demo: ask about placements, then something off-topic)*
**Say:** "Powered by Gemini, but **grounded**: it answers only from verified SRMIST facts, declines unrelated questions, and only links to real pages. The API key stays on the server and never reaches the browser."
**Demo lines:** "Tell me about placements" · "Who won the cricket world cup?" (it politely declines)

## 10 · Before and after (0:45) — A
| Problem in the original | What we did |
|---|---|
| Pop-up covers the page | No pop-up; content first |
| ~250 links, dead menu items | Grouped mega menus; all links verified |
| Text inside images | Real, readable, resizable text |
| Stale or conflicting numbers | One sourced set (NIRF 2025, NAAC, placements 2023–24) |
| No guided path | Study search, pathways, 4-step application |
| Heavy page-builder markup | Lightweight React app (~74 KB gzipped JS). *(Add Lighthouse: ____ )* |
| Faculty tools feel separate | Same theme and navigation |

## 11 · Honest limits and next steps (0:45) — A
**Say:** "This is a concept. Faculty entries are sample data. The chatbot needs a small server when hosted. We haven't run user testing yet. Next: test with five students and two parents, run a full accessibility audit, and connect real data feeds so numbers can't drift."

## 12 · Close and Q&A (0:30) — both
**Say:** "Same content, same authority, with a clear path from first click to application."

---

### Likely questions
- **Why not just fix the existing site?** A visual and structural redesign sits on top of the same content; our approach shows what's possible without changing the source of truth.
- **How do you know the numbers are right?** They come from srmist.edu.in (NIRF 2025 page, placement and research sections) and are labelled by year.
- **Is the chatbot safe?** The key is server-side, replies are limited to supplied facts, links are checked against an allowlist, and requests are rate-limited.
- **Did you test with users?** Not yet. That's the first next step.

### Before you present
- ✔ Open the original in a fresh browser to show the pop-up.
- ✔ Run `document.querySelectorAll('a').length` in the original home page's console and quote that number.
- ✔ Run Lighthouse on both sites and fill in the blanks above.
- ✔ Check whether the banner images have alt text.
- Start the demo with `npm run dev` and keep a screen recording as a backup.
