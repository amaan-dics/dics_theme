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

    window.addEventListener("scroll", updateProgress, {passive: true});
    window.addEventListener("resize", updateProgress, {passive: true});
    updateProgress();

    // ── Header scrolled state ────────────────────────────────
    const header = document.querySelector(".dics-header");
    const onScrollHeader = () => {
        if (header) {
            header.classList.toggle("dics-header-scrolled", window.scrollY > 20);
        }
    };
    window.addEventListener("scroll", onScrollHeader, {passive: true});
    onScrollHeader();

    // ── Back to top ──────────────────────────────────────────
    const backTop = document.getElementById("backToTop")
        || document.querySelector(".dics-back-top");
    if (backTop) {
        window.addEventListener("scroll", () => {
            backTop.classList.toggle("show", window.scrollY > 600);
        }, {passive: true});
        backTop.addEventListener("click", () => {
            window.scrollTo({top: 0, behavior: "smooth"});
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

    // Main run function
    const run = () => {


        // ── Mobile dropdown ───────────────────────────────────
        const openBtn = document.getElementById("dicsMenuOpen");
        const menu = document.getElementById("dicsMobileMenu");

        if (openBtn && menu) {
            const mobileNav = menu.querySelector(".dics-mobile-nav");

            const openMenu = () => {
                menu.style.display = "block";
                menu.classList.add("is-open");
                menu.setAttribute("aria-hidden", "false");
                openBtn.setAttribute("aria-expanded", "true");
                openBtn.setAttribute("aria-label", "Close menu");
                openBtn.classList.add("is-open");
                document.body.style.overflow = "hidden";

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

                if (mobileNav) {
                    mobileNav.style.visibility = "hidden";
                }

                menu.style.display = "none";
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

            // ── Mobile accordions ─────────────────────────────────
            const mobileAccordions = menu.querySelectorAll(".dics-mobile-services");

            mobileAccordions.forEach((accordion) => {
                const toggle = accordion.querySelector(".dics-mobile-services-toggle");
                const dropdown = accordion.querySelector(".dics-mobile-services-dropdown");

                if (!toggle || !dropdown) return;

                toggle.addEventListener("click", () => {
                    const isOpen = dropdown.classList.contains("is-open");

                    if (isOpen) {
                        dropdown.style.height = dropdown.scrollHeight + "px";
                        dropdown.getBoundingClientRect();
                        dropdown.style.height = "0";
                        dropdown.classList.remove("is-open");
                        toggle.setAttribute("aria-expanded", "false");
                        dropdown.setAttribute("aria-hidden", "true");
                    } else {
                        dropdown.style.height = dropdown.scrollHeight + "px";
                        dropdown.classList.add("is-open");
                        toggle.setAttribute("aria-expanded", "true");
                        dropdown.setAttribute("aria-hidden", "false");

                        dropdown.addEventListener("transitionend", () => {
                            if (dropdown.classList.contains("is-open")) {
                                dropdown.style.height = "auto";
                            }
                        }, {once: true});
                    }
                });
            });
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
            window.addEventListener("scroll", update, {passive: true});
            update();
        }

        // ── Mega categories (desktop) ────────────────────────
        const mega = document.getElementById("dics-services-mega");
        if (mega) {
            const panel = mega.querySelector(".dics-mega-panel");
            const cats = mega.querySelectorAll(".dics-mega-cat");
            const groups = mega.querySelectorAll(".dics-mega-group");
            let t;

            const openMega = () => {
                clearTimeout(t);
                mega.classList.add("is-open");
            };
            const closeMega = () => {
                clearTimeout(t);
                t = setTimeout(() => mega.classList.remove("is-open"), 180);
            };
            const closeMegaImmediately = () => {
                clearTimeout(t);
                mega.classList.remove("is-open");
                // Kill pointer events so :hover drops instantly
                mega.style.pointerEvents = "none";
                setTimeout(() => {
                    mega.style.pointerEvents = "";
                }, 300); // matches your panel transition duration (180ms) + buffer
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
            // Close immediately when a mega-menu item is clicked
            mega.querySelectorAll(".dics-mega-item").forEach((item) => {
                item.addEventListener("click", () => {
                    closeMegaImmediately();
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
        const mega = document.getElementById('dics-services-mega');
        const trigger = mega?.querySelector('.dics-mega-trigger');
        const panel = document.getElementById('dics-services-panel');
        const inner = panel?.querySelector('.dics-mega-inner');

        if (!mega || !trigger || !inner) return;

        const updateArrowPosition = () => {
            const triggerRect = trigger.getBoundingClientRect();
            const innerRect = inner.getBoundingClientRect();

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
        window.addEventListener('scroll', updateArrowPosition, {passive: true});

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

    let scrollTimer;
    const scheduleScrollToHash = (delay = 0) => {
        if (!window.location.hash) return;
        window.clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(() => window.requestAnimationFrame(scrollToHash), delay);
    };

    // Cross-page links normally arrive before load, but Odoo may evaluate
    // frontend assets after load. Handle both states and bfcache restores.
    if (document.readyState === "complete") {
        scheduleScrollToHash(150);
    } else {
        window.addEventListener("load", () => scheduleScrollToHash(150), {once: true});
    }
    window.addEventListener("pageshow", () => scheduleScrollToHash(150));

    // Trigger when clicking anchor links on the same page.
    window.addEventListener("hashchange", () => scheduleScrollToHash());
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

            previousButton.addEventListener("click", (event) => {
                event.preventDefault();
                goToCard(currentIndex - 1);
            });

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
                {passive: true}
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
            {once: true}
        );
    } else {
        init();
    }

})();

