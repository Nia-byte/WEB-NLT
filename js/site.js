/* ═══════════════════════════════════════════════════════════════════════════
   NIALURE TECH: shared runtime for every page
   GSAP + ScrollTrigger + SplitText, Lenis smooth scroll.
   Components are switched on by data attributes in the markup:
     data-reveal  data-split  data-chars  data-img  data-parallax  data-meta  data-points
     data-cards   data-frame  data-tiles  data-fill  data-curve  data-statements  data-build
     data-art     data-carousel  data-accordion  data-story  data-cursor  data-preview
   ═══════════════════════════════════════════════════════════════════════════ */
(() => {
    const root = document.documentElement;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

    // If a CDN script failed, drop the pre-animation hiding (and the loader) so the content still shows
    if (!window.gsap || !window.ScrollTrigger || !window.SplitText) {
        root.classList.remove('js', 'has-loader');
        return;
    }
    window.__nltReady = true; // tells the inline fail-safe in <head> that the loader is handled

    gsap.registerPlugin(ScrollTrigger, SplitText);
    gsap.defaults({ ease: 'power3.out' });

    const DESKTOP = '(min-width: 768px) and (prefers-reduced-motion: no-preference)';
    const MOBILE = '(max-width: 767px) and (prefers-reduced-motion: no-preference)';
    const mm = gsap.matchMedia();
    const pad = (n) => String(n).padStart(2, '0');

    // Everything that plays "on enter" waits for the intro (loader exit), so nothing animates under the curtain
    let openGate;
    const gate = new Promise((r) => (openGate = r));
    const whenReady = (fn) => gate.then(fn);

    /* ── BUTTONS: duplicate labels for the text roll, arrows for the diagonal swap ── */
    $$('.roll').forEach((el) => {
        const text = el.textContent.trim();
        const inner = document.createElement('span');
        const a = document.createElement('span');
        const b = document.createElement('span');
        inner.className = 'roll__in';
        a.textContent = text;
        b.textContent = text;
        b.setAttribute('aria-hidden', 'true');
        inner.append(a, b);
        el.replaceChildren(inner);
    });
    $$('.pill__arrow, .cta-bar__sq').forEach((el) => {
        const svg = $('svg', el);
        if (svg && el.children.length === 1) el.append(svg.cloneNode(true));
    });

    /* ── LENIS, driven by the GSAP ticker ── */
    let lenis = null;
    if (!reduce && window.Lenis) {
        lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
        window.__lenis = lenis;
    }

    /* ── NAV (existing behaviour): pill slides in, hamburger opens the full-screen menu ── */
    const chrome = $('#chrome');
    const menuToggle = $('#menuToggle');
    const menuOverlay = $('#menuOverlay');
    const menuItems = menuOverlay ? $$('.menu-item', menuOverlay) : [];
    const menuTag = menuOverlay ? $('.tagline', menuOverlay) : null;
    let menuOpen = false;

    function setMenu(open) {
        if (!menuOverlay || open === menuOpen) return;
        menuOpen = open;
        menuToggle.setAttribute('aria-expanded', String(open));
        menuOverlay.classList.remove('is-settled');
        gsap.killTweensOf([menuOverlay, menuItems, menuTag]);
        const [top, mid, bottom] = menuToggle.children;
        if (open) {
            if (lenis) lenis.stop();
            gsap.set(menuOverlay, { display: 'flex' });
            gsap.fromTo(menuOverlay, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
            gsap.fromTo(menuItems, { y: 60, opacity: 0, scale: 0.85, rotationX: -15 }, {
                y: 0, opacity: 1, scale: 1, rotationX: 0, duration: 0.7, stagger: 0.12, ease: 'back.out(1.5)', delay: 0.1,
                clearProps: 'transform', onComplete: () => menuOverlay.classList.add('is-settled'),
            });
            gsap.fromTo(menuTag, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.5 });
            gsap.to(top, { rotate: 45, y: 8, duration: 0.4, ease: 'power2.inOut' });
            gsap.to(mid, { opacity: 0, duration: 0.3, ease: 'power2.inOut' });
            gsap.to(bottom, { rotate: -45, y: -8, duration: 0.4, ease: 'power2.inOut' });
        } else {
            gsap.to(menuItems, { y: -40, opacity: 0, scale: 0.9, duration: 0.3, stagger: 0.05, ease: 'power2.in' });
            gsap.to(menuTag, { opacity: 0, duration: 0.3, ease: 'power2.in' });
            gsap.to(menuOverlay, { opacity: 0, duration: 0.4, delay: 0.2, ease: 'power2.in', onComplete: () => gsap.set(menuOverlay, { display: 'none' }) });
            gsap.to([top, bottom], { rotate: 0, y: 0, duration: 0.4, ease: 'power2.inOut' });
            gsap.to(mid, { opacity: 1, duration: 0.3, ease: 'power2.inOut' });
            if (lenis) lenis.start();
        }
    }
    if (menuToggle) menuToggle.addEventListener('click', () => setMenu(!menuOpen));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    menuItems.forEach((item) => item.addEventListener('click', () => setMenu(false)));

    // In-page anchors scroll smoothly through Lenis
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        const target = id.length > 1 && document.getElementById(id.slice(1));
        if (!target) return;
        e.preventDefault();
        setMenu(false);
        if (lenis) lenis.scrollTo(target, { offset: 0 });
        else target.scrollIntoView();
    }));

    // Colour inversion: the pill reads the section under it (data-theme="dark" sections and the footer are dark)
    let themeRaf = 0;
    function navTheme() {
        themeRaf = 0;
        if (!chrome) return;
        let dark = false;
        for (const el of document.elementsFromPoint(innerWidth / 2, 48)) {
            if (chrome.contains(el) || el.closest('.cursor')) continue;
            // data-nav overrides the section theme (e.g. blue sections keep the darker pill so the logo stays readable)
            const t = el.closest('[data-theme], .footer');
            dark = !!t && (t.classList.contains('footer') || (t.dataset.nav || t.dataset.theme) === 'dark');
            break;
        }
        chrome.classList.toggle('is-light', !dark);
    }
    const queueTheme = () => { if (!themeRaf) themeRaf = requestAnimationFrame(navTheme); };
    const setTheme = (el, theme) => {
        if (el.dataset.theme !== theme) {
            el.dataset.theme = theme;
            queueTheme();
        }
    };
    if (lenis) lenis.on('scroll', queueTheme);
    addEventListener('scroll', queueTheme, { passive: true });
    addEventListener('resize', queueTheme);

    /* ── CURSOR: brand-blue dot with a little lag; "View" over projects, an image preview over project rows ── */
    function cursor() {
        if (reduce || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        const el = document.createElement('div');
        el.className = 'cursor is-hidden';
        el.setAttribute('aria-hidden', 'true');
        el.innerHTML = '<div class="cursor__dot"></div><div class="cursor__media"><img alt=""></div><div class="cursor__view">View</div>';
        document.body.append(el);
        const img = $('img', el);
        const label = $('.cursor__view', el);
        const xTo = gsap.quickTo(el, 'x', { duration: 0.15, ease: 'power3' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.15, ease: 'power3' });
        let current = null;
        addEventListener('pointermove', (e) => {
            if (e.pointerType !== 'mouse') return;
            el.classList.remove('is-hidden');
            xTo(e.clientX);
            yTo(e.clientY);
        }, { passive: true });
        document.documentElement.addEventListener('mouseleave', () => el.classList.add('is-hidden'));
        document.addEventListener('pointerover', (e) => {
            const t = e.target.closest('[data-cursor], [data-preview]');
            if (t === current) return;
            current = t;
            const preview = t && t.dataset.preview;
            if (preview && img.getAttribute('src') !== preview) img.src = preview;
            if (preview) {
                // optional per-row overrides: data-preview-bg (card colour), data-preview-fit (e.g. "contain" for logos)
                const fit = t.dataset.previewFit || '';
                img.parentElement.style.background = t.dataset.previewBg || '';
                img.style.objectFit = fit;
                img.style.objectPosition = fit ? 'center' : '';
                img.style.padding = fit === 'contain' ? '20px' : '';
            }
            label.textContent = (t && t.dataset.cursor) || 'View';
            el.classList.toggle('is-media', !!preview);
            el.classList.toggle('is-view', !!t && !preview);        });
    }

    /* ── LOADER: the logo builds itself (once per session), then the curtain lifts ── */
    function loader() {
        const el = $('#loader');
        if (!el || !root.classList.contains('has-loader')) {
            if (el) el.remove();
            return Promise.resolve(false);
        }
        try { sessionStorage.setItem('nlt-intro', '1'); } catch (e) {}
        if (lenis) lenis.stop();
        window.scrollTo(0, 0);

        const mark = $('.loader__mark', el);
        const blue = $('.lm-blue', mark);
        const indigo = $('.lm-indigo', mark);
        const dot = $('.lm-dot', mark);
        const [ring1, line1, line2, ring2] = ['.lm-r1', '.lm-l1', '.lm-l2', '.lm-r2'].map((s) => $(s, mark));
        const words = $('.loader__words', el);
        const name = $('.loader__name', el);
        const tag = $('.loader__tag', el);
        const lockup = $('.loader__lockup', el);

        const fonts = Promise.race([
            document.fonts ? document.fonts.load('900 1em Nunito').catch(() => {}) : null,
            new Promise((r) => setTimeout(r, 450)),
        ]);

        return fonts.then(() => new Promise((resolve) => {
            gsap.set(blue, { svgOrigin: '210.5 180', scale: 0.5, opacity: 0, fill: '#d5def0' });
            gsap.set(indigo, { svgOrigin: '324.8 242.4', x: -206, y: -168, scale: 0.055, opacity: 0 });
            gsap.set(dot, { svgOrigin: '138 330.5', scale: 0, opacity: 1 });
            gsap.set(name, { x: -36 });
            gsap.set(tag, { y: 10 });

            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
            // 1. circles (~0.9s): indigo dot appears top-left, a pale circle fades in and deepens into brand blue
            tl.to(indigo, { opacity: 1, duration: 0.18, ease: 'power1.out' }, 0)
                .to(blue, { opacity: 1, duration: 0.3, ease: 'power1.out' }, 0.06)
                .to(blue, { fill: '#1446aa', duration: 0.4, ease: 'power1.inOut' }, 0.14)
                .to(blue, { scale: 1, duration: 0.6, ease: 'back.out(1.25)' }, 0.2)
                // the indigo dot drops, grows and tucks behind / lower-right
                .to(indigo, { x: 0, duration: 0.6, ease: 'power3.inOut' }, 0.26)
                .to(indigo, { y: 0, duration: 0.6, ease: 'power2.in' }, 0.26)
                .to(indigo, { scale: 1, duration: 0.6, ease: 'back.out(1.15)' }, 0.3)
                .to(dot, { scale: 1, duration: 0.4, ease: 'back.out(1.6)' }, 0.66)
                // 2. circuit draws itself (~0.5s): left stem, then the right branch with its node
                .to(ring1, { strokeDashoffset: 0, duration: 0.12, ease: 'none' }, 0.9)
                .to(line1, { strokeDashoffset: 0, duration: 0.24, ease: 'power1.inOut' }, 1.0)
                .to(line2, { strokeDashoffset: 0, duration: 0.13, ease: 'power1.in' }, 1.2)
                .to(ring2, { strokeDashoffset: 0, duration: 0.1, ease: 'none' }, 1.31)
                // 3. wordmark wipes out from behind the mark (~0.5s)
                .to(words, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'power3.inOut' }, 1.4)
                .to(name, { x: 0, duration: 0.6, ease: 'power3.out' }, 1.4)
                // 4. tagline fades up (~0.4s), then a brief hold
                .to(tag, { opacity: 1, y: 0, duration: 0.4 }, 1.92)
                .addLabel('exit', 2.5)
                // curtain lift
                .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9, ease: 'expo.inOut' }, 'exit')
                .to(lockup, { y: -90, opacity: 0, duration: 0.8, ease: 'expo.inOut' }, 'exit')
                .add(() => resolve(true), 'exit+=0.6') // hero entrance overlaps the last 0.3s
                .add(() => {
                    root.classList.remove('has-loader');
                    el.remove();
                    if (lenis) lenis.start();
                });
            if (innerWidth < 768) tl.timeScale(1.35); // shortened on phones
        }));
    }

    /* ── HERO (home): shared entrance + exit; The Cube itself lives in js/heroes.js (window.NLTHero) ── */
    const activeHero = () => $('.hero');

    function heroIn() {
        const hero = activeHero();
        if (!hero) return;
        const v = window.NLTHero ? window.NLTHero({ hero, gsap, reduce, $, $$ }) : {};
        const items = $$('[data-hero]', hero);
        const masks = $$('.hx-mask > span', hero);
        if (reduce) {
            gsap.set(items, { opacity: 1 });
            if (v.still) v.still();
            return;
        }
        const tl = gsap.timeline();
        if (masks.length) tl.to(masks, { y: 0, yPercent: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out' }, v.masksAt ?? 0.15);
        if (items.length) tl.fromTo(items, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, v.itemsAt ?? 0.3);
        if (v.enter) v.enter(tl);

        // Hero exit: the top row lifts and fades as the next sheet rises over it (plus the hero's own exit)
        mm.add(DESKTOP, () => {
            const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
            const top = $('.hero__top', hero);
            if (top) gsap.to(top, { y: -60, opacity: 0, ease: 'none', scrollTrigger: { ...st, end: '60% top' } });
            if (v.exit) v.exit(st);
        });
    }

    /* ── GENERIC REVEALS ── */
    function reveals() {
        if (reduce) return;
        ScrollTrigger.batch('[data-reveal]', {
            start: 'top 90%',
            once: true,
            onEnter: (batch) => whenReady(() => gsap.fromTo(batch, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', overwrite: true })),
        });
    }

    // Headlines rise out of line masks
    function headlines() {
        $$('[data-split]').forEach((el) => {
            if (reduce) return;
            SplitText.create(el, {
                type: 'lines',
                mask: 'lines',
                linesClass: 'ln',
                aria: 'none',
                autoSplit: true,
                onSplit(self) {
                    self.masks.forEach((m) => m.classList.add('ln-mask'));
                    gsap.set(el, { visibility: 'visible' });
                    const tw = gsap.from(self.lines, { yPercent: 130, duration: 1, stagger: 0.08, ease: 'expo.out', paused: true });
                    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => whenReady(() => tw.play()) });
                    return tw;
                },
            });
        });
        // Chunky headlines: letter by letter
        $$('[data-chars]').forEach((el) => {
            if (reduce) return;
            SplitText.create(el, {
                type: 'lines,chars',
                mask: 'lines',
                linesClass: 'ln',
                // aria-label is only valid on headings here; other elements keep their text readable as-is
                aria: /^H[1-6]$/.test(el.tagName) ? 'auto' : 'none',
                autoSplit: true,
                onSplit(self) {
                    self.masks.forEach((m) => m.classList.add('ch-mask'));
                    gsap.set(el, { visibility: 'visible' });
                    const tw = gsap.from(self.chars, { yPercent: 100, rotate: 8, duration: 0.9, stagger: 0.03, ease: 'back.out(1.4)', paused: true });
                    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => whenReady(() => tw.play()) });
                    return tw;
                },
            });
        });
    }

    // Images: clip reveal upwards with the inner image settling from 1.15
    function images() {
        if (reduce) return;
        $$('[data-img]').forEach((el) => {
            const inner = $('img, video, .phone, .browser', el);
            const tl = gsap.timeline({ paused: true })
                .fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.out' }, 0);
            if (inner) tl.fromTo(inner, { scale: 1.15 }, { scale: 1, duration: 1.4, ease: 'expo.out' }, 0);
            ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => whenReady(() => tl.play()) });
        });
        mm.add(DESKTOP, () => {
            $$('[data-parallax]').forEach((el) => {
                const amt = parseFloat(el.dataset.parallax) || 5;
                gsap.fromTo(el, { yPercent: -amt }, {
                    yPercent: amt, ease: 'none',
                    scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
                });
            });
        });
    }

    // Meta lists: rows stagger in, hairlines draw from the left
    function metaLists() {
        if (reduce) return;
        $$('[data-meta]').forEach((list) => {
            const items = Array.from(list.children);
            const rules = $$('.rule', list);
            const tl = gsap.timeline({ paused: true })
                .fromTo(items, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0);
            if (rules.length) tl.fromTo(rules, { scaleX: 0 }, { scaleX: 1, duration: 1, stagger: 0.08, ease: 'expo.out' }, 0.1);
            ScrollTrigger.create({ trigger: list, start: 'top 88%', once: true, onEnter: () => whenReady(() => tl.play()) });
        });
    }

    // Key points: top border draws, then the text
    function keyPoints() {
        if (reduce) return;
        $$('[data-points]').forEach((group) => {
            const items = Array.from(group.children);
            const tl = gsap.timeline({ paused: true });
            items.forEach((item, i) => {
                const rule = $('.point__rule, .svc__rule', item);
                const rest = Array.from(item.children).filter((c) => c !== rule);
                tl.set(item, { autoAlpha: 1 }, i * 0.12);
                if (rule) tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'expo.out' }, i * 0.12);
                tl.fromTo(rest, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06 }, i * 0.12 + 0.25);
            });
            ScrollTrigger.create({ trigger: group, start: 'top 85%', once: true, onEnter: () => whenReady(() => tl.play()) });
        });
    }

    // Service cards rise, then their bullet rows
    function cards() {
        if (reduce) return;
        $$('[data-cards]').forEach((group) => {
            const items = Array.from(group.children);
            const rows = $$('.svc__row', group);
            const rules = $$('.svc__rule', group);
            const tl = gsap.timeline({ paused: true })
                .fromTo(items, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12, ease: 'expo.out' }, 0)
                .fromTo(rules, { scaleX: 0 }, { scaleX: 1, duration: 0.9, stagger: 0.12, ease: 'expo.out' }, 0.3)
                .fromTo(rows, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.06 }, 0.4);
            ScrollTrigger.create({ trigger: group, start: 'top 82%', once: true, onEnter: () => whenReady(() => tl.play()) });
        });
    }

    // Framed screenshots slide up
    function frames() {
        if (reduce) return;
        $$('[data-frame]').forEach((el) => {
            const tw = gsap.fromTo(el, { autoAlpha: 0, y: 120, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1.2, ease: 'expo.out', paused: true });
            ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => whenReady(() => tw.play()) });
        });
    }

    // Tiles wipe in left to right
    function tiles() {
        if (reduce) return;
        $$('[data-tiles]').forEach((group) => {
            const items = Array.from(group.children);
            const tl = gsap.timeline({ paused: true })
                .to(items, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, stagger: 0.1, ease: 'expo.out' }, 0)
                .fromTo($$('.tile__num', group), { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.9, stagger: 0.1 }, 0.25);
            ScrollTrigger.create({ trigger: group, start: 'top 82%', once: true, onEnter: () => whenReady(() => tl.play()) });
        });
    }

    /* ── WORD FILL: words fill with brand blue as you scroll, inline icons pop in ── */
    function wordFill() {
        $$('[data-fill]').forEach((p) => {
            if (reduce) {
                p.classList.add('is-filled');
                return;
            }
            const items = [];
            [...p.childNodes].forEach((node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const frag = document.createDocumentFragment();
                    node.textContent.split(/(\s+)/).forEach((part) => {
                        if (!part) return;
                        if (/^\s+$/.test(part)) return frag.append(' ');
                        const w = document.createElement('span');
                        w.className = 'w';
                        w.textContent = part;
                        frag.append(w);
                        items.push(w);
                    });
                    node.replaceWith(frag);
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    items.push(node);
                }
            });
            const tl = gsap.timeline({ scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 60%', scrub: 0.6 } });
            items.forEach((item, i) => {
                if (item.classList.contains('ico')) tl.fromTo(item, { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(2.2)' }, i * 0.1);
                else tl.fromTo(item, { color: 'rgba(20, 70, 170, 0.15)' }, { color: '#1446aa', duration: 0.3, ease: 'none' }, i * 0.1);
            });
        });
    }

    /* ── HERO HOLD: the hero stays put while the first sheet slides over it ── */
    function heroHold() {
        const hero = activeHero();
        if (!hero || !hero.hasAttribute('data-hold') || reduce) return;
        ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom top', pin: true, pinSpacing: false });
    }

    /* ── CURVED SHEETS: the dome on top of each sheet flattens as it rises (data-curve-m: phones only) ── */
    function curves() {
        if (reduce) return;
        const make = (el) => {
            const pinned = el.dataset.curve === 'pin';
            const h = () => (innerWidth < 768 ? 0.16 : 0.12) * innerWidth;
            const tl = gsap.timeline({
                scrollTrigger: { trigger: el, start: 'top bottom', end: () => (pinned ? 'top top' : 'top 25%'), scrub: true, invalidateOnRefresh: true },
            });
            tl.fromTo(el,
                { clipPath: () => `inset(0px 0px 0px 0px round 50% 50% 0px 0px / ${h()}px ${h()}px 0px 0px)` },
                { clipPath: 'inset(0px 0px 0px 0px round 0% 0% 0px 0px / 0px 0px 0px 0px)', ease: 'none', immediateRender: true }, 0);
            if (!pinned) tl.fromTo(el, { y: () => innerHeight * 0.08 }, { y: 0, ease: 'none' }, 0);
        };
        $$('[data-curve]').forEach(make);
        mm.add(MOBILE, () => $$('[data-curve-m]').forEach(make));
    }

    /* ── PINNED STATEMENTS: three statements, line-mask swaps, background scrubs black → grey → white ── */
    function statements() {
        const sec = $('[data-statements]');
        if (!sec) return;
        const items = $$('.stmts__s', sec);
        const fills = $$('.dashes i', sec);
        const grid = $('.stmts__grid', sec);
        if (reduce) {
            gsap.set(items, { visibility: 'visible' });
            return;
        }
        const split = () => items.map((s) => {
            const sp = SplitText.create(s, { type: 'lines', mask: 'lines', linesClass: 'ln', aria: 'none' });
            sp.masks.forEach((m) => m.classList.add('ln-mask'));
            return sp;
        });

        mm.add(DESKTOP, () => {
            const splits = split();
            gsap.set(items, { visibility: 'visible' });
            splits.slice(1).forEach((s) => gsap.set(s.lines, { yPercent: 140 }));
            splits.forEach((s) => gsap.set(s.lines, { opacity: 0.22 }));

            const tl = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: sec,
                    pin: true,
                    start: 'top top',
                    end: '+=250%',
                    scrub: 0.8,
                    onUpdate: (self) => setTheme(sec, self.progress > 0.62 ? 'light' : 'dark'),
                },
            });
            items.forEach((s, i) => {
                const at = i;
                tl.to(splits[i].lines, { opacity: 1, duration: 0.28, stagger: 0.12 }, at + 0.05)
                    .fromTo(fills[i], { scaleX: 0 }, { scaleX: 1, duration: 0.95 }, at);
                if (i < items.length - 1) {
                    tl.to(splits[i].lines, { yPercent: -140, duration: 0.24, stagger: 0.04, ease: 'power2.in' }, at + 0.72)
                        .to(splits[i + 1].lines, { yPercent: 0, duration: 0.3, stagger: 0.05, ease: 'power3.out' }, at + 0.9);
                }
            });
            tl.to(sec, { backgroundColor: '#454545', duration: 0.3, ease: 'power1.inOut' }, 0.72)
                .to(sec, { backgroundColor: '#ffffff', color: '#0a0a0a', duration: 0.3, ease: 'power1.inOut' }, 1.72)
                .to(grid, { opacity: 1, duration: 0.6 }, 1.85)
                .to({}, { duration: 0.15 });
            return () => {
                splits.forEach((s) => s.revert());
                gsap.set(sec, { clearProps: 'backgroundColor,color' });
                sec.dataset.theme = 'dark';
            };
        });

        mm.add(MOBILE, () => {
            const splits = split();
            gsap.set(items, { visibility: 'visible' });
            splits.forEach((s) => {
                const tw = gsap.from(s.lines, { yPercent: 130, duration: 1, stagger: 0.08, ease: 'expo.out', paused: true });
                ScrollTrigger.create({ trigger: s.lines[0].parentNode, start: 'top 88%', once: true, onEnter: () => whenReady(() => tw.play()) });
            });
            return () => splits.forEach((s) => s.revert());
        });
    }

    /* ── SIGNATURE SCENE: podiums rise carrying the block illustrations, each plays its story once; the blue block fills the screen ── */
    function buildScene() {
        const sec = $('[data-build]');
        if (!sec || reduce) return;
        const cols = $$('.bcol', sec);
        const accent = $('.build__accent', sec);
        const head = $('.build__head', sec);
        const floor = $('.build__floor', sec);

        const media = $('.build__media', sec);
        const video = media && $('video', media);

        /* Block stories: one time-based timeline per pedestal, played once (never scrubbed, never rewound), then an idle
           loop. CSS holds the settled state; this sets the "before" state, so reduced motion and no-JS show the result.
           fire(i) plays story i and any earlier ones, each at least 0.6s after the one before, so they read 01 → 04. */
        const blockStories = () => {
            const scenes = [1, 2, 3, 4].map((n) => $(`.blocks--${n}`, sec));
            if (scenes.some((el) => !el)) return { fire() {}, kill() {} };
            const [s1, s2, s3, s4] = scenes;
            const size = $('.bk', s1).offsetWidth || 46;
            const k = size / 46, u = size + 4, half = size / 2, r = size * 0.22;
            const rad = (tl, tr, br, bl) => ({ borderTopLeftRadius: tl, borderTopRightRadius: tr, borderBottomRightRadius: br, borderBottomLeftRadius: bl });
            const FORM = { square: rad(r, r, r, r), circle: rad(half, half, half, half), arch: rad(half, half, r, r) };
            const RADII = Object.keys(FORM.square).join(',');
            /* A block falls onto the stack: accelerates down, then a small squash that recovers with a slight overshoot */
            const land = (tl, el, at) => {
                gsap.set(el, { transformOrigin: '50% 100%' });
                return tl.fromTo(el, { y: -64 * k }, { y: 0, duration: 0.42, ease: 'power2.in' }, at)
                    .fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: 'none' }, at)
                    .fromTo(el, { scaleY: 0.9 }, { scaleY: 1, duration: 0.5, ease: 'back.out(2.5)', immediateRender: false }, at + 0.42);
            };

            /* 01 Discover: three plain squares lift off, try a shape and a colour each, then settle as square, circle, arch */
            const idle1 = [];
            const t1 = gsap.timeline({ paused: true, onComplete: () => idle1.forEach((t) => t.play()) });
            const tryOn = [FORM.circle, FORM.arch, FORM.circle];
            const settle = [FORM.square, FORM.circle, FORM.arch];
            $$('.bk', s1).forEach((el, i) => {
                const [alt, plain] = $$('i', el);
                const at = i * 0.14;
                gsap.set(el, { y: parseFloat(el.style.getPropertyValue('--y')) * u, rotation: -parseFloat(el.style.getPropertyValue('--r')), ...FORM.square });
                gsap.set([alt, plain], { opacity: 1 });
                t1.to(el, { y: 0, rotation: 0, duration: 1.2, ease: 'power2.out' }, at)
                    .to(el, { ...tryOn[i], duration: 0.5, ease: 'power2.inOut' }, at + 0.2)
                    .to(plain, { opacity: 0, duration: 0.5, ease: 'power1.inOut' }, at + 0.2)
                    .to(el, { ...settle[i], duration: 0.6, ease: 'power2.inOut' }, at + 0.95)
                    .to(alt, { opacity: 0, duration: 0.6, ease: 'power1.inOut' }, at + 0.95)
                    .set(el, { clearProps: RADII }, at + 1.56);
                idle1.push(gsap.to(el, { y: -5 * k, rotation: i % 2 ? 2 : -2, duration: 2.4 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true }));
            });

            /* 02 Design & build: the dashed blueprint appears, blocks drop into it one by one, one circle keeps waiting */
            const ghosts = $$('.bk--ghost', s2);
            const wait = $('.bk--wait', s2);
            const idle2 = gsap.to(wait, { y: -5 * k, duration: 1.7, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true });
            const t2 = gsap.timeline({ paused: true, onComplete: () => idle2.play() });
            t2.fromTo(ghosts, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.42, stagger: 0.1, ease: 'power2.out' }, 0);
            $$('.bk:not(.bk--ghost)', s2).forEach((el, i) => {
                const at = 0.62 + i * 0.36;
                land(t2, el, at).to(ghosts[i], { opacity: 0, duration: 0.4, ease: 'none' }, at + 0.42);
            });

            /* 03 Refine: a guide line draws in, each block snaps to it, the circle is set on top, one block is recoloured */
            const stack = $$('.bk', s3);
            const top = stack.pop();
            const line = $('.bk-guide', s3);
            const polish = $('i', stack[1]);
            const t3 = gsap.timeline({ paused: true });
            gsap.set([line, polish], { opacity: 1 });
            [-5, 6, -4].forEach((x, i) => gsap.set(stack[i], { x: x * k, rotation: i === 2 ? 5 : 0 }));
            t3.fromTo($('i', line), { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: 'power2.inOut' }, 0)
                .to(stack, { x: 0, rotation: 0, duration: 0.45, stagger: 0.18, ease: 'back.out(2.4)' }, 0.5);
            land(t3, top, 1.15)
                .to(polish, { opacity: 0, duration: 0.6, ease: 'power1.inOut' }, 1.5)
                .to(line, { opacity: 0, duration: 0.5, ease: 'power1.out' }, 1.6);

            /* 04 Launch & support: the arch caps the tower, the pole rises, the flag unfurls and keeps waving, "Live" pops in */
            const flag = $('.bk-flag', s4);
            const idle4 = gsap.to(flag, { skewY: 7, scaleX: 0.93, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true });
            const t4 = gsap.timeline({ paused: true, onComplete: () => idle4.play() });
            land(t4, $('.bk--arch', s4), 0)
                .fromTo($('.bk-pole', s4), { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: 'power3.out' }, 0.7)
                .fromTo(flag, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.out' }, 1.1)
                .fromTo($('.bk-live', s4), { scale: 0 }, { scale: 1, duration: 0.45, ease: 'back.out(1.7)' }, 1.5);

            const stories = [t1, t2, t3, t4];
            const played = [];
            let nextAt = 0, dead = false;
            return {
                fire(i) {
                    for (let j = 0; j <= i; j++) {
                        if (played[j]) continue;
                        played[j] = true;
                        const now = performance.now();
                        const at = Math.max(now, nextAt);
                        nextAt = at + 600;
                        gsap.delayedCall((at - now) / 1000, () => { if (!dead) stories[j].play(); });
                    }
                },
                kill() { dead = true; },
            };
        };

        mm.add(DESKTOP, () => {
            const blocks = blockStories();
            /* Still → video: driven by the accent tween below (its first frame forward, its return to rest in reverse) */
            let want = false, failed = false, resetT = 0;
            const show = () => { if (want && !failed) accent.classList.add('is-playing'); };
            const fail = () => { failed = true; accent.classList.remove('is-playing'); };
            const setPlaying = (on) => {
                if (!video || failed || on === want) return;
                want = on;
                clearTimeout(resetT);
                if (on) {
                    if (!video.paused && video.readyState > 2) show(); // still running from a fade-out that was cut short
                    const p = video.play();
                    if (p) p.catch(() => { want = false; });
                } else {
                    accent.classList.remove('is-playing');
                    resetT = setTimeout(() => { video.pause(); try { video.currentTime = 0; } catch (e) { /* not seekable yet */ } }, 320);
                }
            };
            if (video) {
                video.muted = true;
                video.preload = 'auto';
                video.addEventListener('playing', show);
                video.addEventListener('error', fail);
            }

            const tl = gsap.timeline({
                defaults: { ease: 'power3.out' },
                scrollTrigger: {
                    trigger: sec,
                    pin: true,
                    start: 'top top',
                    end: '+=150%',
                    scrub: 0.8,
                },
            });
            tl.fromTo(cols, { yPercent: 100 }, { yPercent: 0, duration: 0.5, stagger: 0.09 }, 0)
                .to({}, { duration: 0.15 }, 0.86)
                .fromTo(accent, { clipPath: 'inset(38% 40% 34% 40% round 20px)' }, {
                    clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 0.6, ease: 'power2.inOut',
                    onUpdate() { setPlaying(this.progress() > 0); },
                    onReverseComplete: () => setPlaying(false),
                }, 0.95)
                .to([head, floor], { y: -70, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, 1.0)
                .to({}, { duration: 0.12 });
            /* each story starts where its column finishes rising */
            cols.forEach((_, i) => tl.call(() => whenReady(() => blocks.fire(i)), null, 0.5 + 0.09 * i));
            if (media) tl.fromTo(media, { top: '38%', right: '40%', bottom: '34%', left: '40%' }, { top: '0%', right: '0%', bottom: '0%', left: '0%', duration: 0.6, ease: 'power2.inOut' }, 0.95);

            return () => {
                blocks.kill();
                clearTimeout(resetT);
                want = false;
                accent.classList.remove('is-playing');
                if (video) {
                    video.removeEventListener('playing', show);
                    video.removeEventListener('error', fail);
                    video.pause();
                }
                if (media) gsap.set(media, { clearProps: 'top,right,bottom,left' });
            };
        });

        mm.add(MOBILE, () => {
            const tl = gsap.timeline({ paused: true })
                .fromTo(cols, { yPercent: 100 }, { yPercent: 0, duration: 1, stagger: 0.1, ease: 'expo.out' }, 0);
            const blocks = blockStories();
            cols.forEach((_, i) => tl.call(() => blocks.fire(i), null, 0.7 + 0.1 * i)); // expo.out has visibly landed by 70%
            ScrollTrigger.create({ trigger: floor, start: 'top 80%', once: true, onEnter: () => whenReady(() => tl.play()) });
            return () => blocks.kill();
        });
    }

    /* ── CIRCUIT LINE-ART: drifts at different speeds ── */
    function lineArt() {
        mm.add(DESKTOP, () => {
            $$('[data-art]').forEach((wrap) => {
                $$('svg', wrap).forEach((svg) => {
                    gsap.fromTo(svg, { y: gsap.utils.random(-60, 60), rotate: gsap.utils.random(-10, 10) }, {
                        y: gsap.utils.random(-220, -80), rotate: gsap.utils.random(-14, 14), ease: 'none',
                        scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true },
                    });
                });
            });
        });
    }

    /* ── IMAGE EXPAND (case studies): the inset hero card grows to full bleed; walkthrough videos play in view ── */
    function expanders() {
        $$('[data-expand]').forEach((fig) => {
            const clip = $('.expand__clip', fig);
            const inner = $('.expand__in', fig);
            const video = $('video', fig);
            if (video) {
                ScrollTrigger.create({
                    trigger: fig,
                    start: 'top 95%',
                    end: 'bottom top',
                    onToggle: ({ isActive }) => {
                        if (isActive) {
                            video.preload = 'auto';
                            const p = video.play();
                            if (p) p.then(() => fig.classList.add('is-playing')).catch(() => {});
                        } else video.pause();
                    },
                });
            }
            if (reduce) return;
            mm.add(DESKTOP, () => {
                const st = { trigger: fig, start: 'top 70%', end: 'top top', scrub: true, invalidateOnRefresh: true };
                const g = () => parseFloat(getComputedStyle(root).getPropertyValue('--gutter')) || 32;
                gsap.fromTo(clip,
                    { clipPath: () => `inset(0px ${g()}px ${innerHeight * 0.06}px ${g()}px round 16px)` },
                    { clipPath: 'inset(0px 0px 0px 0px round 0px)', ease: 'none', scrollTrigger: st });
                gsap.fromTo(inner, { scale: 1.08 }, { scale: 1, ease: 'none', scrollTrigger: st });
            });
            mm.add(MOBILE, () => {
                const tw = gsap.fromTo(clip, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: 'power2.out', paused: true });
                ScrollTrigger.create({ trigger: fig, start: 'top 90%', once: true, onEnter: () => whenReady(() => tw.play()) });
            });
        });
        $$('[data-fullscreen]').forEach((btn) => btn.addEventListener('click', () => {
            const v = btn.closest('[data-expand]')?.querySelector('video');
            if (!v) return;
            const fs = v.requestFullscreen || v.webkitRequestFullscreen || v.webkitEnterFullscreen;
            if (fs) fs.call(v);
            v.muted = false;
            v.play().catch(() => {});
        }));
    }

    /* ── SELECTED WORK: the image rises through the giant headline ── */
    function overlap() {
        mm.add(DESKTOP, () => {
            $$('[data-overlap]').forEach((wrap) => {
                const st = { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true };
                gsap.fromTo($('.work__title', wrap), { yPercent: 0 }, { yPercent: -15, ease: 'none', scrollTrigger: st });
                gsap.fromTo($('.work__float', wrap), { y: () => innerHeight * 0.4 }, { y: () => -innerHeight * 0.2, ease: 'none', scrollTrigger: st });
            });
        });
    }

    /* ── INTERACTIVE SCREEN BROWSER ── */
    function carousels() {
        $$('[data-carousel]').forEach((wrap) => {
            const track = $('.carousel', wrap);
            const items = $$('.phone', track);
            const count = $('.demo__count b', wrap);
            const bar = $('.demo__bar i', wrap);
            if (!track || !items.length) return;
            const step = () => (items[1] ? items[1].offsetLeft - items[0].offsetLeft : track.clientWidth);
            const index = () => Math.max(0, Math.min(items.length - 1, Math.round(track.scrollLeft / step())));
            const go = (i) => track.scrollTo({ left: Math.max(0, Math.min(items.length - 1, i)) * step(), behavior: reduce ? 'auto' : 'smooth' });
            const update = () => {
                const max = track.scrollWidth - track.clientWidth;
                const i = track.scrollLeft >= max - 4 ? items.length - 1 : index();
                if (count) count.textContent = pad(i + 1);
                if (bar) bar.style.transform = `scaleX(${(i + 1) / items.length})`;
            };
            let raf = 0;
            track.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); }, { passive: true });
            $$('[data-step]', wrap).forEach((b) => b.addEventListener('click', () => go(index() + Number(b.dataset.step))));
            track.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight') { e.preventDefault(); go(index() + 1); }
                if (e.key === 'ArrowLeft') { e.preventDefault(); go(index() - 1); }
            });
            // Mouse drag (touch scrolls natively)
            let down = false, sx = 0, sl = 0;
            track.addEventListener('pointerdown', (e) => {
                if (e.pointerType !== 'mouse' || e.button !== 0) return;
                down = true;
                sx = e.clientX;
                sl = track.scrollLeft;
                track.classList.add('is-drag');
                track.setPointerCapture(e.pointerId);
            });
            track.addEventListener('pointermove', (e) => { if (down) track.scrollLeft = sl - (e.clientX - sx); });
            const up = () => {
                if (!down) return;
                down = false;
                track.classList.remove('is-drag');
                go(index());
            };
            track.addEventListener('pointerup', up);
            track.addEventListener('pointercancel', up);
            update();
        });
    }

    /* ── ACCORDION ROWS (pricing, services, FAQ): tap or click; height animates, no layout jump ── */
    function accordions() {
        let refreshT = 0;
        const refreshSoon = () => { clearTimeout(refreshT); refreshT = setTimeout(() => ScrollTrigger.refresh(), 120); };
        $$('[data-accordion]').forEach((acc) => {
            const items = $$('.price', acc);
            const single = acc.dataset.accordion !== 'multi';
            const set = (item, on) => {
                const panel = $('.price__panel', item);
                const btn = $('.price__row', item);
                if (item.classList.contains('is-open') === on) return;
                item.classList.toggle('is-open', on);
                btn.setAttribute('aria-expanded', String(on));
                if (reduce) {
                    gsap.set(panel, { height: on ? 'auto' : 0 });
                    return refreshSoon();
                }
                gsap.to(panel, { height: on ? 'auto' : 0, duration: 0.5, ease: 'power3.out', overwrite: true, onComplete: refreshSoon });
                if (on) gsap.fromTo($$('.price__cols > *', panel), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.05, delay: 0.08, ease: 'power3.out' });
            };
            items.forEach((item) => {
                $('.price__row', item).addEventListener('click', () => {
                    const on = !item.classList.contains('is-open');
                    if (on && single) items.forEach((o) => o !== item && set(o, false));
                    set(item, on);
                });
            });
        });
    }

    /* ── FULL-BLEED STORY: inset image grows to full bleed, a second one grows over it, headlines swap ── */
    /* Illustrated scenes for the story section (js/story-scenes.js, loaded when the section is near).
       Returns { attach(mode, tl) } for story() to hand its timeline to. */
    function storyArt(sec) {
        let api = null, want = reduce ? { mode: 'static' } : null, off = null;
        const run = () => {
            if (off) { off(); off = null; }
            if (api && want) off = api.attach({ sec, gsap, ScrollTrigger, whenReady, ...want });
        };
        new IntersectionObserver(([e], io) => {
            if (!e.isIntersecting) return;
            io.disconnect();
            const sc = document.createElement('script');
            sc.src = '/js/story-scenes.js';
            sc.onload = () => { api = window.NLTStoryScenes; run(); };
            document.head.append(sc);
        }, { rootMargin: '150% 0px' }).observe(sec);
        return {
            attach(mode, tl) { want = { mode, tl }; run(); },
            detach() { want = null; if (off) { off(); off = null; } },
        };
    }

    function story() {
        const sec = $('[data-story]');
        if (!sec) return;
        const art = storyArt(sec);
        if (reduce) return;
        const a = $('.story__layer--a', sec);
        const b = $('.story__layer--b', sec);
        const shade = $('.story__shade', sec);
        const eyebrow = $('.story__eyebrow', sec);
        const para = $('.story__p', sec);
        const linesA = $$('.story__h--a .sl > span', sec);
        const linesB = $$('.story__h--b .sl > span', sec);

        mm.add(DESKTOP, () => {
            gsap.set(linesB, { yPercent: 140 });
            gsap.set(b, { autoAlpha: 0 });
            const tl = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: sec,
                    pin: true,
                    start: 'top top',
                    end: '+=200%',
                    scrub: 0.8,
                    onUpdate: (self) => setTheme(sec, self.progress > 0.1 ? 'dark' : 'light'),
                },
            });
            tl.fromTo(a, { clipPath: 'inset(10% 7% 10% 7% round 16px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 0.6, ease: 'power2.inOut' }, 0)
                .to(shade, { opacity: 1, duration: 0.3 }, 0.3)
                .to(eyebrow, { opacity: 1, duration: 0.2 }, 0.45)
                .fromTo(linesA, { yPercent: 140 }, { yPercent: 0, duration: 0.35, stagger: 0.07, ease: 'power3.out' }, 0.45)
                .to(para, { opacity: 1, duration: 0.25 }, 0.6)
                .set(b, { autoAlpha: 1 }, 1.0)
                .fromTo(b, { clipPath: 'inset(30% 12% 30% 64% round 14px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 0.8, ease: 'power2.inOut' }, 1.0)
                .to(linesA, { yPercent: -140, duration: 0.3, stagger: 0.04, ease: 'power2.in' }, 1.15)
                .to(linesB, { yPercent: 0, duration: 0.35, stagger: 0.07, ease: 'power3.out' }, 1.5)
                .to({}, { duration: 0.35 });
            art.attach('desktop', tl);
            return () => { art.detach(); setTheme(sec, 'dark'); };
        });

        mm.add(MOBILE, () => {
            art.attach('mobile');
            return () => art.detach();
        });
    }

    /* ── FOOTER (existing behaviour): the wordmark slides up as the footer enters ── */
    function footer() {
        if (reduce || !$('.footer__mark span')) return;
        gsap.fromTo('.footer__mark span', { yPercent: 60 }, {
            yPercent: 0, ease: 'none',
            scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true },
        });
    }

    /* ── FORMS: mailto hand-off (no backend), chips included in the message ── */
    function forms() {
        $$('form[data-mailto]').forEach((form) => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!form.reportValidity()) return;
                const data = new FormData(form);
                const lines = [];
                const seen = new Set();
                for (const [key, value] of data.entries()) {
                    if (value instanceof File) continue;
                    if (seen.has(key)) continue;
                    seen.add(key);
                    const all = data.getAll(key).filter((v) => !(v instanceof File) && v);
                    if (!all.length) continue;
                    const label = form.querySelector(`[name="${key}"]`)?.dataset.label || key;
                    lines.push(`${label}: ${all.join(', ')}`);
                }
                const file = form.querySelector('input[type="file"]');
                if (file && file.files.length) lines.push(`CV file: ${file.files[0].name} (please attach it to this email)`);
                const subject = (form.dataset.subject || 'Website enquiry') + (data.get('name') ? ` from ${data.get('name')}` : '');
                location.href = `mailto:${form.dataset.mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
            });
            const file = form.querySelector('.file-drop input');
            if (file) file.addEventListener('change', () => {
                $('.file-drop span', form).textContent = file.files.length ? file.files[0].name : 'PDF or DOC, click to upload';
            });
        });
    }

    /* ── INIT: wait for the webfont so splits measure correctly, then build section by section
       (one task each, so no single long task blocks input) ── */
    const nextTask = () => new Promise((r) => setTimeout(r, 0));
    const fontsReady = Promise.race([document.fonts ? document.fonts.ready : null, new Promise((r) => setTimeout(r, 1500))]);
    const intro = loader();

    intro.then((hadLoader) => {
        openGate();
        if (!reduce) gsap.to('#navbar', { yPercent: 0, y: 0, duration: 1, ease: 'expo.out', delay: hadLoader ? 0.2 : 0.1 });
        heroIn();
        queueTheme();
    });

    fontsReady.then(async () => {
        try {
            for (const step of [cursor, heroHold, curves, statements, wordFill, metaLists, buildScene, lineArt, expanders, frames, carousels, overlap,
                images, cards, accordions, story, keyPoints, tiles, headlines, reveals, footer, forms]) {
                step();
                await nextTask();
            }
            // Refresh in page order, so every trigger below a pin includes that pin's scroll length
            ScrollTrigger.sort((a, b) => {
                if (!a.trigger || !b.trigger || a.trigger === b.trigger) return 0;
                return a.trigger.compareDocumentPosition(b.trigger) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
            });
            ScrollTrigger.refresh();
            queueTheme();
            if (location.hash.length > 1) {
                const target = document.getElementById(location.hash.slice(1));
                if (target) whenReady(() => (lenis ? lenis.scrollTo(target, { immediate: true, force: true }) : target.scrollIntoView()));
            }
        } catch (err) {
            root.classList.remove('js');
            console.error(err);
        }
    });
    addEventListener('load', () => ScrollTrigger.refresh());
})();
