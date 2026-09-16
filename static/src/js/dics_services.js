/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

/**
 * DicsServices — Services page scroll effects.
 * selector: ".dics-services-page" — only runs on /services.
 *
 * Panel animation logic ported from simpify's page-effects.js:
 *   p          = scroll progress through the panel container (0 → 1)
 *   width      = p in [0, 0.48]   → [48%, 100%]
 *   textOp     = width in [52,70] → [1, 0]      (text fades as panel expands)
 *   overlayOp  = width in [65,82] → [0, 1]      (overlay fades in)
 *   scale      = p in [0.65, 1]   → [1, 0.9]    (sticky shrinks at exit)
 *   sectionOp  = p in [0.68, 1]   → [1, 0]      (whole panel fades at exit)
 *   sectionY   = p in [0.68, 1]   → [0, -28px]  (panel floats up at exit)
 */
publicWidget.registry.DicsServices = publicWidget.Widget.extend({
    selector: ".dics-services-page",

    start() {
        // Reveal observer for hero + CTA
        this._revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    this._revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });

        this.el.querySelectorAll(".dics-reveal").forEach((el) =>
            this._revealObserver.observe(el)
        );

        // Skip scroll panels on mobile
        if (window.matchMedia("(max-width: 991px)").matches) {
            return this._super(...arguments);
        }

        // Build panel descriptor objects (same shape as simpify)
        this._panels = Array.from(
            this.el.querySelectorAll(".dics-svc-scroll")
        ).map((container) => ({
            container,
            sticky:   container.querySelector(".dics-svc-scroll__sticky"),
            image:    container.querySelector(".dics-svc-scroll__visual"),
            textWrap: container.querySelector(".dics-svc-scroll__text-wrap"),
            overlay:  container.querySelector(".dics-svc-scroll__overlay"),
        }));

        this._ticking = false;

        this._onScroll = () => {
            if (!this._ticking) {
                this._ticking = true;
                window.requestAnimationFrame(() => {
                    this._updatePanels();
                    this._ticking = false;
                });
            }
        };

        window.addEventListener("scroll", this._onScroll, { passive: true });
        window.addEventListener("resize", this._onScroll);
        this._updatePanels();

        return this._super(...arguments);
    },

    destroy() {
        window.removeEventListener("scroll", this._onScroll);
        window.removeEventListener("resize", this._onScroll);
        this._revealObserver?.disconnect();
        return this._super(...arguments);
    },

    _clamp(v, min, max) {
        return Math.min(Math.max(v, min), max);
    },

    // Map value from [inMin,inMax] → [outMin,outMax], clamped
    _mapRange(value, inMin, inMax, outMin, outMax) {
        if (inMax === inMin) return outMin;
        const t = this._clamp((value - inMin) / (inMax - inMin), 0, 1);
        return outMin + t * (outMax - outMin);
    },

    _updatePanels() {
        const vh = window.innerHeight;

        this._panels.forEach((panel) => {
            const rect = panel.container.getBoundingClientRect();

            // Skip panels far off-screen
            if (rect.bottom < -vh || rect.top > vh * 2) return;

            // p: 0 when panel top hits viewport top, 1 when fully scrolled
            const p = this._clamp(-rect.top / rect.height, 0, 1);

            // Derived values — exact same chain as simpify page-effects.js
            const width          = this._mapRange(p,     0,    0.48, 48,  100);
            const textOpacity    = this._mapRange(width, 52,   70,   1,   0);
            const overlayOpacity = this._mapRange(width, 65,   82,   0,   1);
            const scale          = this._mapRange(p,     0.65, 1,    1,   0.9);
            const sectionOpacity = this._mapRange(p,     0.68, 1,    1,   0);
            const sectionY       = this._mapRange(p,     0.68, 1,    0,   -28);

            if (panel.image) {
                panel.image.style.width = `${width}%`;
            }

            if (panel.overlay) {
                panel.overlay.style.opacity = String(overlayOpacity);
            }

            if (panel.textWrap) {
                panel.textWrap.style.opacity = String(textOpacity);
                // Slide text away in the correct direction (reverse row slides left)
                const isReverse = panel.container.querySelector(".is-reverse") !== null;
                const dir = isReverse ? -1 : 1;
                const xOffset = this._mapRange(width, 52, 70, 0, 55 * dir);
                panel.textWrap.style.transform = `translateX(${xOffset}px)`;
            }

            if (panel.sticky) {
                panel.sticky.style.transform =
                    `translateY(${sectionY}px) scale(${scale})`;
                panel.sticky.style.opacity = String(sectionOpacity);
            }
        });
    },
});