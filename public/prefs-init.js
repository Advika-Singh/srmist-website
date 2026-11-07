// Runs before the page paints so a saved dark theme or text size never flashes the wrong way.
// Kept as a separate file because the site's Content-Security-Policy does not allow inline scripts.
;(function () {
  try {
    var root = document.documentElement
    var theme = localStorage.getItem('srm-theme')
    if (theme !== 'dark') theme = 'light' // light unless the person chose dark with the toggle
    root.setAttribute('data-theme', theme)
    var t = parseInt(localStorage.getItem('srm-text') || '0', 10)
    if (t >= -1 && t <= 2) root.setAttribute('data-text', String(t))
  } catch (e) {
    /* storage blocked: the defaults apply */
  }
})()
