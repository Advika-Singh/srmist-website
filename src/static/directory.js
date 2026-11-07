// Behaviour for teach.html (Faculty Gateway): the "contact" dialog on the leadership cards.
// Loaded as an external module so the page needs no inline scripts or inline event handlers,
// which lets the Content-Security-Policy forbid inline script entirely.
// The searchable staff directory now lives at /staff-finder (a page of the main site, using the official staff list).

const $ = (...ids) => ids.map((id) => document.getElementById(id)).find(Boolean)

const el = {
  modal: $('contactModal'),
  mName: $('modal-name', 'modal-fac-name'),
  mTitle: $('modal-title', 'modal-fac-title'),
  mEmail: $('modal-email', 'modal-fac-email'),
  mCampus: $('modal-campus', 'modal-fac-campus'),
  mOffice: $('modal-office', 'modal-fac-office'),
  toast: $('toast'),
}

/* ---------- contact dialog ---------- */
let opener = null

function openContact(name, email, title, campus = 'Main Campus', office = 'University Building') {
  if (!el.modal) return
  opener = document.activeElement
  el.mName.textContent = name
  el.mTitle.textContent = title
  el.mEmail.textContent = email
  el.mCampus.textContent = campus
  el.mOffice.textContent = office
  el.modal.classList.add('active')
  el.modal.querySelector('.modal-close').focus()
}

function closeContact() {
  if (!el.modal?.classList.contains('active')) return
  el.modal.classList.remove('active')
  opener?.focus?.()
}

function onSubmit(form) {
  closeContact()
  form.reset()
  el.toast?.classList.add('active')
  setTimeout(() => el.toast?.classList.remove('active'), 4000)
}

/* ---------- events (delegated; no inline handlers anywhere) ---------- */
document.addEventListener('click', (e) => {
  if (e.target === el.modal) return closeContact()
  const t = e.target.closest('[data-action]')
  if (!t) return
  if (t.dataset.action === 'contact') openContact(t.dataset.name, t.dataset.email, t.dataset.title)
  else if (t.dataset.action === 'close') closeContact()
})

document.addEventListener('submit', (e) => {
  const form = e.target.closest('form[data-form="contact"]')
  if (!form) return
  e.preventDefault()
  onSubmit(form)
})

document.addEventListener('keydown', (e) => {
  if (!el.modal?.classList.contains('active')) return
  if (e.key === 'Escape') return closeContact()
  if (e.key === 'Tab') {
    // keep keyboard focus inside the open dialog
    const f = [...el.modal.querySelectorAll('button, input, select, textarea, a[href]')].filter((n) => !n.disabled && n.offsetParent !== null)
    if (!f.length) return
    const first = f[0]
    const last = f[f.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
})
