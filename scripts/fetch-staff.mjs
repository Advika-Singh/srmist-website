// Run: node scripts/fetch-staff.mjs [output folder]   then   node scripts/build-staff.mjs [same folder]
// Reads the official SRMIST staff finder (the same public paginated list the site's own search form uses)
// and saves name, profile link, designation, research areas, photo, plus which campus / college / department / type
// each person is listed under. Sequential, with a pause between requests.
import fs from 'node:fs'
import path from 'node:path'

const dir = path.resolve(process.argv[2] ?? 'scripts/.staff-cache') + path.sep
fs.mkdirSync(dir, { recursive: true })
const BASE = 'https://www.srmist.edu.in'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#8211;/g, '–').replace(/&#8217;/g, '’').replace(/&#038;/g, '&').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim()

async function get(url, opts, tries = 4) {
  for (let t = 0; t < tries; t++) {
    try {
      const r = await fetch(url, { ...opts, signal: AbortSignal.timeout(30000) })
      if (r.ok) return await r.text()
    } catch {}
    await sleep(2000 * (t + 1))
  }
  throw new Error('failed ' + url)
}

async function main() {
  const html = await get(BASE + '/staff-finder/')
  const nonce = html.match(/ajax_display = \{"ajax_url":"[^"]*","nonce":"(\w+)"/)[1]
  const options = (name) => {
    const m = html.match(new RegExp(`<select[^>]*name="${name}"[^>]*>([\\s\\S]*?)</select>`))
    return [...m[1].matchAll(/<option[^>]*value="(\d*)"[^>]*>([\s\S]*?)<\/option>/g)].filter((o) => o[1]).map((o) => [o[1], decode(o[2])])
  }
  const facets = { campus: options('campus'), college: options('college'), department: options('department'), facultyType: options('facultyType') }
  fs.writeFileSync(dir + 'facets.json', JSON.stringify(facets))
  console.log('facets', Object.fromEntries(Object.entries(facets).map(([k, v]) => [k, v.length])))

  const empty = { campus: '', college: '', department: '', faculty: '', facultyType: '', designation: '' }
  const people = new Map() // href -> record
  const parse = (h) => {
    const css = new Map([...h.matchAll(/\.(bx_\w+) \.(_\w+)::before\s*\{[^}]*?url\('([^']+)'\)/g)].map((m) => [m[1] + '|' + m[2], m[3]]))
    const cards = h.split('<div class="staff-card"').slice(1)
    return cards.map((c) => {
      const bx = (c.match(/class="box-wrap (bx_\w+)"/) || [])[1]
      const inner = (c.match(/<a href="[^"]*">\s*<div class="(_\w+)"/) || [])[1]
      const a = c.match(/<h3 class="post-title"><a href="([^"]+)">([\s\S]*?)<\/a>/)
      return {
        name: decode(a?.[2] || ''),
        href: a?.[1],
        desig: decode((c.match(/<div class="designation">([\s\S]*?)<\/div>/) || [])[1] || ''),
        spec: decode((c.match(/<div class="specialization_area">([\s\S]*?)<\/div>/) || [])[1] || ''),
        photo: css.get(bx + '|' + inner) || null,
      }
    })
  }
  const crawl = async (tag, fields, onRow) => {
    let n = 1
    for (;;) {
      const body = new URLSearchParams({ page: String(n), formData: new URLSearchParams({ ...empty, ...fields }).toString(), security: nonce, action: 'list_faculties_default' })
      const h = await get(BASE + '/wp-admin/admin-ajax.php', { method: 'POST', body })
      const rows = parse(h)
      if (!rows.length) break
      rows.forEach(onRow)
      n++
      await sleep(120)
    }
    console.log(tag, 'pages', n - 1, 'people so far', people.size)
  }

  await crawl('base', {}, (r) => {
    if (r.href && !people.has(r.href)) people.set(r.href, { ...r, campus: [], college: [], department: [], type: [] })
  })
  fs.writeFileSync(dir + 'staff-base.json', JSON.stringify([...people.values()]))

  // The list endpoint filters by college, department and faculty type. (It ignores the campus box, which only narrows
  // the college list.) So tag each person from those three crawls...
  const tagInto = (key, id) => (r) => {
    const p = people.get(r.href)
    if (p) p[key].push(id)
    else people.set(r.href, { ...r, campus: [], college: [], department: [], type: [] , [key]: [id] })
  }
  for (const [key, field] of [['college', 'college'], ['type', 'facultyType'], ['department', 'department']]) {
    for (const [id] of facets[field]) await crawl(`${key}:${id}`, { [field]: id }, tagInto(key, id))
    fs.writeFileSync(dir + 'staff-partial.json', JSON.stringify([...people.values()]))
  }

  // ...and work out campus the way the site's own form does: campus -> colleges -> departments.
  const postJson = async (data) => JSON.parse(await get(BASE + '/wp-admin/admin-ajax.php', { method: 'POST', body: new URLSearchParams({ ...data, security: nonce }) }))
  const campusColleges = {}
  for (const [cid] of facets.campus) {
    const res = await postJson({ action: 'filter_college_list', selectedCampusID: cid, selectedCampus: cid })
    campusColleges[cid] = (res.college || []).map((c) => String(c.ID))
    await sleep(120)
  }
  const collegeDepartments = {}
  for (const [id] of facets.college) {
    const res = await postJson({ action: 'filter_department_list', selectedCollegeID: id, selectedCollege: id })
    collegeDepartments[id] = (res.department || []).map((d) => String(d.ID))
    await sleep(120)
  }
  fs.writeFileSync(dir + 'hierarchy.json', JSON.stringify({ campusColleges, collegeDepartments }))
  for (const p of people.values()) {
    const colleges = new Set(p.college)
    for (const [cid, deps] of Object.entries(collegeDepartments)) if (p.department.some((d) => deps.includes(d))) colleges.add(cid)
    p.college = [...colleges]
    p.campus = Object.entries(campusColleges).filter(([, cs]) => cs.some((c) => colleges.has(c))).map(([id]) => id)
  }
  fs.writeFileSync(dir + 'staff-all.json', JSON.stringify([...people.values()]))
  console.log('DONE', people.size, 'with campus', [...people.values()].filter((p) => p.campus.length).length)
}
main().catch((e) => {
  console.error('FAILED', e.message)
  process.exit(1)
})
