"""Pull the concrete evidence (heaviest files, third parties, exact contrast failures) from one Lighthouse JSON."""
import json, re, sys
from collections import defaultdict
from urllib.parse import urlparse

src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src, encoding='utf8'))
A = d['audits']

def items(aid):
    it = (A.get(aid, {}).get('details') or {}).get('items') or []
    return it if isinstance(it, list) else []

reqs = items('network-requests')
rows = []
for r in reqs:
    rows.append({
        'url': r.get('url', ''), 'type': r.get('resourceType'), 'bytes': r.get('transferSize') or 0,
        'ms': round((r.get('networkEndTime', 0) or 0) - (r.get('networkRequestTime', 0) or 0)),
        'status': r.get('statusCode'), 'host': urlparse(r.get('url', '')).netloc,
    })
rows.sort(key=lambda x: -x['bytes'])
by_host = defaultdict(lambda: [0, 0])
for r in rows:
    by_host[r['host']][0] += 1
    by_host[r['host']][1] += r['bytes']
first = urlparse(d.get('finalDisplayedUrl') or d['requestedUrl']).netloc.replace('www.', '')
third = {h: v for h, v in by_host.items() if first not in h}

contrast = []
for it in items('color-contrast'):
    node = it.get('node', {})
    contrast.append({'snippet': (node.get('snippet') or '')[:90], 'explanation': (node.get('explanation') or '')[:300]})

def count(aid):
    return len(items(aid))

res = {
    'url': d.get('finalDisplayedUrl'),
    'top_requests': rows[:12],
    'by_type': {t: {'n': sum(1 for r in rows if r['type'] == t), 'bytes': sum(r['bytes'] for r in rows if r['type'] == t)} for t in sorted({r['type'] for r in rows})},
    'third_party_hosts': sorted(([h, v[0], v[1]] for h, v in third.items()), key=lambda x: -x[2])[:12],
    'third_party_total': {'requests': sum(v[0] for v in third.values()), 'bytes': sum(v[1] for v in third.values())},
    'video_requests': [r for r in rows if 'googlevideo' in r['url'] or r['url'].endswith(('.mp4', '.webm'))][:6],
    'fonts': [r for r in rows if r['type'] == 'Font'],
    'largest_images': [r for r in rows if r['type'] == 'Image'][:8],
    'js_files': {'count': sum(1 for r in rows if r['type'] == 'Script'), 'bytes': sum(r['bytes'] for r in rows if r['type'] == 'Script')},
    'css_files': {'count': sum(1 for r in rows if r['type'] == 'Stylesheet'), 'bytes': sum(r['bytes'] for r in rows if r['type'] == 'Stylesheet')},
    'first_party_protocols': dict(__import__('collections').Counter(
        (r.get('protocol') or 'unknown') for r in reqs if first in urlparse(r.get('url', '')).netloc)),
    'contrast_failures': {'count': len(contrast), 'examples': contrast[:6]},
    'a11y_counts': {k: count(k) for k in ['link-name', 'button-name', 'target-size', 'color-contrast', 'image-alt', 'label', 'heading-order', 'aria-hidden-focus', 'tabindex', 'html-has-lang', 'document-title', 'meta-viewport', 'select-name', 'frame-title', 'list', 'listitem']},
    'cookies_third_party': [i.get('name') or i.get('url') for i in items('third-party-cookies')][:8],
    'main_thread': [{'group': i.get('groupLabel'), 'ms': round(i.get('duration', 0))} for i in items('mainthread-work-breakdown')][:6],
}
json.dump(res, open(out, 'w', encoding='utf8'), indent=1, ensure_ascii=False)

print('TOP REQUESTS')
for r in rows[:10]:
    print(f"  {r['bytes'] / 1024:8.0f} KB  {r['type']:11s} {r['url'][:100]}")
print('THIRD PARTY (host, requests, KB):', [(h, n, round(b / 1024)) for h, n, b in res['third_party_hosts'][:8]])
print('THIRD PARTY TOTAL:', res['third_party_total'])
print('FIRST-PARTY PROTOCOLS:', res['first_party_protocols'])
print('JS:', res['js_files'], '| CSS:', res['css_files'])
print('FONTS:', len(res['fonts']), 'files,', round(sum(f['bytes'] for f in res['fonts']) / 1024), 'KB')
print('A11Y counts:', {k: v for k, v in res['a11y_counts'].items() if v})
print('CONTRAST examples:')
for c in contrast[:5]:
    print('  -', c['explanation'][:230].replace('\n', ' '))
print('MAIN THREAD:', res['main_thread'])
