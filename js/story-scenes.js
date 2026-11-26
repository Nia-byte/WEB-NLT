/* ═══════════════════════════════════════════════════════════════════════════
   NIALURE TECH: illustrated scenes for the "Behind the build" story section
   Lazy-loaded by js/site.js story() when the section nears the viewport.

   StoryScene({ scene: 1|2 }) returns one inline SVG ("Idea to Live", in the "Ink & Dot" look; colours: css/site.css .sv).
   All art is original and drawn here. The SVG markup is each scene's finished frame;
   the beats below only describe how it gets there, so no-JS and reduced motion show the result.

   Every prop is nested the same way, so the three kinds of motion never fight over one transform:
     g.px (scroll parallax) > g[transform] (position) > g[data-p] (scrubbed beats) > g.e (entrance) > g.i (CSS idle loop)
   ═══════════════════════════════════════════════════════════════════════════ */
(() => {
    'use strict';
    let uid = 0;
    const r1 = (n) => Math.round(n * 10) / 10;

    /* ── drawing helpers ── */
    // A floating prop. o: d parallax depth · e plays the entrance · i idle class · m [x, y, scale] on mobile, false = left out
    function G(c, name, x, y, inner, o = {}) {
        if (c.mobile && o.m === false) return '';
        const [tx, ty, ts] = c.mobile && o.m ? o.m : [x, y, 1];
        return `<g class="px" data-d="${o.d || 0}"><g transform="translate(${r1(tx)} ${r1(ty)}) scale(${ts})"><g data-p="${name}"><g${o.e ? ' class="e"' : ''}><g${o.i ? ` class="i ${o.i}"` : ''}>${inner}</g></g></g></g></g>`;
    }
    // A free-standing line (rays): gets a halo so it reads on both the white card and the blue field
    const free = (d, w = 4) => `<path class="fh" d="${d}" stroke-width="${w + 6}"/><path class="fl" d="${d}" stroke-width="${w}"/>`;

    // Curved floating screen: both long edges bow the same way, like a curved monitor seen from just above
    function panel(c, kind, w, h, bow, inner) {
        const d = `M0 0Q${w / 2} ${2 * bow} ${w} 0V${h}Q${w / 2} ${h + 2 * bow} 0 ${h}Z`;
        const f = (x) => r1(4 * bow * (x / w) * (1 - x / w));
        return `<path class="pn-sh" d="${d}" transform="translate(12 14)" fill="url(#${c.id}ht)"/>
            <path class="pn pn--${kind}" d="${d}"/>
            <circle class="dot" cx="22" cy="${22 + f(22)}" r="5"/><circle class="dot" cx="38" cy="${22 + f(38)}" r="5"/><circle class="dot" cx="54" cy="${22 + f(54)}" r="5"/>
            ${inner(f)}`;
    }
    const bar = (f, x, y, len, cls, sw = 8) => `<path class="cb ${cls}" d="M${x} ${r1(y + f(x))}L${x + len} ${r1(y + f(x + len))}" stroke-width="${sw}"/>`;
    const code = (f, x0, y0, lh, lines) => lines.map((segs, i) => segs.map(([dx, len, cls]) => bar(f, x0 + dx, y0 + i * lh, len, cls)).join('')).join('');

    // The finished website (flat, not curved). Parts are named s-* so the beats can build it piece by piece.
    function site(c) {
        const card = (i, cls) => `<rect class="f-soft" x="${28 + i * 178}" y="304" width="166" height="74" rx="10"/><circle class="${cls}" cx="${52 + i * 178}" cy="328" r="10"/><rect class="f-ink" x="${72 + i * 178}" y="323" width="84" height="9" rx="4.5"/><rect class="f-mid" x="${42 + i * 178}" y="350" width="126" height="7" rx="3.5"/>`;
        return `<g data-p="s-frame"><rect class="pn-sh" x="12" y="14" width="580" height="400" rx="16" fill="url(#${c.id}ht)"/>
            <rect class="pn pn--w" width="580" height="400" rx="16"/></g>
            <g data-p="s-bar"><circle class="dot" cx="24" cy="21" r="5"/><circle class="dot" cx="40" cy="21" r="5"/><circle class="dot" cx="56" cy="21" r="5"/><rect class="f-soft" x="190" y="11" width="200" height="20" rx="10"/><path class="sv-rule" d="M0 42H580"/></g>
            <g data-p="s-nav"><circle class="b1" cx="34" cy="68" r="10"/><circle class="b2" cx="46" cy="73" r="10"/><rect class="f-mid" x="318" y="66" width="44" height="7" rx="3.5"/><rect class="f-mid" x="378" y="66" width="44" height="7" rx="3.5"/><rect class="f-mid" x="438" y="66" width="44" height="7" rx="3.5"/><rect class="f-ink" x="500" y="57" width="56" height="26" rx="13"/></g>
            <g data-p="s-h1"><rect class="f-ink" x="28" y="118" width="230" height="22" rx="7"/><rect class="f-ink" x="28" y="150" width="170" height="22" rx="7"/></g>
            <g data-p="s-p"><rect class="f-mid" x="28" y="190" width="214" height="8" rx="4"/><rect class="f-mid" x="28" y="206" width="160" height="8" rx="4"/></g>
            <g data-p="s-btn"><rect class="f-a1" x="28" y="232" width="122" height="38" rx="19"/><rect x="52" y="247" width="74" height="8" rx="4" fill="#fff"/></g>
            <g data-p="s-img"><rect class="f-a2" x="300" y="104" width="252" height="176" rx="14"/><circle cx="398" cy="180" r="46" fill="#fff"/><circle class="f-a1" cx="454" cy="206" r="46" opacity=".9"/></g>
            <g data-p="s-cards">${card(0, 'f-a1')}${card(1, 'f-a2')}${card(2, 'f-a1')}</g>`;
    }
    const cursor = () => `<path class="cur" d="M0 0V27L7 20L12.5 31L18 28.5L12.5 18H23Z"/>`;

    /* ── backdrop: a white card on desktop scene 1 (fades out as the section opens) and a halftone sun ── */
    function backdrop(c) {
        return `${c.scene === 1 && !c.mobile ? `<rect data-p="card" x="-3000" y="-3000" width="7600" height="6900" fill="#f4f5fa"/>` : ''}<circle class="bd-dots" cx="1050" cy="330" r="330" fill="url(#${c.id}hb)"/>`;
    }

    /* ── the story: "Idea to Live" ──
       Markup for both scenes plus three beat builders:
         s1(k)      scene 1, positions 0 → 0.95 (lands before the headline swap)
         out(k)     scene 1 handing over while the next layer grows (desktop only)
         s2(k, O)   scene 2, from O (the moment its preview appears) to O + 1.2
       k = { ft, to, q } bound to that scene's SVG and the timeline being built. */
    const M2 = (x, y) => [47.4 + x * 0.43, 65.5 + y * 0.43, 0.43]; // scene-2 props share one mobile placement
    const fillSite = (k, at, parts = ['s-bar', 's-nav', 's-h1', 's-p', 's-btn', 's-img', 's-cards']) => {
        parts.forEach((p, i) => k.ft(p, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.14, ease: 'expo.out' }, at + i * 0.07));
    };

    const STORY = {
        label: ['Illustration of a website taking shape from an idea, code and design screens', 'Illustration of a finished website going live'],
        scene1: (c) => G(c, 'bulb', 300, 100, `<g data-p="rays">${free('M40 -6V-20M4 12L-8 2M76 12L88 2M-6 46H-20M86 46H100')}</g><circle class="f-bulb o" cx="40" cy="40" r="28"/><path class="n fil" d="M30 47q10 -17 20 0"/><path class="f-dark o" d="M28 66h24v11q0 9 -12 9t-12 -9z"/>`, { i: 'i-bob3' })
            + G(c, 'p1', 640, 170, panel(c, 'k', 380, 270, 12, (f) => code(f, 28, 64, 24, [
                [[0, 46, 'k1'], [58, 92, 'k0']], [[22, 70, 'k2'], [104, 60, 'k0'], [176, 40, 'k3']], [[22, 112, 'k0'], [146, 50, 'k1']], [[44, 60, 'k3'], [116, 120, 'k0']],
                [[44, 92, 'k0']], [[22, 50, 'k2'], [84, 100, 'k0'], [196, 60, 'k1']], [[22, 132, 'k0']], [[0, 56, 'k1']]])), { d: 0.04, e: 1, i: 'i-bob1', m: [402, 120, 0.64] })
            + G(c, 'p2', 1076, 118, panel(c, 'w', 300, 200, 10, (f) => `<rect class="f-soft" x="24" y="${50 + f(24)}" width="110" height="112" rx="10"/><circle class="f-a2" cx="64" cy="${96 + f(64)}" r="20"/><circle class="f-a1" cx="92" cy="${112 + f(92)}" r="20" opacity=".9"/>${bar(f, 156, 62, 110, 'k0', 12)}${bar(f, 156, 88, 80, 'k0', 12)}${bar(f, 156, 116, 116, 'k3', 7)}${bar(f, 156, 132, 90, 'k3', 7)}${bar(f, 156, 160, 60, 'k1', 14)}`), { d: 0.08, i: 'i-bob2', m: false })
            + G(c, 'p3', 1104, 356, panel(c, 'a', 320, 180, 10, (f) => `<path class="glyph" d="M70 ${76 + f(70)}L40 ${104 + f(40)}L70 ${132 + f(70)}M116 ${76 + f(116)}L146 ${104 + f(146)}L116 ${132 + f(116)}M100 ${66 + f(100)}L86 ${142 + f(86)}"/>${bar(f, 178, 80, 108, 'ka', 9)}${bar(f, 178, 104, 72, 'ka', 9)}${bar(f, 178, 128, 96, 'ka', 9)}`), { d: 0.1, i: 'i-bob4', m: false })
            + G(c, 'prog', 640, 486, `<path class="trk" d="M5 5H375"/><path class="trk-fill" data-p="progfill" d="M5 5H375"/>`, { d: 0.04, e: 1, i: 'i-bob1', m: [402, 322, 0.64] }),
        scene2: (c) => G(c, 'site', 820, 174, site(c), { d: 0.05, i: 'i-bob2', m: M2(820, 150) })
            + G(c, 'c1', 878, 128, `<circle class="b1 ring" r="36"/>`, { d: 0.05, i: 'i-bob2', m: M2(878, 104) })
            + G(c, 'c2', 922, 150, `<circle class="b2 ring" r="36"/>`, { d: 0.05, i: 'i-bob2', m: M2(922, 126) })
            + G(c, 'live', 1290, 150, `<rect class="sv-badge" width="112" height="46" rx="23"/><circle class="f-a2" cx="26" cy="23" r="8"/><text class="t" x="43" y="30.5" font-size="22">Live</text>`, { d: 0.05, i: 'i-bob2', m: M2(1290, 126) })
            + G(c, 'cursor', 936, 434, `<circle class="click" data-p="click" cx="2" cy="2" r="22"/>${cursor()}`, { d: 0.05, i: 'i-bob2', m: M2(936, 410) }),
        s1(k) {
            k.ft('bulb', { scale: 0, opacity: 0, rotation: -18 }, { scale: 1, opacity: 1, rotation: 0, transformOrigin: '50% 100%', duration: 0.14, ease: 'back.out(1.6)' }, 0.05);
            k.ft('rays', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, transformOrigin: '50% 60%', duration: 0.1, ease: 'expo.out' }, 0.15);
            k.ft('p2', { x: 260, opacity: 0, rotation: 6 }, { x: 0, opacity: 1, rotation: 0, transformOrigin: '50% 50%', duration: 0.3, ease: 'expo.out' }, 0.2);
            k.ft('p3', { x: 320, opacity: 0, rotation: -5 }, { x: 0, opacity: 1, rotation: 0, transformOrigin: '50% 50%', duration: 0.3, ease: 'expo.out' }, 0.3);
            k.ft(k.q('[data-p="p1"] .cb').slice(5), { scaleX: 0 }, { scaleX: 1, transformOrigin: '0% 50%', duration: 0.05, stagger: 0.028, ease: 'none' }, 0.14);
            k.ft('progfill', { scaleX: 0 }, { scaleX: 1, transformOrigin: '0% 50%', duration: 0.62, ease: 'none' }, 0.3);
        },
        out(k) {
            k.to('p1', { x: 250, y: 30, scale: 1.12, opacity: 0, transformOrigin: '50% 50%', duration: 0.4, ease: 'power3.out' }, 1.02);
            k.to('p2', { x: -110, y: 110, opacity: 0, duration: 0.4, ease: 'power3.out' }, 1.05);
            k.to('p3', { x: -150, y: -90, opacity: 0, duration: 0.4, ease: 'power3.out' }, 1.08);
            k.to(['bulb', 'prog'], { opacity: 0, duration: 0.25, ease: 'none' }, 1.05);
        },
        s2(k, O) {
            fillSite(k, O + 0.04);
            k.ft('cursor', { x: 170, y: 110, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.22, ease: 'power3.out' }, O + 0.58);
            k.ft('click', { scale: 0.2, opacity: 0.9 }, { scale: 1.5, opacity: 0, transformOrigin: '50% 50%', duration: 0.12, ease: 'power3.out' }, O + 0.84);
            k.ft('s-btn', { scale: 1 }, { scale: 0.93, transformOrigin: '50% 50%', duration: 0.04, repeat: 1, yoyo: true, ease: 'none' }, O + 0.84);
            k.ft('live', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, transformOrigin: '50% 50%', duration: 0.12, ease: 'back.out(1.6)' }, O + 0.92);
            k.ft('c1', { x: -150, opacity: 0 }, { x: 0, opacity: 1, duration: 0.24, ease: 'power3.out' }, O + 0.94);
            k.ft('c2', { x: 170, y: -30, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.24, ease: 'power3.out' }, O + 0.96);
        },
    };

    /* ── the component ── */
    function StoryScene({ scene, mobile = false }) {
        const c = { id: `sv${++uid}`, scene, mobile };
        return `<svg class="sv sv--s${scene}${mobile ? ' sv--m' : ''}" viewBox="0 0 1600 900" role="img" aria-label="${STORY.label[scene - 1]}" focusable="false">
            <defs>
                <pattern id="${c.id}ht" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle class="htd" cx="2" cy="2" r="1.7"/></pattern>
                <pattern id="${c.id}hb" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle class="htd" cx="4" cy="4" r="3"/></pattern>
            </defs>
            <g aria-hidden="true">${backdrop(c)}${scene === 1 ? STORY.scene1(c) : STORY.scene2(c)}</g>
        </svg>`;
    }

    /* ── wiring: mount both scenes into the existing layers and add their beats to the section's timeline ── */
    function attach(env) {
        const { sec, mode, tl, gsap, whenReady } = env;
        const st = STORY;
        const mobile = matchMedia('(max-width: 767px)').matches;
        const layers = [sec.querySelector('.story__layer--a'), sec.querySelector('.story__layer--b')];
        const boxes = layers.map((layer, i) => {
            let box = layer.querySelector('.story__scene');
            if (!box) { box = document.createElement('div'); box.className = 'story__scene'; layer.append(box); }
            gsap.set(box, { clearProps: 'transform' });
            box.innerHTML = StoryScene({ scene: i + 1, mobile });
            return box;
        });
        const [A, B] = boxes.map((b) => b.firstElementChild);
        const linesA = sec.querySelectorAll('.story__h--a .sl > span');
        const linesB = sec.querySelectorAll('.story__h--b .sl > span');
        const undo = [];
        const kit = (t, svg) => {
            const q = (n) => (n instanceof Element ? [n] : Array.isArray(n) ? n.flatMap(q) : Array.from(svg.querySelectorAll(/^[.[]/.test(n) ? n : `[data-p="${n}"]`)));
            return {
                q,
                // the origin goes on both ends, otherwise GSAP re-bases it mid-tween and the element jumps
                ft: (n, a, b, at) => {
                    const e = q(n);
                    const o = b.svgOrigin ? { svgOrigin: b.svgOrigin } : b.transformOrigin ? { transformOrigin: b.transformOrigin } : null;
                    if (e.length) t.fromTo(e, { ...o, ...a }, b, at);
                },
                to: (n, b, at) => { const e = q(n); if (e.length) t.to(e, b, at); },
            };
        };
        const cleanup = () => { undo.forEach((fn) => fn()); sec.classList.remove('is-live', 'story--swap'); };

        // Reduced motion: the finished frame of scene 1, nothing moving
        if (mode === 'static') {
            const t = gsap.timeline({ paused: true });
            st.s1(kit(t, A));
            t.progress(1);
            gsap.set(A.querySelectorAll('[data-p="card"]'), { opacity: 0 });
            return cleanup;
        }

        // Idle layer: CSS loops run only while the section is on screen
        const io = new IntersectionObserver(([e]) => sec.classList.toggle('is-live', e.isIntersecting));
        io.observe(sec.querySelector('.story__pin'));
        undo.push(() => io.disconnect());

        const entrance = (t, k = 1) => t.fromTo(A.querySelectorAll('.e'), { opacity: 0, y: 46 }, { opacity: 1, y: 0, duration: 1.1 * k, stagger: 0.08 * k, ease: 'expo.out' }, 0);

        if (mode === 'desktop' && tl) {
            const before = tl.duration();
            const kA = kit(tl, A), kB = kit(tl, B);
            // the scene scales gently from its left edge while the card opens
            tl.fromTo(boxes[0], { scale: 1 }, { scale: 1.08, transformOrigin: '0% 50%', duration: 0.9, ease: 'none' }, 0);
            gsap.set(boxes[1], { scale: 1.08, transformOrigin: '0% 50%' });
            kA.ft('card', { opacity: 1 }, { opacity: 0, duration: 0.3, ease: 'power2.inOut' }, 0.08);
            // floating panels drift at different speeds
            kA.q('.px').forEach((el) => { const d = +el.dataset.d; if (d) tl.fromTo(el, { x: d * 320 }, { x: -d * 320, duration: 1.6, ease: 'none' }, 0); });
            kB.q('.px').forEach((el) => { const d = +el.dataset.d; if (d) tl.fromTo(el, { x: d * 420 }, { x: 0, duration: 1.2, ease: 'power2.out' }, 1.0); });
            st.s1(kA);
            st.out(kA);
            st.s2(kB, 1.0);
            if (tl.duration() > before + 0.001) console.warn('[story] scene beats run past the section timeline', tl.duration(), before);
            tl.render(tl.time(), true, true);

            const intro = entrance(gsap.timeline({ paused: true }));
            const seen = new IntersectionObserver(([e]) => { if (e.isIntersecting) { seen.disconnect(); whenReady(() => intro.play()); } }, { threshold: 0.2 });
            seen.observe(sec);
            undo.push(() => { seen.disconnect(); intro.kill(); });
            return cleanup;
        }

        // Mobile: no pin and no scrub. Scene 1 plays once on enter; further down, scene 2 and its headline fade in (and back out on the way up).
        sec.classList.add('story--swap');
        gsap.set(linesB, { yPercent: 140 });
        gsap.set(layers[1], { autoAlpha: 0 });
        const t1 = gsap.timeline({ paused: true });
        t1.fromTo(linesA, { yPercent: 140 }, { yPercent: 0, duration: 0.4, stagger: 0.03, ease: 'expo.out' }, 0);
        entrance(t1, 0.4);
        st.s1(kit(t1, A));
        t1.timeScale(0.38);
        const t2 = gsap.timeline({ paused: true });
        t2.to(layers[1], { autoAlpha: 1, duration: 0.22, ease: 'power2.inOut' }, 0)
            .to(linesA, { yPercent: -140, duration: 0.16, stagger: 0.02, ease: 'power2.in' }, 0)
            .to(linesB, { yPercent: 0, duration: 0.24, stagger: 0.04, ease: 'power3.out' }, 0.2);
        st.s2(kit(t2, B), 0);
        t2.timeScale(0.4);
        const s1 = env.ScrollTrigger.create({ trigger: sec, start: 'top 65%', once: true, onEnter: () => whenReady(() => t1.play()) });
        const s2 = env.ScrollTrigger.create({ trigger: sec, start: 'top 14%', onEnter: () => { t1.progress(1); t2.timeScale(0.4).play(); }, onLeaveBack: () => t2.timeScale(1).reverse() });
        undo.push(() => {
            s1.kill(); s2.kill(); t1.kill(); t2.kill();
            gsap.set([layers[1], ...linesA, ...linesB], { clearProps: 'all' });
        });
        return cleanup;
    }

    window.NLTStoryScenes = { StoryScene, attach };
})();
