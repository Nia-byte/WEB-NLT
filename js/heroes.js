/* ═══════════════════════════════════════════════════════════════════════════
   HOME HERO: "The Cube"
   One browser-style window shows the same generic website as Brief → Design → Code → Live on the four
   faces of a cube. js/site.js runs the shared entrance / exit and calls window.NLTHero(ctx).
   ═══════════════════════════════════════════════════════════════════════════ */
(() => {
    const inView = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
    const mod = (n, m) => ((n % m) + m) % m;

    /* ── DesignCodeWindow: the window on each face (markup in index.html: .dcw > .dcw__bar + .dcw__body > .dcw__l).
       API: select(key, instant) moves the selection box + "Design" cursor; autoSelect(keys) loops through them. ── */
    function DesignCodeWindow(el, { gsap, reduce = false }) {
        const q = (s, c = el) => c.querySelector(s);
        const qa = (s, c = el) => Array.from(c.querySelectorAll(s));
        const api = { el, hovering: false };
        const setHot = (k) => qa('[data-k]').forEach((n) => n.classList.toggle('is-hot', !!k && n.dataset.k === k));
        const onScreen = () => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };

        // Selection box + "Design" cursor tag (offset metrics, so it also works inside the rotated cube)
        const design = q('.dcw__l--design');
        const sel = design && q('.dc__sel', design);
        const tag = design && q('.dc__cur', design);
        api.select = (k, instant) => {
            setHot(k);
            if (!sel) return;
            const bs = qa('[data-k]', design).filter((b) => b.dataset.k === k);
            if (!bs.length) return;
            const l = Math.min(...bs.map((b) => b.offsetLeft)), t = Math.min(...bs.map((b) => b.offsetTop));
            const r = Math.max(...bs.map((b) => b.offsetLeft + b.offsetWidth)), b2 = Math.max(...bs.map((b) => b.offsetTop + b.offsetHeight));
            const box = { x: l - 4, y: t - 4, w: r - l + 8, h: b2 - t + 8 };
            const size = () => { sel.style.width = `${box.w}px`; sel.style.height = `${box.h}px`; };
            if (instant || reduce) {
                size();
                gsap.set(sel, { x: box.x, y: box.y, autoAlpha: 1 });
                gsap.set(tag, { x: box.x + box.w - 10, y: box.y + box.h - 8, autoAlpha: 1 });
                return;
            }
            gsap.timeline().to(sel, { autoAlpha: 0, duration: 0.15 }).add(size).set(sel, { x: box.x, y: box.y, scale: 0.96 })
                .to(sel, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'power3.out' });
            gsap.to(tag, { x: box.x + box.w - 10, y: box.y + box.h - 8, autoAlpha: 1, duration: 0.8, ease: 'power3.inOut' });
        };
        let loop = null;
        api.autoSelect = (order) => {
            if (loop) loop.kill();
            if (!order || !order.length) return;
            let i = 0;
            api.select(order[0], true);
            if (reduce || order.length < 2) return;
            const tick = () => {
                if (!api.hovering && !document.hidden && onScreen()) { i = (i + 1) % order.length; api.select(order[i]); }
                loop = gsap.delayedCall(2.4, tick);
            };
            loop = gsap.delayedCall(2.4, tick);
        };
        // Hovering a block highlights it, and the selection follows
        el.addEventListener('pointerover', (e) => {
            const t = e.target.closest('[data-k]');
            if (!t || !el.contains(t)) return;
            api.hovering = true;
            api.select(t.dataset.k);
        });
        el.addEventListener('pointerleave', () => { api.hovering = false; });
        return api;
    }

    /* ── Hero 1: The Cube ──
       One window: the same website as Brief → Design → Code → Live on the faces of a cube. It turns on its own and
       pauses while the visitor hovers it, focuses it with the keyboard, or has just used it. Drag / swipe = next or
       previous state (one face per gesture); click, Enter, Space or the arrow keys change state too. The service
       ticket follows the face; changes the visitor makes are announced in a polite live region. */
    window.NLTHero = ({ hero, gsap, reduce, $, $$ }) => {
        const wrap = $('.cube-wrap', hero);
        const cube = $('.cube', hero);
        const faces = $$('.cube__face', hero);
        const ticket = $('.ticket-wrap--r', hero);
        const fields = $$('[data-t]', ticket);
        const tbody = $$('.ticket__body', ticket);
        const live = $('.hx1-live', hero);
        const wins = faces.map((f) => DesignCodeWindow($('.dcw', f), { gsap, reduce }));
        const n = faces.length;
        let current = 1, spinning = true, auto = null, idle = 0, hovering = false, focused = false, announce = false;

        const fill = (i, animate) => {
            const d = faces[i].dataset;
            const set = () => fields.forEach((el) => { el.textContent = d[el.dataset.t]; });
            // Only changes the visitor makes are announced, so the auto-turn stays quiet for screen readers
            if (announce) live.textContent = `${d.face}, state ${i + 1} of ${n}. ${d.service}.`;
            if (!animate || reduce) return set();
            gsap.timeline()
                .to(tbody, { autoAlpha: 0, y: -8, duration: 0.18, ease: 'power2.in', overwrite: true })
                .add(set)
                .to(tbody, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out' });
        };
        const setFace = (i) => { if (i !== current) { current = i; fill(i, true); } };
        const track = () => { if (!spinning) setFace(mod(Math.round(-gsap.getProperty(cube, 'rotationY') / 90), n)); };
        // GSAP owns the turn from here; the tilt stays on .cube-tilt (CSS) so it looks the same on every face
        cube.style.transform = 'none';
        gsap.set(cube, { rotationX: 0, rotationY: -90, rotationZ: 0 });
        const turnTo = (t, dur = 1.1) => gsap.to(cube, { rotationY: t, duration: reduce ? 0 : dur, ease: 'power3.inOut', overwrite: true, onUpdate: track, onComplete: track });
        const goFace = (i, byUser) => {
            announce = !!byUser;
            const r = gsap.getProperty(cube, 'rotationY');
            let t = -mod(i, n) * 90;
            t += Math.round((r - t) / 360) * 360;
            turnTo(t);
        };
        const step = (d, byUser = true) => goFace(current + d, byUser);

        // Auto-turn: Brief → Design → Code → Live, never while the visitor is on it
        const canAuto = () => !hovering && !focused && !document.hidden && inView(hero);
        const startAuto = () => {
            if (reduce) return;
            if (auto) auto.kill();
            const tick = () => {
                if (canAuto()) step(1, false);
                auto = gsap.delayedCall(3.6, tick);
            };
            auto = gsap.delayedCall(3.6, tick);
        };
        const pause = () => {
            if (auto) auto.kill();
            auto = null;
            clearTimeout(idle);
            if (!reduce) idle = setTimeout(startAuto, 9000);
        };
        wrap.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovering = true; });
        wrap.addEventListener('pointerleave', () => { hovering = false; });
        hero.addEventListener('focusin', (e) => {
            if (e.target === wrap ? wrap.matches(':focus-visible') : e.target.closest('.hx1-ctrl')) focused = true;
        });
        hero.addEventListener('focusout', (e) => {
            const to = e.relatedTarget;
            if (!to || !(to === wrap || to.closest('.hx1-ctrl'))) focused = false;
        });

        // Keyboard and the (visually hidden until focused) previous / next buttons
        wrap.addEventListener('keydown', (e) => {
            const d = { ArrowRight: 1, ArrowLeft: -1, Enter: 1, ' ': 1 }[e.key];
            if (!d) return;
            e.preventDefault();
            pause();
            step(d);
        });
        $$('.hx1-btn', hero).forEach((b) => b.addEventListener('click', () => { pause(); step(+b.dataset.step); }));

        // Drag / swipe: one face per gesture, in the direction of the drag (or flick); a plain click advances one state
        let g = null;
        wrap.addEventListener('pointerdown', (e) => {
            if (e.button) return;
            g = { x: e.clientX, y: e.clientY, r: 0, lx: e.clientX, lt: performance.now(), v: 0, dir: null, id: e.pointerId };
        });
        wrap.addEventListener('pointermove', (e) => {
            if (!g) return;
            const dx = e.clientX - g.x, dy = e.clientY - g.y;
            if (g.dir === null) {
                if (Math.hypot(dx, dy) < 6) return;
                g.dir = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
                if (g.dir === 'y') { g = null; return; } // vertical: leave it to the page scroll
                gsap.killTweensOf(cube, 'rotationY');
                pause();
                announce = true;
                wrap.classList.add('is-drag');
                try { wrap.setPointerCapture(g.id); } catch (err) { /* pointer already released */ }
                g.r = gsap.getProperty(cube, 'rotationY');
                g.x = e.clientX;
            }
            const now = performance.now();
            g.v = (e.clientX - g.lx) / Math.max(1, now - g.lt);
            g.lx = e.clientX;
            g.lt = now;
            if (!reduce) {
                gsap.set(cube, { rotationY: g.r + (e.clientX - g.x) * 0.4 });
                track();
            }
        });
        const end = (e, cancelled) => {
            if (!g) return;
            const gg = g;
            g = null;
            wrap.classList.remove('is-drag');
            if (gg.dir !== 'x') {
                if (!cancelled) { pause(); step(1); }
                return;
            }
            const push = (e.clientX - gg.x) + gg.v * 220;
            const base = Math.round(gg.r / 90);
            turnTo((base + (Math.abs(push) > 40 ? Math.sign(push) : 0)) * 90, 0.8);
        };
        wrap.addEventListener('pointerup', (e) => end(e, false));
        wrap.addEventListener('pointercancel', (e) => end(e, true));

        const startWins = () => wins[1].autoSelect(['h1', 'btn', 'img', 'cards', 'nav', 'p']);
        const mobile = innerWidth < 768;
        return {
            masksAt: 0.45,
            enter(tl) {
                tl.fromTo(wrap, { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 1.2, ease: 'expo.out' }, 0.05)
                    .fromTo(cube, { rotationY: -250 }, { rotationY: -90, duration: 1.8, ease: 'expo.out' }, 0.05)
                    .fromTo(ticket, mobile ? { autoAlpha: 0, y: 30 } : { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, y: 0, duration: 1, ease: 'expo.out' }, 0.6)
                    .add(() => { spinning = false; startWins(); startAuto(); }, 1.5);
            },
            exit(st) {
                // Explicit start values: the entrance fades these in, so a plain .to() would record them as
                // invisible at its first refresh and hide them again when scrolling back to the top
                gsap.fromTo(wrap, { y: 0, scale: 1, opacity: 1 }, { y: -110, scale: 0.92, opacity: 0.3, ease: 'none', immediateRender: false, scrollTrigger: st });
                gsap.fromTo(ticket, { y: 0, opacity: 1 }, { y: -70, opacity: 0, ease: 'none', immediateRender: false, scrollTrigger: { ...st, end: '50% top' } });
                gsap.to($('.hx1-title', hero), { y: -80, opacity: 0, ease: 'none', scrollTrigger: { ...st, end: '45% top' } });
            },
            still() {
                spinning = false;
                fill(1);
                wins[1].select('h1', true);
            },
        };
    };
})();
