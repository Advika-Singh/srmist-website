"""Static analysis of a saved HTML page: images, scripts, accessibility and security signals."""
import json, re, sys
from collections import Counter
from urllib.parse import urlparse
from bs4 import BeautifulSoup

path, base_host = sys.argv[1], sys.argv[2]
raw = open(path, encoding='utf8', errors='ignore').read()
soup = BeautifulSoup(raw, 'html.parser')

def host(u):
    try:
        return urlparse(u).netloc.lower()
    except Exception:
        return ''

out = {'html_bytes': len(raw.encode('utf8'))}
out['dom_elements'] = len(soup.find_all(True))
out['title'] = soup.title.string.strip() if soup.title and soup.title.string else None
out['lang'] = soup.html.get('lang') if soup.html else None
vp = soup.find('meta', attrs={'name': 'viewport'})
out['viewport'] = vp.get('content') if vp else None
out['viewport_blocks_zoom'] = bool(vp and re.search(r'user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b', vp.get('content', ''), re.I))
gen = soup.find('meta', attrs={'name': 'generator'})
out['generator'] = [g.get('content') for g in soup.find_all('meta', attrs={'name': 'generator'})]

# scripts
scripts = soup.find_all('script')
ext = [s for s in scripts if s.get('src')]
inline = [s for s in scripts if not s.get('src') and (s.string or '').strip()]
out['scripts_total'] = len(scripts)
out['scripts_external'] = len(ext)
out['scripts_inline'] = len(inline)
out['scripts_inline_bytes'] = sum(len((s.string or '').encode('utf8')) for s in inline)
out['scripts_blocking_head'] = len([s for s in (soup.head.find_all('script') if soup.head else []) if s.get('src') and not (s.has_attr('async') or s.has_attr('defer') or s.get('type') == 'module')])
out['scripts_third_party'] = sorted({host(s['src']) for s in ext if host(s['src']) and not host(s['src']).endswith(base_host)})
out['script_versions'] = sorted({m for s in ext for m in re.findall(r'(jquery[^/?]*?(?:\.min)?\.js)\?ver=([\d.]+)', s['src'], re.I) and [f"{a} ver {b}" for a, b in re.findall(r'(jquery[^/?]*?(?:\.min)?\.js)\?ver=([\d.]+)', s['src'], re.I)]})
out['scripts_with_ver_param'] = len([s for s in ext if 'ver=' in s['src']])

# styles
sheets = soup.find_all('link', rel=lambda r: r and 'stylesheet' in r)
out['stylesheets'] = len(sheets)
out['stylesheets_third_party'] = sorted({host(l['href']) for l in sheets if l.get('href') and host(l['href']) and not host(l['href']).endswith(base_host)})
out['inline_style_blocks'] = len(soup.find_all('style'))
out['inline_style_attrs'] = len(soup.find_all(style=True))
out['preloads'] = len(soup.find_all('link', rel=lambda r: r and 'preload' in r))

# images
imgs = soup.find_all('img')
out['img_total'] = len(imgs)
out['img_missing_alt_attr'] = len([i for i in imgs if not i.has_attr('alt')])
out['img_empty_alt'] = len([i for i in imgs if i.has_attr('alt') and not i['alt'].strip()])
out['img_no_dimensions'] = len([i for i in imgs if not (i.get('width') and i.get('height'))])
out['img_lazy'] = len([i for i in imgs if i.get('loading') == 'lazy' or 'lazy' in ' '.join(i.get('class', []))])
out['img_no_srcset'] = len([i for i in imgs if not i.get('srcset') and not i.get('data-srcset')])
exts = Counter()
for i in imgs:
    u = i.get('data-src') or i.get('src') or ''
    m = re.search(r'\.(jpe?g|png|gif|webp|avif|svg)(?:\?|$)', u, re.I)
    exts[m.group(1).lower() if m else ('data-uri' if u.startswith('data:') else 'other')] += 1
out['img_formats'] = dict(exts)
bg = re.findall(r'url\((?:&quot;|["\']?)(https?:[^)"\']+\.(?:jpe?g|png|webp|gif))', raw)
out['css_bg_images_inline'] = len(set(bg))

# accessibility signals
out['h1_count'] = len(soup.find_all('h1'))
levels = [int(h.name[1]) for h in soup.find_all(re.compile(r'^h[1-6]$'))]
jumps = sum(1 for a, b in zip(levels, levels[1:]) if b - a > 1)
out['headings_total'] = len(levels)
out['heading_level_skips'] = jumps
out['landmarks'] = {t: len(soup.find_all(t)) for t in ['header', 'nav', 'main', 'footer', 'aside']}
out['role_landmarks'] = len(soup.find_all(attrs={'role': re.compile('banner|navigation|main|contentinfo|search')}))
out['skip_link'] = bool(soup.find('a', href=re.compile(r'^#(content|main|primary)', re.I)))
links = soup.find_all('a')
out['links_total'] = len(links)
out['links_unique_hrefs'] = len({a.get('href') for a in links if a.get('href')})
out['links_hash_only'] = len([a for a in links if a.get('href') in ('#', '', None)])
def label(a):
    t = a.get_text(' ', strip=True)
    return t or a.get('aria-label') or (a.find('img') or {}).get('alt') if hasattr(a.find('img') or {}, 'get') else t
empty = [a for a in links if not (a.get_text(' ', strip=True) or a.get('aria-label') or a.get('title') or (a.find('img') and a.find('img').get('alt')))]
out['links_without_accessible_name'] = len(empty)
vague = [a for a in links if a.get_text(' ', strip=True).lower() in ('read more', 'click here', 'more', 'know more', 'learn more', 'view more')]
out['links_vague_text'] = len(vague)
btns = soup.find_all('button')
out['buttons_total'] = len(btns)
out['buttons_without_name'] = len([b for b in btns if not (b.get_text(' ', strip=True) or b.get('aria-label') or b.get('title'))])
out['inputs_without_label'] = len([i for i in soup.find_all(['input', 'select', 'textarea']) if i.get('type') not in ('hidden', 'submit', 'button') and not (i.get('aria-label') or i.get('id') and soup.find('label', attrs={'for': i.get('id')}) or i.find_parent('label'))])
out['iframes'] = len(soup.find_all('iframe'))
out['iframes_without_title'] = len([f for f in soup.find_all('iframe') if not f.get('title')])
out['videos'] = len(soup.find_all('video'))
out['tabindex_positive'] = len([e for e in soup.find_all(attrs={'tabindex': True}) if (e['tabindex'] or '0').lstrip('-').isdigit() and int(e['tabindex']) > 0])
out['aria_hidden_focusables'] = len([e for e in soup.find_all(attrs={'aria-hidden': 'true'}) if e.find(['a', 'button', 'input'])])
out['text_in_image_candidates'] = [i.get('src', '')[-60:] for i in imgs if re.search(r'banner|ranking|nirf|poster|slide|hero', (i.get('src') or '') + ' ' + ' '.join(i.get('class', [])), re.I)][:8]

# security signals
out['mixed_content_http'] = sorted({m for m in re.findall(r'(?:src|href)=["\'](http://[^"\']+)', raw)})[:10]
blank = [a for a in links if a.get('target') == '_blank']
out['target_blank_total'] = len(blank)
out['target_blank_no_noopener'] = len([a for a in blank if not re.search(r'noopener|noreferrer', ' '.join(a.get('rel', [])))])
out['inline_event_handlers'] = len(re.findall(r'\son(?:click|load|mouseover|submit|change|error)=', raw))
out['forms'] = len(soup.find_all('form'))
out['external_hosts'] = Counter(host(u) for u in re.findall(r'(?:src|href)=["\'](https?://[^"\']+)', raw) if host(u) and not host(u).endswith(base_host)).most_common(12)
out['wordpress_signals'] = {
    'wp-content': raw.count('/wp-content/'),
    'wp-includes': raw.count('/wp-includes/'),
    'wp_json_link': 'wp-json' in raw,
    'elementor_classes': raw.count('elementor-'),
    'plugin_dirs': sorted(set(re.findall(r'/wp-content/plugins/([a-z0-9_-]+)/', raw)))[:30],
}
print(json.dumps(out, indent=1, default=list, ensure_ascii=False))
