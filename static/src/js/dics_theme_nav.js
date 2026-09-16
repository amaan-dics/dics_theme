/** @odoo-module **/

document.addEventListener("DOMContentLoaded", () => {
    // ── Progress bar ─────────────────────────────────────────
    const progress = document.getElementById("scrollProgress");

    const updateProgress = () => {
        if (!progress) return;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
        progress.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    updateProgress();

    // ── Header scrolled state ────────────────────────────────
    const header = document.querySelector(".dics-header");
    const onScrollHeader = () => {
        if (header) {
            header.classList.toggle("dics-header-scrolled", window.scrollY > 20);
        }
    };
    window.addEventListener("scroll", onScrollHeader, { passive: true });
    onScrollHeader();

    // ── Back to top ──────────────────────────────────────────
    const backTop = document.getElementById("backToTop")
        || document.querySelector(".dics-back-top");
    if (backTop) {
        window.addEventListener("scroll", () => {
            backTop.classList.toggle("show", window.scrollY > 600);
        }, { passive: true });
        backTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
});




/** @odoo-module **/

document.addEventListener("DOMContentLoaded", () => {
    const mega = document.querySelector("#dics-services-mega");

    if (!mega) {
        return;
    }

    const categories = mega.querySelectorAll(".dics-mega-cat");
    const groups = mega.querySelectorAll(".dics-mega-group");

    categories.forEach((category) => {
        const cat = category.dataset.cat;

        category.addEventListener("mouseenter", () => {
            activateCategory(cat);
        });

        category.addEventListener("focus", () => {
            activateCategory(cat);
        });

        category.addEventListener("click", (event) => {
            event.preventDefault();
            activateCategory(cat);
        });
    });

    function activateCategory(cat) {
        categories.forEach((item) => {
            item.classList.toggle(
                "is-active",
                item.dataset.cat === cat
            );
        });

        groups.forEach((group) => {
            group.classList.toggle(
                "is-active",
                group.dataset.cat === cat
            );
        });
    }
});

/** @odoo-module **/

(function initDicsNav() {

    // ─────────────────────────────────────────────────────────
    // Styles — hamburger + top dropdown + accordion
    // ─────────────────────────────────────────────────────────
    function injectMobileStyles() {
        if (document.getElementById("dics-mobile-styles")) return;
        const style = document.createElement("style");
        style.id = "dics-mobile-styles";
        style.textContent = `

/* ── Hamburger button ─────────────────────────────────────── */
.dics-hamburger {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
    width: 40px;
    height: 40px;
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.2s ease;
    flex-shrink: 0;
    color: inherit;
}
.dics-hamburger:hover {
    background: rgba(255,255,255,0.07);
}
.dics-hamburger__bar {
    display: block;
    width: 22px;
    height: 2px;
    border-radius: 2px;
    background: currentColor;
    transform-origin: center;
    transition:
        transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        opacity   0.2s ease,
        width     0.3s ease;
}
/* Animate to X when open */
.dics-hamburger.is-open .dics-hamburger__bar:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
}
.dics-hamburger.is-open .dics-hamburger__bar:nth-child(2) {
    opacity: 0;
    width: 0;
}
.dics-hamburger.is-open .dics-hamburger__bar:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
}

/* ── Mobile dropdown — drops from under the header ─────────── */
.dics-mobile-dropdown {
    /* Sits inside <header>, below the inner bar */
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 999;
    overflow: hidden;
    /* Clip height for the reveal animation */
    max-height: 0;
    transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    /* Match header background */
    background: #ffff;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    
}
.dics-mobile-dropdown.is-open {
    max-height: 100svh; /* large enough to show all content */
}
.dics-mobile-dropdown__inner {
    padding: 8px 0 16px;
    /* Allow scrolling if content is taller than viewport */
    max-height: calc(100svh - 70px);
    overflow-y: auto;
}

/* ── Nav links ────────────────────────────────────────────── */
.dics-mobile-nav {
    display: flex;
    flex-direction: column;
}
.dics-mobile-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 13px 24px;
    font-size: 15px;
    font-weight: 500;
    color: #000000cc;
    text-decoration: none;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    font-family: inherit;
    letter-spacing: -0.01em;
    transition: color 0.15s ease, background 0.15s ease;
}
.dics-mobile-link:hover,
.dics-mobile-link.is-active {
    color: #bb0112;
    background: #dee2e6;
    text-decoration: none !important;
}
.dics-mobile-link:focus,
.dics-mobile-link.is-active {
    color: #bb0112;
    background: #dee2e6;
    text-decoration: none !important;
}

/* ── Services accordion ───────────────────────────────────── */
.dics-mobile-services {
    display: flex;
    flex-direction: column;
}
.dics-mobile-services-toggle {
    justify-content: space-between;
}
.dics-mobile-services-chevron {
    font-size: 18px;
    flex-shrink: 0;
    opacity: 0.45;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
}
.dics-mobile-services-toggle[aria-expanded="true"] .dics-mobile-services-chevron {
    transform: rotate(180deg);
    opacity: 0.75;
}
.dics-mobile-services-dropdown {
    list-style: none;
    margin: 0;
    padding: 0;
    height: 0;
    overflow: hidden;
    transition: height 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(255,255,255,0.03);
    border-top: 1px solid transparent;
}
.dics-mobile-services-dropdown.is-open {
    border-top-color: rgba(255,255,255,0.05);
}
.dics-mobile-services-dropdown li { margin: 0; padding: 0; }
.dics-mobile-services-item {
    padding: 11px 24px 11px 44px !important;
    font-size: 13.5px !important;
    font-weight: 400 !important;
    color: #080808e6 !important;
    gap: 10px !important;
    border-left: 2px solid transparent;
    transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease !important;
}
.dics-mobile-services-item .material-symbols-outlined {
    font-size: 15px;
    flex-shrink: 0;
    opacity: 0.5;
    font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20;
}
.dics-mobile-services-item:hover {
    color: #bb0112 !important;
    background: rgba(255,255,255,0.04) !important;
    border-left-color: #bb0112 !important;
}
.dics-mobile-services-item:hover .material-symbols-outlined {
    opacity: 0.9;
}

/* ── CTA row ──────────────────────────────────────────────── */
.dics-mobile-cta-row {
    padding: 12px 24px 4px;
    margin-top: 4px;
    border-top: 1px solid rgba(255,255,255,0.07);
}
.dics-mobile-cta-btn {
    display: flex !important;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px 20px !important;
    font-size: 14px;
    font-weight: 600;
}
.dics-mobile-cta-btn .material-symbols-outlined {
    font-size: 17px;
    transition: transform 0.2s ease;
}
.dics-mobile-cta-btn:hover .material-symbols-outlined {
    transform: translateX(3px);
}
        `;
        document.head.appendChild(style);
    }

    // ─────────────────────────────────────────────────────────
    // Main run function
    // ─────────────────────────────────────────────────────────
    const run = () => {
        injectMobileStyles();

        // ── Mobile dropdown ───────────────────────────────────
const openBtn = document.getElementById("dicsMenuOpen");
const menu    = document.getElementById("dicsMobileMenu");

if (openBtn && menu) {
    const mobileNav = menu.querySelector(".dics-mobile-nav");

    const openMenu = () => {
        menu.classList.add("is-open");
        menu.setAttribute("aria-hidden", "false");
        openBtn.setAttribute("aria-expanded", "true");
        openBtn.setAttribute("aria-label", "Close menu");
        openBtn.classList.add("is-open");
        document.body.style.overflow = "hidden";

        // Make the nav visible when menu opens
        if (mobileNav) {
            mobileNav.style.visibility = "visible";
        }
    };

    const closeMenu = () => {
        menu.classList.remove("is-open");
        menu.setAttribute("aria-hidden", "true");
        openBtn.setAttribute("aria-expanded", "false");
        openBtn.setAttribute("aria-label", "Open menu");
        openBtn.classList.remove("is-open");
        document.body.style.overflow = "";

        // Hide the nav again when menu closes
        if (mobileNav) {
            mobileNav.style.visibility = "hidden";
        }
    };

    openBtn.addEventListener("click", () => {
        menu.classList.contains("is-open") ? closeMenu() : openMenu();
    });

    // Close on outside click (anywhere outside the header)
    document.addEventListener("click", (e) => {
        if (!menu.classList.contains("is-open")) return;
        const header = document.getElementById("dics_top");
        if (header && !header.contains(e.target)) closeMenu();
    });

    // Close on nav links (but not accordion toggle)
    menu.querySelectorAll(".dics-mobile-link:not(.dics-mobile-services-toggle)").forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMenu();
    });

    // ── Services accordion ───────────────────────────
    const servicesToggle   = menu.querySelector(".dics-mobile-services-toggle");
    const servicesDropdown = menu.querySelector(".dics-mobile-services-dropdown");

    if (servicesToggle && servicesDropdown) {
        servicesToggle.addEventListener("click", () => {
            const isOpen = servicesDropdown.classList.contains("is-open");
            if (isOpen) {
                servicesDropdown.style.height = servicesDropdown.scrollHeight + "px";
                servicesDropdown.getBoundingClientRect();
                servicesDropdown.style.height = "0";
                servicesDropdown.classList.remove("is-open");
                servicesToggle.setAttribute("aria-expanded", "false");
                servicesDropdown.setAttribute("aria-hidden", "true");
            } else {
                servicesDropdown.style.height = servicesDropdown.scrollHeight + "px";
                servicesDropdown.classList.add("is-open");
                servicesToggle.setAttribute("aria-expanded", "true");
                servicesDropdown.setAttribute("aria-hidden", "false");
                servicesDropdown.addEventListener("transitionend", () => {
                    if (servicesDropdown.classList.contains("is-open")) {
                        servicesDropdown.style.height = "auto";
                    }
                }, { once: true });
            }
        });
    }
}

        // ── Progress bar ─────────────────────────────────────
        const progress = document.getElementById("scrollProgress");
        if (progress) {
            const update = () => {
                const max = document.documentElement.scrollHeight - window.innerHeight;
                progress.style.width = max > 0
                    ? `${Math.min(100, (window.scrollY / max) * 100)}%`
                    : "0%";
            };
            window.addEventListener("scroll", update, { passive: true });
            update();
        }

        // ── Mega categories (desktop) ────────────────────────
        const mega = document.getElementById("dics-services-mega");
        if (mega) {
            const panel  = mega.querySelector(".dics-mega-panel");
            const cats   = mega.querySelectorAll(".dics-mega-cat");
            const groups = mega.querySelectorAll(".dics-mega-group");
            let t;

            const openMega  = () => { clearTimeout(t); mega.classList.add("is-open"); };
            const closeMega = () => {
                clearTimeout(t);
                t = setTimeout(() => mega.classList.remove("is-open"), 180);
            };

            mega.addEventListener("mouseenter", openMega);
            mega.addEventListener("mouseleave", closeMega);
            panel?.addEventListener("mouseenter", openMega);
            panel?.addEventListener("mouseleave", closeMega);

            cats.forEach((btn) => {
                btn.addEventListener("click", (e) => {
                    e.preventDefault();
                    const id = btn.getAttribute("data-cat");
                    cats.forEach((c) => c.classList.toggle("is-active", c === btn));
                    groups.forEach((g) => g.classList.toggle("is-active", g.getAttribute("data-cat") === id));
                });
            });
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run);
    } else {
        run();
    }
})();




/** @odoo-module **/
(function initDicsMegaArrow() {
    const run = () => {
        const mega    = document.getElementById('dics-services-mega');
        const trigger = mega?.querySelector('.dics-mega-trigger');
        const panel   = document.getElementById('dics-services-panel');
        const inner   = panel?.querySelector('.dics-mega-inner');

        if (!mega || !trigger || !inner) return;

        const updateArrowPosition = () => {
            const triggerRect = trigger.getBoundingClientRect();
            const innerRect   = inner.getBoundingClientRect();

            // exact center of "Services" relative to the white card
            const arrowLeft = triggerRect.left + (triggerRect.width / 2) - innerRect.left;
            inner.style.setProperty('--mega-arrow-left', `${Math.round(arrowLeft)}px`);
        };

        // Update when the menu opens
        mega.addEventListener('mouseenter', () => {
            setTimeout(updateArrowPosition, 20); // wait for panel animation
        });
        mega.addEventListener('focusin', () => {
            setTimeout(updateArrowPosition, 20);
        });

        // Keep it correct on resize / scroll (sticky header)
        window.addEventListener('resize', updateArrowPosition);
        window.addEventListener('scroll', updateArrowPosition, { passive: true });

        // Initial position
        updateArrowPosition();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
/** @odoo-module **/

(function initHashScroll() {
    const scrollToHash = () => {
        const hash = window.location.hash;
        if (!hash) return;

        // Select target element safely
        let target;
        try {
            target = document.querySelector(hash);
        } catch (e) {
            target = document.getElementById(hash.replace("#", ""));
        }

        if (target) {
            // Calculate fixed header offset
            const header = document.querySelector(".dics-header") || document.getElementById("dics_top");
            const headerOffset = header ? header.offsetHeight : 80;
            const elementPosition = target.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = Math.max(0, elementPosition - headerOffset - 20);

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    // Trigger on page load (with a slight delay for dynamic layout height calculations)
    window.addEventListener("load", () => {
        if (window.location.hash) {
            setTimeout(scrollToHash, 150);
        }
    });

    // Trigger when clicking anchor links on the same page
    window.addEventListener("hashchange", scrollToHash);
})();



(function initDicsPipelineCarousel() {

    const init = () => {
        const pipelines = document.querySelectorAll(".dics-pipeline");

        if (!pipelines.length) {
            return;
        }

        pipelines.forEach((pipeline) => {

            // Prevent duplicate initialization
            if (pipeline.dataset.carouselInitialized === "true") {
                return;
            }

            const cards = Array.from(
                pipeline.querySelectorAll(".dics-pipeline-card")
            );

            const nav = pipeline.parentElement.querySelector(
                ".dics-pipeline-nav"
            );

            if (!cards.length || !nav) {
                return;
            }

            const previousButton = nav.querySelector(
                ".dics-pipeline-nav__btn--prev"
            );

            const nextButton = nav.querySelector(
                ".dics-pipeline-nav__btn--next"
            );

            const currentNumber = nav.querySelector(
                ".dics-pipeline-nav__current"
            );

            if (!previousButton || !nextButton || !currentNumber) {
                return;
            }

            pipeline.dataset.carouselInitialized = "true";

            let currentIndex = 0;
            let scrollTimer = null;

            /*
             * Check whether the carousel is actually in mobile mode.
             * Desktop remains a normal 6-column grid.
             */
            const isMobile = () => {
                return window.matchMedia("(max-width: 767px)").matches;
            };

            /*
             * Update buttons + counter
             */
            const updateNavigation = () => {

                currentNumber.textContent = String(
                    currentIndex + 1
                ).padStart(2, "0");

                previousButton.disabled = currentIndex <= 0;
                nextButton.disabled =
                    currentIndex >= cards.length - 1;

            };

            /*
             * Move directly using scrollLeft.
             * This avoids scrollIntoView() affecting the page.
             */
            const goToCard = (index, smooth = true) => {

                if (!isMobile()) {
                    return;
                }

                currentIndex = Math.max(
                    0,
                    Math.min(index, cards.length - 1)
                );

                const card = cards[currentIndex];

                const left =
                    card.offsetLeft -
                    (pipeline.clientWidth - card.offsetWidth) / 2;

                pipeline.scrollTo({
                    left: Math.max(0, left),
                    behavior: smooth ? "smooth" : "auto"
                });

                updateNavigation();
            };

            /*
             * Previous
             */
            previousButton.addEventListener("click", (event) => {
                event.preventDefault();
                goToCard(currentIndex - 1);
            });

            /*
             * Next
             */
            nextButton.addEventListener("click", (event) => {
                event.preventDefault();
                goToCard(currentIndex + 1);
            });

            /*
             * Detect manual swipe / horizontal scroll
             */
            pipeline.addEventListener(
                "scroll",
                () => {

                    if (!isMobile()) {
                        return;
                    }

                    window.clearTimeout(scrollTimer);

                    scrollTimer = window.setTimeout(() => {

                        const pipelineCenter =
                            pipeline.scrollLeft +
                            pipeline.clientWidth / 2;

                        let closestIndex = 0;
                        let closestDistance = Infinity;

                        cards.forEach((card, index) => {

                            const cardCenter =
                                card.offsetLeft +
                                card.offsetWidth / 2;

                            const distance = Math.abs(
                                cardCenter - pipelineCenter
                            );

                            if (distance < closestDistance) {
                                closestDistance = distance;
                                closestIndex = index;
                            }

                        });

                        currentIndex = closestIndex;

                        updateNavigation();

                    }, 80);
                },
                { passive: true }
            );

            /*
             * On resize:
             * - Mobile: keep current card centered
             * - Desktop: reset scroll position
             */
            window.addEventListener("resize", () => {

                if (isMobile()) {

                    requestAnimationFrame(() => {
                        goToCard(currentIndex, false);
                    });

                } else {

                    pipeline.scrollLeft = 0;
                    currentIndex = 0;
                    updateNavigation();

                }

            });

            /*
             * Initial state
             */
            updateNavigation();

            if (isMobile()) {
                requestAnimationFrame(() => {
                    goToCard(0, false);
                });
            }

        });
    };


    /*
     * Odoo can load/replace DOM content dynamically,
     * so support both cases.
     */
    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );
    } else {
        init();
    }

})();

