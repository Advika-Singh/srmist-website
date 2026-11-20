// Sample data so the portal looks alive on first run: made-up teachers and approvers (addresses ending in @srmist.edu.in that
// belong to nobody), and a few pending, approved, rejected and withdrawn items with their log rows. FOR DEMOS ONLY.
// Used by scripts/seed-portal.mjs (Neon) and by `DEMO_MEMORY=1` runs. Dates are relative to today so events stay in the future.

export const DEMO_PEOPLE = [
  { email: 'priya.raman@srmist.edu.in', name: 'Priya Raman', role: 'teacher' },
  { email: 'karthik.subramanian@srmist.edu.in', name: 'Karthik Subramanian', role: 'teacher' },
  { email: 'meena.iyer@srmist.edu.in', name: 'Meena Iyer', role: 'teacher' },
  { email: 'arun.kumar@srmist.edu.in', name: 'Dr. Arun Kumar', role: 'approver' },
  { email: 'lakshmi.narayanan@srmist.edu.in', name: 'Dr. Lakshmi Narayanan', role: 'approver' },
  { email: 'demo.teacher@srmist.edu.in', name: 'Demo Teacher', role: 'teacher' },
  { email: 'demo.approver@srmist.edu.in', name: 'Demo Approver', role: 'approver' },
]

const day = (offset, from = new Date()) => new Date(from.getTime() + offset * 86_400_000 + 5.5 * 3_600_000).toISOString().slice(0, 10)

export async function seed(repo, now = new Date()) {
  const u = {}
  for (const p of DEMO_PEOPLE) u[p.email] = await repo.upsertUser(p)
  const who = (email) => u[email]
  const logRow = (action, item, actor, extra = {}) => ({
    action, item_id: item.id, item_type: item.type, item_title: item.title,
    submitter_id: item.submitter_id, submitter_name: item.submitter_name, submitter_email: item.submitter_email,
    actor_id: actor.id, actor_name: actor.name, actor_email: actor.email, ...extra,
  })
  const submit = async (email, value) => {
    const item = await repo.createItem(value, who(email).id)
    await repo.addLog(logRow('submitted', item, who(email)))
    return item
  }
  const approve = async (item, by) => {
    const at = now.toISOString()
    const out = await repo.setStatus(item.id, { status: 'approved', reviewerId: who(by).id, reviewedAt: at, liveAt: at })
    await repo.addLog(logRow('approved', out, who(by), { approved_at: at, live_at: at }))
  }
  const reject = async (item, by, reason) => {
    const out = await repo.setStatus(item.id, { status: 'rejected', reviewerId: who(by).id, reason, reviewedAt: now.toISOString() })
    await repo.addLog(logRow('rejected', out, who(by), { details: { reason } }))
  }
  const ann = (title, body, extra = {}) => ({ type: 'announcement', title, body, link: null, expires_at: null, event_date: null, start_time: null, end_time: null, venue: null, ...extra })
  const evt = (title, body, event_date, start_time, end_time, venue, extra = {}) => ({ type: 'event', title, body, link: null, expires_at: null, event_date, start_time, end_time, venue, ...extra })

  // approved: these appear on the public pages
  const a1 = await submit('priya.raman@srmist.edu.in', ann('Mid-semester timetable is out', 'The mid-semester examination timetable for all B.Tech programmes is on the Academia portal. Check your hall ticket details and report clashes to your class advisor by Friday.', { expires_at: day(20, now) }))
  await approve(a1, 'arun.kumar@srmist.edu.in')
  const e1 = await submit('karthik.subramanian@srmist.edu.in', evt('Guest lecture: careers in embedded systems', 'An industry speaker talks about careers in embedded systems and answers student questions. Open to all years of Electronics and Computer Science.', day(9, now), '14:00', '15:30', 'Tech Park, Seminar Hall 2', { link: 'https://www.srmist.edu.in/events/' }))
  await approve(e1, 'lakshmi.narayanan@srmist.edu.in')
  const e2 = await submit('meena.iyer@srmist.edu.in', evt('Library orientation for first-year students', 'A walk through the library catalogue, journals access and borrowing rules, followed by a short quiz.', day(14, now), '10:00', '11:00', 'University Library, Reading Hall'))
  await approve(e2, 'arun.kumar@srmist.edu.in')

  // pending: waiting in the approvers' queue
  await submit('priya.raman@srmist.edu.in', ann('Project submission portal opens Monday', 'Final-year project abstracts can be uploaded from Monday. Late submissions need written approval from the project coordinator.', { expires_at: day(30, now) }))
  await submit('meena.iyer@srmist.edu.in', evt('Workshop: academic writing and referencing', 'A hands-on workshop for research scholars on structuring papers and citing sources correctly. Bring a draft you are working on.', day(21, now), '09:30', '12:30', 'Research Building, Room 304', { link: 'https://example.org/register' }))
  await submit('karthik.subramanian@srmist.edu.in', ann('Lab safety briefing for new members', 'All new lab members must attend the safety briefing before they are given access to the equipment.'))

  // rejected: the submitter sees the reason
  const r1 = await submit('karthik.subramanian@srmist.edu.in', ann('Sale: second-hand books', 'Selling engineering textbooks, contact me for prices.'))
  await reject(r1, 'arun.kumar@srmist.edu.in', 'Personal sales are not announcements. Please use the notice board.')
  const r2 = await submit('meena.iyer@srmist.edu.in', evt('Coding contest', 'A contest for everyone.', day(12, now), '10:00', '12:00', 'Lab 5'))
  await reject(r2, 'lakshmi.narayanan@srmist.edu.in', 'Please add the rules, the eligibility and a registration link, then submit again.')

  // withdrawn
  const w1 = await submit('priya.raman@srmist.edu.in', ann('Tutorial on Friday moved', 'The Friday tutorial is moved to Saturday morning.'))
  const out = await repo.setStatus(w1.id, { status: 'withdrawn' })
  await repo.addLog(logRow('withdrawn', out, who('priya.raman@srmist.edu.in')))

  // headless CMS: one live piece of site text, one story waiting for review, one draft. No made-up news goes live.
  if (repo.cmsCreate) {
    const cms = async (email, type, slug, data) => {
      if (await repo.cmsSlugTaken(type, slug)) return null // the seed can be run again
      const it = await repo.cmsCreate({ type, slug, data, authorId: who(email).id })
      await repo.cmsAddEvent({ item_id: it.id, item_type: type, slug, action: 'created', version: 1, actor_id: who(email).id, actor_name: who(email).name, actor_email: email, snapshot: data })
      return it
    }
    const intro = await cms('priya.raman@srmist.edu.in', 'snippet', 'announcements.intro', { key: 'announcements.intro', text: 'Notices and news from across the university, checked by an approver before they appear here.' })
    if (intro) {
      await repo.cmsSetStatus(intro.id, { status: 'published', reviewerId: who('arun.kumar@srmist.edu.in').id, liveData: intro.data, publishedAt: now.toISOString() })
      await repo.cmsAddEvent({ item_id: intro.id, item_type: 'snippet', slug: intro.slug, action: 'published', version: 1, actor_id: who('arun.kumar@srmist.edu.in').id, actor_name: 'Dr. Arun Kumar', actor_email: 'arun.kumar@srmist.edu.in', snapshot: intro.data })
    }
    const story = await cms('karthik.subramanian@srmist.edu.in', 'news', 'demo-story-waiting-for-review', { title: 'Demo story waiting for review', summary: 'A sample story so approvers can try publishing and sending back.', date: day(0, now) })
    if (story) {
      await repo.cmsSetStatus(story.id, { status: 'pending' })
      await repo.cmsAddEvent({ item_id: story.id, item_type: 'news', slug: story.slug, action: 'submitted', version: 1, actor_id: who('karthik.subramanian@srmist.edu.in').id, actor_name: 'Karthik Subramanian', actor_email: 'karthik.subramanian@srmist.edu.in', snapshot: story.data })
    }
    await cms('meena.iyer@srmist.edu.in', 'faq', 'demo-draft-question', { question: 'Demo draft question for the editor?', answer: 'A sample draft answer that is still being written and is not public.', topic: 'other' })
  }
}
