// What the website reads from the headless CMS: only live, published content. Plain text only, so it is safe to show as text.
// Every reader has a fallback: if the CMS is empty or unreachable, the page shows its built-in wording and carries on.
import { useEffect, useState } from 'react'

const get = (path) => fetch(`/api/public/content${path}`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))

/** The live items of one type, newest first. `null` while loading, `[]` when there are none or the CMS cannot be reached. */
export function useContentList(type, limit = 20) {
  const [items, setItems] = useState(null)
  useEffect(() => {
    let live = true
    get(`?type=${encodeURIComponent(type)}&limit=${limit}`)
      .then((d) => live && setItems(d.items.map((i) => ({ slug: i.slug, publishedAt: i.published_at, ...i.data }))))
      .catch(() => live && setItems([]))
    return () => { live = false }
  }, [type, limit])
  return items
}

/** One piece of site text by its key, or the fallback while loading, when it is missing, or when the CMS is down. */
export function useSnippet(key, fallback) {
  const [text, setText] = useState(fallback)
  useEffect(() => {
    let live = true
    get(`/snippet/${encodeURIComponent(key)}`)
      .then((d) => live && d.item?.data?.text && setText(d.item.data.text))
      .catch(() => {})
    return () => { live = false }
  }, [key])
  return text
}
