/* ── CASE STUDY: renders pages/case.html?p=<slug> from js/projects.js; js/site.js adds the motion ── */
(() => {
    const { studio, projects } = window.NLT || {};
    const slug = new URLSearchParams(location.search).get('p');
    const p = projects && projects.find((x) => x.slug === slug);
    if (!p) {
        location.replace('/pages/work.html');
        return;
    }

    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const src = (s, n, small) => `/assets/work/${s}-${n}${small ? '-sm' : ''}.jpg`;
    // Phone screenshots are 828px wide; heights differ per project (small versions are 480px wide)
    const heights = { 'marathon-m': 1522, 'velvet-edge': 1598, geffphotography: 1466, niaimani: 1496 };
    const h = (s) => heights[s] || 1500;
    const pic = (n, sizes, alt, s = p.slug) =>
        `<img src="${src(s, n, true)}" srcset="${src(s, n, true)} 480w, ${src(s, n)} 828w" sizes="${sizes}" width="480" height="${Math.round(h(s) * 480 / 828)}" alt="${esc(alt)}" loading="lazy" decoding="async">`;
    const ne = '<svg aria-hidden="true"><use href="#i-ne"/></svg>';
    const pill = (cls, label, attrs) => `<a class="pill ${cls}" ${attrs}><span class="roll">${label}</span><span class="pill__arrow">${ne}</span></a>`;
    const screen = (n) => `${p.name} website, screen ${n + 1}`;
    const phone = (n, sizes, cls = '') => `<div class="phone ${cls}">${pic(n, sizes, screen(n))}</div>`;
    const paras = (list, cls = 'body') => [].concat(list).map((t) => `<p class="${cls}" data-reveal>${esc(t)}</p>`).join('');
    const index = projects.indexOf(p);
    const next = projects[(index + 1) % projects.length];
    const screens = p.screens || [0, 1, 2, 3, 4, 5];
    const blobs = '<div class="hero__blobs" aria-hidden="true"><span class="blob blob--1"></span><span class="blob blob--2"></span><span class="blob blob--3"></span></div>';

    document.title = `${p.name} | NiaLure Tech`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = [].concat(p.summary)[0].trim();

    const meta = [['Client', p.client || p.name], ['Sector', p.sector], ['Scope', p.scope || p.services.join(' · ')], ['Focus', p.focus], ['Year', p.year]]
        .filter(([, v]) => v);

    /* ── intro: inset card that grows to full bleed ── */
    const heroBox = typeof p.heroImage === 'string'
        ? `<img src="${esc(encodeURI(p.heroImage))}" style="object-position:center" alt="${esc(p.name)} website hero section" decoding="async" fetchpriority="high">`
        : p.heroImage
        ? `<img src="${src(p.slug, 'hero')}" srcset="${src(p.slug, 'hero', true)} 960w, ${src(p.slug, 'hero')} 1918w" sizes="100vw" width="1918" height="937" alt="${esc(p.name)} website hero section" decoding="async" fetchpriority="high">`
        : `<div class="expand__phones">
                        ${phone(p.hero[0], '22vw')}
                        <div class="phone phone--main"><video src="${encodeURI(p.video)}" poster="${src(p.slug, p.hero[1])}" muted loop playsinline preload="none" aria-label="${esc(p.name)} website walkthrough"></video></div>
                        ${phone(p.hero[2], '22vw')}
                    </div>`;
    const heroCap = p.heroImage
        ? '<span>Website hero section</span><span></span>'
        : `<span>Website walkthrough</span><button type="button" class="pill pill--light pill--sm pill--noarrow" data-fullscreen><span class="roll">Watch fullscreen</span></button>`;

    /* ── optional sections (see the field list in js/projects.js) ──
       Page order: The project → Live site → Approach → Design → Site structure → Visual language.
       partners, screensBlock, closer, mark and pair are built but not placed on the page right now;
       drop ${partners} etc. back into the template below to show them again. ── */
    const journey = p.journey ? `
                <div style="margin-top:clamp(80px,10vw,150px)">
                    <div class="sec-head">
                        <div>
                            <p class="eyebrow" data-reveal>Site structure</p>
                            <h2 class="h-section" data-split>${esc(p.journey.title)}</h2>
                        </div>
                        ${paras(p.journey.text, 'lede')}
                    </div>
                    <div class="points${p.journey.steps.length === 4 ? ' points--4' : ''}" data-points>
                        ${p.journey.steps.map((s, i) => `<div class="point"><i class="point__rule"></i><span class="point__num">0${i + 1}</span><h3>${esc(s)}</h3></div>`).join('')}
                    </div>
                </div>` : '';

    const design = p.design ? `
                <div style="margin-top:clamp(80px,10vw,150px)">
                    <p class="eyebrow" data-reveal>Design</p>
                    <div class="media design-shot" data-img style="margin-top:24px"><img src="${esc(encodeURI(p.design))}" width="2812" height="1876" alt="${esc(p.name)} website design on tablet" loading="lazy" decoding="async"></div>
                </div>` : '';

    const partners = p.partners ? `
        <section class="sheet sheet--paper" data-curve data-theme="light" aria-labelledby="partners-title">
            <div class="wrap split">
                <div>
                    <p class="eyebrow" data-reveal>On the ${esc(p.name)} website</p>
                    <h2 class="h-3" id="partners-title" data-split>${esc(p.partners.title)}</h2>
                    ${paras(p.partners.intro)}
                </div>
                <div>
                    <ul class="names meta" data-meta>
                        ${p.partners.names.map((n) => `<li class="meta__item"><span>${esc(n)}</span><i class="rule"></i></li>`).join('')}
                    </ul>
                    ${p.partners.outro ? paras(p.partners.outro, 'body') : ''}
                </div>
            </div>
        </section>` : '';

    const live = p.liveUrl ? `
                <div class="frame bp bp--light" data-frame style="margin-top:clamp(64px,8vw,120px)">
                    <span class="tab">Live site</span>
                    <div class="browser">
                        <div class="browser__bar"><i></i><i></i><i></i><span>${esc(p.liveUrl.replace(/^https?:\/\//, ''))}</span></div>
                        <iframe src="${esc(p.liveUrl)}" title="${esc(p.name)} live site" loading="lazy"></iframe>
                    </div>
                </div>` : '';

    const closer = p.closer ? `
        <section class="sheet is-dark" data-curve data-theme="dark" style="background:var(--ink)" aria-labelledby="closer-title">
            <div class="wrap">
                <div class="sec-head">
                    <div>
                        <p class="eyebrow eyebrow--light" data-reveal>How the site closes</p>
                        <h2 class="h-section" id="closer-title" data-split>${esc(p.closer.title)}</h2>
                    </div>
                    ${paras(p.closer.intro, 'lede')}
                </div>
                <p class="chunky" data-chars>${esc(p.closer.cta)}</p>
                <div class="split" style="margin-top:clamp(40px,5vw,72px)">
                    <span></span>
                    <div>
                        ${paras(p.closer.text)}
                        ${p.closer.signoff ? `<p class="h-3" data-reveal style="margin-top:24px">${esc(p.closer.signoff)}</p>` : ''}
                    </div>
                </div>
            </div>
        </section>` : '';

    const mark = p.mark ? `
                <div class="split" style="margin-top:clamp(80px,10vw,150px)">
                    <div>
                        <p class="eyebrow" data-reveal>Identity</p>
                        <h2 class="h-3" data-split>${esc(p.mark.title)}</h2>
                        ${paras(p.mark.text)}
                    </div>
                    <div class="logo-card bp bp--light" data-frame>
                        <div><span>${esc(p.mark.label)}</span><p>${esc(p.mark.caption)}</p></div>
                    </div>
                </div>` : '';

    // white label on dark swatches, dark label on light ones
    const onDark = (hex) => { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) < 140; };
    const visual = p.visual ? `
                <div class="vis">
                    <div>
                        <p class="eyebrow" data-reveal>Visual language</p>
                        <h2 class="vis__title" data-split>${esc(p.visual.title)}</h2>
                        ${paras(p.visual.text)}
                    </div>
                    <div class="swatches" data-reveal>
                        ${(p.palette || []).map(([name, hex]) => `<div class="swatch" style="background:${esc(hex)};color:${onDark(hex) ? '#fff' : '#0a0a0a'}"><span>${esc(name)}</span></div>`).join('')}
                    </div>
                </div>` : '';

    const pair = (nums, tones) => `
                <div class="pair">
                    ${nums.map((n, k) => `<a class="pair__fig" href="${src(p.slug, n)}" target="_blank" rel="noopener" data-cursor="View" data-parallax="${k ? 5 : -5}">
                        <div class="media pair__media ${tones[k]}" data-img>${phone(n, '(max-width: 767px) 40vw, 300px')}<span class="badge" aria-hidden="true"><svg><use href="#i-ne"/></svg></span></div>
                        <span class="cap"><span>Screen ${String(n + 1).padStart(2, '0')}</span><span>View image <svg width="12" height="12" aria-hidden="true"><use href="#i-ne"/></svg></span></span>
                    </a>`).join('')}
                </div>`;

    const screensBlock = `
                <div class="frame bp bp--light" data-frame>
                    <span class="tab">Mobile screens</span>
                    <div class="phones">${p.frame.map((n) => phone(n, '(max-width: 767px) 30vw, 280px')).join('')}</div>
                </div>

                <h2 class="chunky" data-chars>${esc(p.services[1])}.</h2>
                <div class="frame bp bp--light" data-frame data-carousel>
                    <span class="tab">Interactive</span>
                    <div class="demo">
                        <div class="carousel" tabindex="0" role="region" aria-roledescription="carousel" aria-label="${esc(p.name)} screens">
                            ${screens.map((n) => phone(n, '(max-width: 767px) 60vw, 250px')).join('')}
                        </div>
                        <div class="demo__info">
                            <p class="demo__title">Swipe through the site.</p>
                            <p>Every screen from the ${esc(p.name)} build, in order. Drag, swipe or use the arrows.</p>
                            <div class="demo__ctrl">
                                <button type="button" class="demo__btn demo__btn--prev" data-step="-1" aria-label="Previous screen"><svg aria-hidden="true"><use href="#i-arrow"/></svg></button>
                                <span class="demo__count" aria-live="polite"><b>01</b> / ${String(screens.length).padStart(2, '0')}</span>
                                <button type="button" class="demo__btn" data-step="1" aria-label="Next screen"><svg aria-hidden="true"><use href="#i-arrow"/></svg></button>
                            </div>
                            <div class="demo__bar"><i></i></div>
                        </div>
                    </div>
                </div>
`;

    const doodles = [
        ['left:4%;top:3%', 'i-circuit'], ['right:6%;top:10%;width:clamp(150px,16vw,240px)', 'i-circuit-b'], ['left:-2%;top:36%', 'i-circuit-b'],
        ['right:2%;top:46%', 'i-circuit'], ['left:8%;top:70%', 'i-circuit'], ['right:10%;top:86%', 'i-circuit-b'],
    ].map(([style, id]) => `<svg style="${style}"><use href="#${id}"/></svg>`).join('');

    const root = document.getElementById('case');
    root.outerHTML = `
        <section class="case-intro" data-theme="light" aria-labelledby="case-title">
            ${blobs}
            <div class="wrap">
                <p class="eyebrow" data-reveal>Case study · ${String(index + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}</p>
                <div class="case-intro__top">
                    <div>
                        <h1 class="h-display case-intro__title" id="case-title" data-split>${esc(p.name)}.</h1>
                        <p class="case-intro__sub" data-reveal>${esc(p.tagline || p.services.join(' · '))}</p>
                    </div>
                    ${p.liveUrl
                        ? pill('pill--blue', 'Visit live site', `href="${esc(p.liveUrl)}" target="_blank" rel="noopener" data-reveal`)
                        : pill('pill--blue', 'Request a quote', 'href="/pages/contact.html" data-reveal')}
                </div>
            </div>
            <figure class="expand" data-expand data-theme="dark"${p.heroImage ? '' : ' data-nav="light"'}>
                <div class="expand__clip">
                    <div class="expand__in">
                    ${heroBox}
                    </div>
                </div>
                <figcaption class="expand__cap">${heroCap}</figcaption>
            </figure>
        </section>

        <section class="sheet" data-curve data-theme="light" aria-labelledby="overview-title">
            <div class="wrap split">
                <dl class="meta" data-meta>
                    ${meta.map(([k, v]) => `<div class="meta__item"><dt>${k}</dt><dd>${esc(v)}</dd><i class="rule"></i></div>`).join('')}
                </dl>
                <div>
                    <p class="eyebrow" data-reveal>The project</p>
                    <h2 class="h-3" id="overview-title" data-split style="margin-top:20px;font-size:clamp(1.75rem,3.2vw,3.25rem)">${esc(p.headline)}</h2>
                    <div style="margin-top:24px">${paras(p.summary)}</div>
                </div>
            </div>
        </section>

        ${live ? `<section class="dive" data-curve data-theme="dark" data-nav="light" aria-labelledby="accent-title">
            <div class="dive__art" data-art aria-hidden="true">${doodles}</div>
            <div class="wrap">
                <p class="eyebrow eyebrow--light" data-reveal>Live site</p>
                <h2 class="chunky" id="accent-title" data-chars style="margin-top:18px;margin-bottom:0">${esc(p.services[0])}.</h2>
                ${live}
            </div>
        </section>` : ''}

        <section class="sheet" data-curve data-theme="light" aria-labelledby="points-title">
            <div class="wrap">
                <div class="sec-head">
                    <div>
                        <p class="eyebrow" data-reveal>Approach</p>
                        <h2 class="h-section" id="points-title" data-split>What makes it work.</h2>
                    </div>
                </div>
                <div class="points" data-points>
                    ${(p.points || studio.points).map((pt, i) => `<div class="point"><i class="point__rule"></i><span class="point__num">0${i + 1}</span><h3>${esc(pt.title)}</h3><p>${esc(pt.text)}</p></div>`).join('')}
                </div>
                ${design}
                ${journey}
            </div>
        </section>

        <section class="sheet sheet--pad-curve" data-curve data-theme="light" aria-label="Visual language">
            <div class="wrap">
                ${visual}
                <a class="case-next" href="/pages/case.html?p=${next.slug}" data-preview="${src(next.slug, 0, true)}" style="margin-top:clamp(80px,10vw,150px)">
                    <span>
                        <span class="eyebrow">Next project</span>
                        <strong class="case-next__name">${esc(next.name)}</strong>
                    </span>
                    <span class="badge" aria-hidden="true" style="position:static;width:64px;height:64px"><svg><use href="#i-ne"/></svg></span>
                </a>
            </div>
        </section>

        <section class="closing" data-curve data-theme="dark" aria-labelledby="close-title">
            <div class="closing__glow" aria-hidden="true"></div>
            <div class="wrap closing__inner">
                <p class="eyebrow eyebrow--light" data-reveal>Get in touch</p>
                <h2 class="closing__title" id="close-title" data-split>Let's build something with purpose.</h2>
                <p class="closing__sub" data-reveal>Tell us what you're building and we'll come back with a clear plan and a written quote.</p>
                <div class="closing__actions" data-reveal>
                    ${pill('pill--light pill--lg', 'Start a conversation', 'href="/pages/contact.html"')}
                </div>
                <a class="closing__email" href="mailto:${esc(studio.email)}" data-reveal>${esc(studio.email)}</a>
                <p class="closing__note" data-reveal>We reply within 1 business day.</p>
            </div>
        </section>`;
})();
