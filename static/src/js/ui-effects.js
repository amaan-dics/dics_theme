(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (!document.getElementById('dics-cursor-hide-style')) {
    const style = document.createElement('style');
    style.id = 'dics-cursor-hide-style';
    style.textContent = 'html, body, a, button, input, select, textarea, label, [role="button"] { cursor: none !important; }';
    document.head.appendChild(style);
  }

  const EASE = 0.18;
  const BRAND_BLUE = '#0099E0';
  const DARK = '#0a0a0a';
  const DARKNESS_THRESHOLD = 130;

  function clamp01(n) { return Math.max(0, Math.min(1, n)); }

  function hexToRgba(hex) {
    let h = hex.replace('#', '');
    if (h.length === 3 || h.length === 4) {
      h = h.split('').map(c => c + c).join('');
    }
    if (h.length !== 6 && h.length !== 8) return null;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }

  function rgbaStringToObj(str) {
    const nums = str.match(/[\d.]+/g);
    if (!nums || nums.length < 3) return null;
    const [r, g, b, a] = nums.map(Number);
    return { r, g, b, a: a === undefined ? 1 : a };
  }

  // Reads an element's own backgroundColor as a {r,g,b,a} layer, or null if none.
  function getBackgroundColorLayer(cs) {
    const bg = cs.backgroundColor;
    if (!bg || bg === 'transparent') return null;
    const obj = rgbaStringToObj(bg);
    if (!obj || obj.a === 0) return null;
    return obj;
  }

  function getBackgroundImageLayer(cs) {
    const bgImg = cs.backgroundImage;
    if (!bgImg || bgImg === 'none') return null;
    const stopStrings = (bgImg.match(/rgba?\([^)]+\)/g) || [])
      .concat(bgImg.match(/#[0-9a-fA-F]{3,8}\b/g) || []);
    if (!stopStrings.length) return null;
    const stops = stopStrings
      .map(s => (s[0] === '#' ? hexToRgba(s) : rgbaStringToObj(s)))
      .filter(Boolean);
    if (!stops.length) return null;
    const sum = stops.reduce((acc, c) => ({
      r: acc.r + c.r, g: acc.g + c.g, b: acc.b + c.b, a: acc.a + c.a
    }), { r: 0, g: 0, b: 0, a: 0 });
    const n = stops.length;
    return { r: sum.r / n, g: sum.g / n, b: sum.b / n, a: clamp01(sum.a / n) };
  }

  // Composites `top` over `bottom` per standard alpha compositing.
  function compositeOver(top, bottom) {
    const a = top.a + bottom.a * (1 - top.a);
    if (a <= 0) return { r: 0, g: 0, b: 0, a: 0 };
    return {
      r: (top.r * top.a + bottom.r * bottom.a * (1 - top.a)) / a,
      g: (top.g * top.a + bottom.g * bottom.a * (1 - top.a)) / a,
      b: (top.b * top.a + bottom.b * bottom.a * (1 - top.a)) / a,
      a
    };
  }

  // Combines an element's backgroundColor and gradient (backgroundImage) into
  // one layer, gradient rendered on top of backgroundColor as the browser does.
  function getElementLayer(node) {
    const cs = getComputedStyle(node);
    const colorLayer = getBackgroundColorLayer(cs);
    const imageLayer = getBackgroundImageLayer(cs);
    if (imageLayer && colorLayer) return compositeOver(imageLayer, colorLayer);
    return imageLayer || colorLayer;
  }

  function luminance({ r, g, b }) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // Straight-line distance between two colors in RGB space - used to catch
  // "background happens to be brand blue" as a special case, since that
  // case can't be resolved by luminance alone (a solid blue background and
  // a blue cursor can land on the same side of the dark/light threshold and
  // then the cursor disappears into the background).
  const BRAND_BLUE_RGB = { r: 0, g: 153, b: 224 };
  const BRAND_BLUE_MATCH_DISTANCE = 70;

  function colorDistance(a, b) {
    return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
  }

  // Walks up from (x, y) and returns the composited {r,g,b,a} background
  // color actually visible at that point.
  function getBackgroundComposite(x, y) {
    let node = document.elementFromPoint(x, y);
    let composite = null;

    while (node && node !== document.documentElement) {
      const layer = getElementLayer(node);
      if (layer) {
        composite = composite ? compositeOver(composite, layer) : layer;
        if (composite.a >= 0.98) break; // fully opaque — no need to look further back
      }
      node = node.parentElement;
    }

    if (!composite || composite.a < 0.05) {
      const bodyLayer = getElementLayer(document.body);
      composite = bodyLayer || { r: 255, g: 255, b: 255, a: 1 };
    }

    return composite;
  }

  // Decides the actual cursor color for a point: brand blue on dark
  // backgrounds, dark on light ones - except when the background itself is
  // close to brand blue, where it always falls back to dark so the cursor
  // stays visible against it.
  function getCursorColor(x, y) {
    const composite = getBackgroundComposite(x, y);
    const dark = luminance(composite) < DARKNESS_THRESHOLD;
    const nearBrandBlue = colorDistance(composite, BRAND_BLUE_RGB) < BRAND_BLUE_MATCH_DISTANCE;
    const color = nearBrandBlue ? DARK : (dark ? BRAND_BLUE : DARK);
    return { color, dark };
  }

  function initCustomCursor() {
    // Remove any existing cursors
    document.querySelectorAll('#dics-cursor-ring, #dics-cursor-dot').forEach(el => el.remove());

    const ring = document.createElement('div');
    ring.id = 'dics-cursor-ring';
    const dot = document.createElement('div');
    dot.id = 'dics-cursor-dot';

    ring.style.zIndex = '999999';
    dot.style.zIndex = '999999';

    document.body.appendChild(ring);
    document.body.appendChild(dot);

    const s = { mx: -200, my: -200, rx: -200, ry: -200, visible: true, hovering: false, clicking: false };

    // Best starting position: last known pointer location from before the
    // page navigated (same tab), so the cursor picks up exactly where it
    // left off. Falls back to viewport center — either way `visible` is
    // already true above, so there's no gap where only the native/default
    // cursor shows.
    s.mx = s.rx = window.innerWidth / 2;
    s.my = s.ry = window.innerHeight / 2;
    try {
      const stored = sessionStorage.getItem('dics-cursor-pos');
      if (stored) {
        const pos = JSON.parse(stored);
        if (typeof pos.x === 'number' && typeof pos.y === 'number') {
          s.mx = s.rx = pos.x;
          s.my = s.ry = pos.y;
        }
      }
    } catch (e) { /* ignore malformed/unavailable storage */ }

    function tick() {
      s.rx += (s.mx - s.rx) * EASE;
      s.ry += (s.my - s.ry) * EASE;

      const { color, dark } = getCursorColor(s.mx, s.my);
      const half = s.hovering ? 24 : 16;

      ring.style.width = s.hovering ? '48px' : '32px';
      ring.style.height = s.hovering ? '48px' : '32px';
      ring.style.opacity = s.visible ? '1' : '0';
      ring.style.borderColor = color;
      ring.style.backgroundColor = dark ? 'rgba(0,153,224,0.12)' : 'rgba(10,10,10,0.08)';
      ring.style.transform = `translate3d(${s.rx - half}px, ${s.ry - half}px, 0)` + (s.clicking ? ' scale(0.72)' : '');

      dot.style.background = color;
      dot.style.transform = `translate3d(${s.mx - 4}px, ${s.my - 4}px, 0)`;

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);

    // Mouse events
    document.addEventListener('mousemove', (e) => {
      s.mx = e.clientX;
      s.my = e.clientY;
      s.visible = true;
      try {
        sessionStorage.setItem('dics-cursor-pos', JSON.stringify({ x: e.clientX, y: e.clientY }));
      } catch (e) { /* ignore storage errors (e.g. private mode) */ }
    }, { passive: true });

    document.addEventListener('mousedown', (e) => {
      s.clicking = true;
      const { color } = getCursorColor(e.clientX, e.clientY);
      const el = document.createElement('div');
      el.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:0;height:0;border-radius:50%;border:1.5px solid ${color};transform:translate(-50%,-50%);pointer-events:none;z-index:999999;transition:width .65s ease-out,height .65s ease-out,opacity .65s ease-out;`;
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        el.style.width = '90px';
        el.style.height = '90px';
        el.style.opacity = '0';
      });
      setTimeout(() => el.remove(), 700);
    });

    document.addEventListener('mouseup', () => { s.clicking = false; });

    document.addEventListener('mouseover', (e) => {
      s.hovering = !!e.target.closest('a,button,[role="button"],input,select,textarea,label,[data-cursor]');
    }, { passive: true });
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomCursor);
  } else {
    initCustomCursor();
  }
})();




// portal page
(function () {
    "use strict";

    function onReady(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    onReady(function () {
        var alertCategory = document.getElementById("portal_alert_category");
        var wrapper = document.querySelector(".wrapper.col-12.d-flex");

        if (!alertCategory || !wrapper || !wrapper.parentNode) {
            return;
        }

        alertCategory.classList.add("dics-portal-alert-banner");
        wrapper.parentNode.insertBefore(alertCategory, wrapper);
    });
})();

//magnetix button
document.addEventListener('DOMContentLoaded', function () {
  const magnets = Array.from(document.querySelectorAll('.dics-magnetic-button'));
  magnets.forEach((button) => {
    if (!button || !(button instanceof HTMLElement)) return;
    const strength = Number(button.dataset.magneticStrength || 0.35);
    const inner = button;

    const handleMove = (event) => {
      if (!(button instanceof HTMLElement)) return;
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = (event.clientX - centerX) * strength;
      const distanceY = (event.clientY - centerY) * strength;
      inner.style.transform = `translate3d(${distanceX}px, ${distanceY}px, 0)`;
    };

    const reset = () => {
      inner.style.transform = 'translate3d(0, 0, 0)';
    };

    button.addEventListener('mousemove', handleMove);
    button.addEventListener('mouseleave', reset);
  });
});

//title card
document.addEventListener('DOMContentLoaded', function () {
  const cards = document.querySelectorAll('.dics-tilt-card');

  cards.forEach(card => {
    const inner = card.querySelector('.dics-tilt-card__inner');
    if (!inner) return;

    const strength = Number(card.dataset.tiltStrength) || 12;

    const handleMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const rotateX = (y * strength).toFixed(2);
      const rotateY = (x * strength * -1).toFixed(2);

      inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
    };

    const reset = () => {
      inner.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    };

    card.addEventListener('mousemove', handleMove);
    card.addEventListener('mouseleave', reset);
  });
});

//scroll reveal
document.addEventListener('DOMContentLoaded', function () {
  const revealElements = Array.from(document.querySelectorAll('.reveal-on-scroll'));
  if (!revealElements.length) return;
  if (!('IntersectionObserver' in window)) {
    revealElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.classList.add('is-visible');
      }
    });
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target instanceof HTMLElement) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
  });
  revealElements.forEach((el) => {
    if (el instanceof HTMLElement) observer.observe(el);
  });
});

//counter
/** Animated stat counters — counts up once when scrolled into view. */
(function () {
    "use strict";

    function animateCounter(el) {
        var target = parseFloat(el.getAttribute("data-count-target"));
        var suffix = el.getAttribute("data-count-suffix") || "";
        if (isNaN(target)) return;

        var duration = 1800;
        var start = null;

        function tick(now) {
            if (start === null) start = now;
            var t = Math.min((now - start) / duration, 1);
            var eased = 1 - Math.pow(1 - t, 3);
            var value = Math.round(eased * target);
            el.textContent = value.toLocaleString() + suffix;
            if (t < 1) {
                window.requestAnimationFrame(tick);
            }
        }
        window.requestAnimationFrame(tick);
    }

    function init() {
        var counters = document.querySelectorAll(".dics-stat-num[data-count-target]");
        if (!counters.length) return;

        if (!("IntersectionObserver" in window)) {
            counters.forEach(animateCounter);
            return;
        }

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.4 }
        );

        counters.forEach(function (el) {
            observer.observe(el);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

/** @odoo-module **/
/**
 * dics_theme_website — Hero 3-D Carousel
 * Runs once on DOMContentLoaded, scoped to #dicsHeroCarousel.
 */

/** @odoo-module **/

(function () {
    "use strict";

    class DicsHeroCarousel {
        constructor(root) {
            this.root = root;
            this.track = root.querySelector("#dicsCarouselTrack");

            this.cards = Array.from(
                root.querySelectorAll(".dics-carousel-card")
            );

            this.prevButton = root.querySelector("#dicsCarouselPrev");
            this.nextButton = root.querySelector("#dicsCarouselNext");

            this.currentIndex = 0;
            this.isAnimating = false;
            this.autoplayTimer = null;

            if (!this.track || !this.cards.length) {
                return;
            }

            this.init();
        }

        init() {
            this.bindEvents();
            this.cards.forEach((card) => {
                card.style.transition = "none";
            });
            this.update();
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.cards.forEach((card) => {
                        card.style.transition = "";
                    });
                });
            });
            this.startAutoplay();
        }


        /* --------------------------------------------------------
         * EVENTS
         * -------------------------------------------------------- */

        bindEvents() {

            if (this.prevButton) {
                this.prevButton.addEventListener("click", (event) => {
                    event.preventDefault();

                    this.stopAutoplay();
                    this.previous();
                    this.restartAutoplay();
                });
            }

            if (this.nextButton) {
                this.nextButton.addEventListener("click", (event) => {
                    event.preventDefault();

                    this.stopAutoplay();
                    this.next();
                    this.restartAutoplay();
                });
            }


            /*
             * Pause autoplay while the mouse is over the carousel.
             */
            this.root.addEventListener("mouseenter", () => {
                this.stopAutoplay();
            });

            this.root.addEventListener("mouseleave", () => {
                this.restartAutoplay();
            });


            /*
             * Touch/swipe support.
             */
            let startX = 0;
            let startY = 0;

            this.root.addEventListener(
                "touchstart",
                (event) => {
                    const touch = event.changedTouches[0];

                    startX = touch.clientX;
                    startY = touch.clientY;

                    this.stopAutoplay();
                },
                { passive: true }
            );


            this.root.addEventListener(
                "touchend",
                (event) => {
                    const touch = event.changedTouches[0];

                    const deltaX = touch.clientX - startX;
                    const deltaY = touch.clientY - startY;

                    /*
                     * Ignore mostly vertical swipes.
                     */
                    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {

                        if (deltaX < 0) {
                            this.next();
                        } else {
                            this.previous();
                        }
                    }

                    this.restartAutoplay();
                },
                { passive: true }
            );


            /*
             * Keyboard navigation when the carousel has focus.
             */
            this.root.addEventListener("keydown", (event) => {

                if (event.key === "ArrowLeft") {
                    event.preventDefault();

                    this.stopAutoplay();
                    this.previous();
                    this.restartAutoplay();
                }

                if (event.key === "ArrowRight") {
                    event.preventDefault();

                    this.stopAutoplay();
                    this.next();
                    this.restartAutoplay();
                }
            });
        }


        /* --------------------------------------------------------
         * NEXT / PREVIOUS
         * -------------------------------------------------------- */

        next() {
            if (this.isAnimating) {
                return;
            }

            this.currentIndex =
                (this.currentIndex + 1) % this.cards.length;

            this.update();
        }


        previous() {
            if (this.isAnimating) {
                return;
            }

            this.currentIndex =
                (this.currentIndex - 1 + this.cards.length) %
                this.cards.length;

            this.update();
        }


        /* --------------------------------------------------------
         * UPDATE CAROUSEL
         * -------------------------------------------------------- */

        update() {

            this.isAnimating = true;

            const total = this.cards.length;

            this.cards.forEach((card, index) => {

                /*
                 * Calculate how far this card is from
                 * the active card.
                 */
                let offset = index - this.currentIndex;


                /*
                 * Wrap the distance around the carousel.
                 *
                 * Example with six cards:
                 *
                 * active = 0
                 * card 5 should be -1, not +5
                 */
                if (offset > total / 2) {
                    offset -= total;
                }

                if (offset < -total / 2) {
                    offset += total;
                }


                /*
                 * Remove old state classes.
                 */
                card.classList.remove(
                    "is-active",
                    "is-prev",
                    "is-next",
                    "is-far-prev",
                    "is-far-next"
                );


                /*
                 * ACTIVE
                 *
                 * This is the card that sits directly
                 * in front of the others.
                 */
                if (offset === 0) {

                    card.classList.add("is-active");

                    card.style.transform =
                        "translate3d(-50%, -50%, 90px) " +
                        "rotateY(0deg) " +
                        "scale(1)";

                    card.style.zIndex = "30";

                    return;
                }


                /*
                 * ONE CARD TO THE LEFT
                 */
                if (offset === -1) {

                    card.classList.add("is-prev");

                    card.style.transform =
                        "translate3d(calc(-50% - 150px), -50%, -70px) " +
                        "rotateY(7deg) " +
                        "scale(.86)";

                    card.style.zIndex = "20";

                    return;
                }


                /*
                 * ONE CARD TO THE RIGHT
                 */
                if (offset === 1) {

                    card.classList.add("is-next");

                    card.style.transform =
                        "translate3d(calc(-50% + 150px), -50%, -70px) " +
                        "rotateY(-7deg) " +
                        "scale(.86)";

                    card.style.zIndex = "20";

                    return;
                }


                /*
                 * TWO CARDS TO THE LEFT
                 */
                if (offset === -2) {

                    card.classList.add("is-far-prev");

                    card.style.transform =
                        "translate3d(calc(-50% - 270px), -50%, -220px) " +
                        "rotateY(12deg) " +
                        "scale(.74)";

                    card.style.zIndex = "10";

                    return;
                }


                /*
                 * TWO CARDS TO THE RIGHT
                 */
                if (offset === 2) {

                    card.classList.add("is-far-next");

                    card.style.transform =
                        "translate3d(calc(-50% + 270px), -50%, -220px) " +
                        "rotateY(-12deg) " +
                        "scale(.74)";

                    card.style.zIndex = "10";

                    return;
                }


                /*
                 * Everything else goes deep into the stack.
                 */
                card.style.transform =
                    "translate3d(-50%, -50%, -450px) " +
                    "scale(.55)";

                card.style.zIndex = "0";
            });


            /*
             * Unlock after the CSS transition.
             */
            window.setTimeout(() => {
                this.isAnimating = false;
            }, 720);
        }


        /* --------------------------------------------------------
         * AUTOPLAY
         * -------------------------------------------------------- */

        startAutoplay() {

            this.stopAutoplay();

            this.autoplayTimer = window.setInterval(() => {
                this.next();
            }, 5000);
        }


        stopAutoplay() {

            if (this.autoplayTimer) {
                window.clearInterval(this.autoplayTimer);
                this.autoplayTimer = null;
            }
        }


        restartAutoplay() {

            this.stopAutoplay();

            this.autoplayTimer = window.setTimeout(() => {
                this.startAutoplay();
            }, 2500);
        }
    }


    /* ============================================================
       ODOO WEBSITE INITIALIZATION
       ============================================================ */

    function initDicsCarousel() {

        const carousel =
            document.querySelector("#dicsHeroCarousel");

        if (!carousel) {
            return;
        }

        /*
         * Prevent duplicate initialization if Odoo
         * re-renders the website section.
         */
        if (carousel.dataset.dicsCarouselInitialized === "1") {
            return;
        }

        carousel.dataset.dicsCarouselInitialized = "1";

        new DicsHeroCarousel(carousel);
    }


    /*
     * Standard DOM initialization.
     */
    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initDicsCarousel
        );

    } else {

        initDicsCarousel();
    }


    /*
     * Odoo can dynamically update website DOM.
     * MutationObserver makes the carousel resilient to that.
     */
    const observer = new MutationObserver(() => {

        if (!document.querySelector(
            "#dicsHeroCarousel[data-dics-carousel-initialized='1']"
        )) {
            initDicsCarousel();
        }

    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();