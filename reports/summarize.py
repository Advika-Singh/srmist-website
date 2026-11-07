"""Condense Lighthouse JSON files into one compact JSON per run set.
Usage: summarize.py <lighthouse-dir> <out.json>"""
import glob, json, os, sys

src, out = sys.argv[1], sys.argv[2]
CATS = ['performance', 'accessibility', 'best-practices', 'seo']
METRICS = {
    'first-contentful-paint': 'FCP', 'largest-contentful-paint': 'LCP', 'total-blocking-time': 'TBT',
    'cumulative-layout-shift': 'CLS', 'speed-index': 'SI', 'interactive': 'TTI', 'server-response-time': 'TTFB',
}

def items_of(a):
    d = a.get('details') or {}
    its = d.get('items') or []
    return its if isinstance(its, list) else []

def sample(it):
    if not isinstance(it, dict):
        return str(it)[:110]
    node = it.get('node') if isinstance(it.get('node'), dict) else {}
    src = it.get('source') if isinstance(it.get('source'), dict) else {}
    url = it.get('url') if isinstance(it.get('url'), str) else ''
    return (node.get('snippet') or url or src.get('url') or str(it)[:90])[:110]

pages = []
for f in sorted(glob.glob(os.path.join(src, '*'))):
    if f.endswith('.html'):
        continue
    try:
        d = json.load(open(f, encoding='utf8'))
    except Exception:
        continue
    audits = d['audits']
    page = {
        'url': d.get('finalDisplayedUrl') or d['requestedUrl'],
        'form_factor': d['configSettings'].get('formFactor'),
        'scores': {c: round((d['categories'][c]['score'] or 0) * 100) for c in CATS if c in d['categories']},
        'metrics': {},
        'transfer_bytes': audits.get('total-byte-weight', {}).get('numericValue'),
        'requests': len(items_of(audits.get('network-requests', {}))),
        'dom_nodes': audits.get('dom-size', {}).get('numericValue') or audits.get('dom-size-insight', {}).get('numericValue'),
        'resources': {},
        'failing': {},
    }
    for k, name in METRICS.items():
        a = audits.get(k)
        if a:
            page['metrics'][name] = {'ms': a.get('numericValue'), 'text': a.get('displayValue'), 'score': a.get('score')}
    for it in items_of(audits.get('resource-summary', {})):
        page['resources'][it.get('resourceType')] = {'requests': it.get('requestCount'), 'bytes': it.get('transferSize')}
    refs = {}
    for c in CATS:
        for r in d['categories'].get(c, {}).get('auditRefs', []):
            refs[r['id']] = c
    for aid, c in refs.items():
        a = audits.get(aid)
        if not a or a.get('score') is None or a.get('scoreDisplayMode') in ('notApplicable', 'manual', 'informative'):
            continue
        if a['score'] >= 0.9:
            continue
        det = a.get('details') or {}
        its = items_of(a)
        page['failing'].setdefault(c, []).append({
            'id': aid, 'title': a.get('title'), 'display': a.get('displayValue'), 'score': a['score'],
            'items': len(its),
            'savings_ms': det.get('overallSavingsMs'), 'savings_bytes': det.get('overallSavingsBytes'),
            'samples': [sample(i) for i in its[:3]],
        })
    pages.append(page)

json.dump(pages, open(out, 'w', encoding='utf8'), indent=1, ensure_ascii=False)
print(f'{len(pages)} pages -> {out}')
for p in pages:
    s = p['scores']
    m = p['metrics']
    print(f"{p['url'][:52]:52s} P{s.get('performance'):>3} A{s.get('accessibility'):>3} BP{s.get('best-practices'):>3} SEO{s.get('seo'):>3} | "
          f"FCP {m.get('FCP', {}).get('text')} LCP {m.get('LCP', {}).get('text')} TBT {m.get('TBT', {}).get('text')} CLS {m.get('CLS', {}).get('text')} | "
          f"{(p['transfer_bytes'] or 0) / 1024:.0f} KB {p['requests']} req")
