# Usability test: can a new visitor find what they need?

Goal: check whether a first-time visitor reaches programme and admission details in two or three clicks, on the redesign and (for comparison) on srmist.edu.in. This is the check behind requirement R1 in `docs/superpowers/specs/2026-11-07-ux-brief-design.md`.

## Who
8 to 10 people. Aim for half who have never used the SRM site (friends from other colleges, parents) and half juniors who have. At least 4 should use a phone, not a laptop. Give each person the redesign or the official site first, alternating, so order does not skew the result.

## Tasks (read one at a time, do not hint)
1. Find the fee for a B.Tech Computer Science degree.
2. Find the last date to apply for SRMJEEE.
3. Find placement figures or recruiters.
4. Find what kinds of hostel room there are.
5. Find a course that suits you if you like both maths and biology.
6. Find whether a particular faculty member is free this afternoon (staff finder).

## What to record per task
- Success: reached the right page without help (yes or no).
- Time from reading the task to the right page, in seconds. Stop at 120 seconds and mark it failed.
- Wrong clicks: links or menus opened that did not lead toward the answer.
- One sentence: where did they hesitate, and what did they say out loud?

## Pass marks
- At least 80% of tasks succeeded.
- Median time under 60 seconds.
- At most 1 wrong click per task on average.
- No task fails for more than 3 of the 10 people.

A task that misses a mark is a finding, not a verdict: write down the page and the click where people got lost and fix that one place.

## Automated check that runs with the tests
`tests/click-depth.test.js` counts clicks from the home page using the menu data (header buttons and quick links are one click; a menu link is two). It fails if a key page such as admissions, SRMJEEE or placements is pushed more than one click away, or the programme, hostel, staff and student pages more than two.

## After launch: search numbers
Search and the assistant write one line per event to the server log: `[search] {"q":"…","lang":"en","results":3,"clicked":true,"helpful":true}`. Queries are stripped of emails and phone numbers, and nothing else is stored. Collect the lines from the Vercel logs for a week and run them through `summarise()` in `src/lib/searchStats.js`. Watch:
- No-result rate: searches that returned nothing. Lower is better; read the queries that failed and add them to the search index.
- Click rate: searches that ended in opening something.
- Helpful rate: share of "Yes" among the answers people rated.
