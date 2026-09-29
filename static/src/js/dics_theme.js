/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

/**
 * DicsTheme — Home page interactions.
 *
 * Scope: selector ".dics-home" — only runs on the home page.
 * Handles: capabilities accordion, FAQ toggle, contact form.
 *
 * Scroll progress, back-to-top, mobile drawer, and section
 * observer are all handled by DicsNav (dics_nav.js, selector "body")
 * which runs on every page. Do NOT duplicate those here.
 */
publicWidget.registry.DicsTheme = publicWidget.Widget.extend({
    selector: ".dics-home",
    events: {
        "click .dics-capability": "toggleCapability",
        "click .dics-faq-item": "toggleFaq",
        "submit .dics-contact-form": "submitForm",
    },

    start() {
        // ── Reveal observer ───────────────────────────────────────
        this._revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    this._revealObserver.unobserve(entry.target);
                }
            });
        }, {threshold: 0.1});
        this.el.querySelectorAll(".dics-reveal").forEach((el) =>
            this._revealObserver.observe(el)
        );

        // ── DOM refs ──────────────────────────────────────────────
        const searchInput = this.el.querySelector("#glossarySearchInput");
        const dropdown = this.el.querySelector("#glossaryDropdown");
        const dropdownList = this.el.querySelector("#glossaryDropdownList");
        const cards = this.el.querySelectorAll(
            "#glossary-list .dics-glossary-card[data-category]"
        );
        const filterBtns = this.el.querySelectorAll(".dics-glossary-filter-btn");
        let activeIndex = -1;

        // ── Build search index from cards ─────────────────────────
        // Each entry: { title, meta, sectionId, letterLabel, text }
        const buildIndex = () => {
            const index = [];
            cards.forEach((card) => {
                const titleEl = card.querySelector(".dics-capability-name h3");
                const metaEl = card.querySelector(".dics-capability-meta small");
                const group = card.closest(".dics-glossary-group");
                const sectionId = group ? group.id : null;
                const letterEl = group ? group.querySelector(".dics-glossary-letter-head h2, .h4") : null;
                if (!titleEl || !sectionId) return;
                index.push({
                    title: titleEl.textContent.trim(),
                    meta: metaEl ? metaEl.textContent.trim() : "",
                    text: card.textContent.toLowerCase(),
                    sectionId,
                    letter: letterEl ? letterEl.textContent.trim() : sectionId.replace("letter-", ""),
                    card,
                });
            });
            return index;
        };
        const searchIndex = buildIndex();

        // ── Highlight matching substring ──────────────────────────
        const highlight = (text, query) => {
            if (!query) return text;
            const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            return text.replace(new RegExp(`(${escaped})`, "gi"),
                (m) => `<mark>${m}</mark>`);
        };

        // ── Render dropdown ───────────────────────────────────────
        const renderDropdown = (query) => {
            const q = query.toLowerCase().trim();
            dropdownList.innerHTML = "";
            activeIndex = -1;

            if (!q) {
                dropdown.classList.remove("is-open");
                return;
            }

            const matches = searchIndex.filter((entry) => entry.text.includes(q));

            if (matches.length === 0) {
                dropdownList.innerHTML = `
                <li class="dics-glossary-dropdown__empty">
                    <strong>No results for "${query}"</strong>
                    Try a broader term or browse by letter above.
                </li>`;
                dropdown.classList.add("is-open");
                return;
            }

            matches.slice(0, 8).forEach((entry, i) => {
                const li = document.createElement("li");
                li.className = "dics-glossary-dropdown__item";
                li.dataset.index = i;
                li.innerHTML = `
                <a href="#${entry.sectionId}">
                    <span class="dics-glossary-dropdown__item-icon">${entry.letter}</span>
                    <span class="dics-glossary-dropdown__item-body">
                        <span class="dics-glossary-dropdown__item-title">
                            ${highlight(entry.title, query)}
                        </span>
                        <span class="dics-glossary-dropdown__item-meta">${entry.meta}</span>
                    </span>
                    <span class="dics-glossary-dropdown__item-arrow">↵</span>
                </a>`;
                // Smooth scroll on click, close dropdown
                li.querySelector("a").addEventListener("click", (e) => {
                    e.preventDefault();
                    const target = document.getElementById(entry.sectionId);
                    if (target) {
                        target.scrollIntoView({behavior: "smooth", block: "start"});
                    }
                    dropdown.classList.remove("is-open");
                    searchInput.value = "";
                });
                dropdownList.appendChild(li);
            });

            dropdown.classList.add("is-open");
        };

        // ── Keyboard navigation inside dropdown ───────────────────
        const getItems = () => [...dropdownList.querySelectorAll(".dics-glossary-dropdown__item")];

        const setActive = (idx) => {
            getItems().forEach((item, i) => {
                item.querySelector("a").classList.toggle("bg-surface-low", i === idx);
            });
            activeIndex = idx;
        };

        // ── Filter cards (existing behaviour, kept intact) ────────
        const applyFilters = () => {
            const q = searchInput ? searchInput.value.toLowerCase().trim() : "";
            const activeFilter = this.el.querySelector(".dics-glossary-filter-btn.is-active");
            const filter = activeFilter ? activeFilter.dataset.filter : "all";

            cards.forEach((card) => {
                const text = card.textContent.toLowerCase();
                const categories = card.dataset.category || "";
                const matchesSearch = !q || text.includes(q);
                const matchesCategory = filter === "all" || categories.includes(filter);
                const wrapper = card.closest(".col-12");
                if (wrapper) {
                    wrapper.classList.toggle("d-none", !(matchesSearch && matchesCategory));
                }
            });
        };

        // ── Events ────────────────────────────────────────────────
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                renderDropdown(e.target.value);
                applyFilters();
            });

            searchInput.addEventListener("keydown", (e) => {
                const items = getItems();
                if (!items.length) return;

                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive(Math.min(activeIndex + 1, items.length - 1));
                } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive(Math.max(activeIndex - 1, 0));
                } else if (e.key === "Enter" && activeIndex >= 0) {
                    e.preventDefault();
                    items[activeIndex].querySelector("a").click();
                } else if (e.key === "Escape") {
                    dropdown.classList.remove("is-open");
                    searchInput.blur();
                }
            });

            // Close dropdown on outside click
            document.addEventListener("click", (e) => {
                if (!searchInput.closest(".dics-glossary-search-wrap").contains(e.target)) {
                    dropdown.classList.remove("is-open");
                }
            });

            // Ctrl+K / Cmd+K
            window.addEventListener("keydown", (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                    e.preventDefault();
                    searchInput.focus();
                    searchInput.select();
                }
            });
        }

        // ── Filter buttons ────────────────────────────────────────
        filterBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                filterBtns.forEach((b) => b.classList.remove("is-active"));
                btn.classList.add("is-active");
                applyFilters();
            });
        });
        // =====================================================
// HERO CAPABILITY CARD CAROUSEL
// =====================================================
const heroVisual = this.el.querySelector(".dics-hero-visual");

if (heroVisual) {
    const card = heroVisual.querySelector(".dics-hero-cap-card");
    const prevBtn = heroVisual.querySelector(
        ".dics-hero-visual__arrow:not(.dics-hero-visual__arrow--active)"
    );
    const nextBtn = heroVisual.querySelector(
        ".dics-hero-visual__arrow--active"
    );
    const countEl = heroVisual.querySelector(".dics-hero-badge__count");

    if (card && prevBtn && nextBtn) {
        const slides = [
    {
        icon: "account_tree",
        tag: "ODOO CORE",
        latency: "ERP / AUTOMATION",
        title: "Odoo ERP",
        desc: "Connect sales, finance, inventory, purchasing, projects, and operations in one business system built around the way your teams actually work.",
        metric1Label: "PLATFORM",
        metric1Value: "ODOO 17 / 18",
        metric1Class: "dics-hero-cap-card__metric-value--red",
        metric2Label: "DELIVERY",
        metric2Value: "CUSTOMIZED",
        metric2Class: "dics-hero-cap-card__metric-value--green",
        href: "/services/odoo-erp",
        stack: "PYTHON / QWEB"
    },
    {
        icon: "bolt",
        tag: "INTELLIGENT SYSTEMS",
        latency: "AI / AUTOMATION",
        title: "AI & Automation",
        desc: "Automate repetitive work, connect business data, and build intelligent workflows that reduce manual effort and make everyday operations more efficient.",
        metric1Label: "WORKFLOW",
        metric1Value: "AUTOMATED",
        metric1Class: "dics-hero-cap-card__metric-value--red",
        metric2Label: "INTEGRATION",
        metric2Value: "CONNECTED",
        metric2Class: "dics-hero-cap-card__metric-value--green",
        href: "/services/ai-solutions",
        stack: "AI / API"
    },
    {
        icon: "devices",
        tag: "DIGITAL PRODUCTS",
        latency: "WEB / MOBILE",
        title: "Web & Mobile",
        desc: "Build responsive websites and mobile applications designed around your customers, teams, and the workflows that keep your business moving.",
        metric1Label: "EXPERIENCE",
        metric1Value: "RESPONSIVE",
        metric1Class: "dics-hero-cap-card__metric-value--red",
        metric2Label: "PLATFORM",
        metric2Value: "WEB + MOBILE",
        metric2Class: "dics-hero-cap-card__metric-value--green",
        href: "/services/web-mobile",
        stack: "WEB / APP"
    },
    {
        icon: "code",
        tag: "SOFTWARE ENGINEERING",
        latency: "PYTHON / SQL",
        title: "Custom Software",
        desc: "Build purpose-made software, business tools, and applications when off-the-shelf solutions cannot properly support your processes or requirements.",
        metric1Label: "DEVELOPMENT",
        metric1Value: "CUSTOM",
        metric1Class: "dics-hero-cap-card__metric-value--red",
        metric2Label: "ARCHITECTURE",
        metric2Value: "SCALABLE",
        metric2Class: "dics-hero-cap-card__metric-value--green",
        href: "/services/custom-software",
        stack: "PYTHON / POSTGRES"
    },
    {
        icon: "cloud",
        tag: "SOFTWARE PRODUCTS",
        latency: "SAAS / CLOUD",
        title: "SaaS Solutions",
        desc: "Turn ideas and internal tools into scalable software products with reliable infrastructure, connected systems, and business-ready workflows.",
        metric1Label: "MODEL",
        metric1Value: "SAAS",
        metric1Class: "dics-hero-cap-card__metric-value--red",
        metric2Label: "ARCHITECTURE",
        metric2Value: "SCALABLE",
        metric2Class: "dics-hero-cap-card__metric-value--green",
        href: "/services/saas",
        stack: "SAAS / CLOUD"
    },
    {
        icon: "campaign",
        tag: "GROWTH SYSTEMS",
        latency: "MARKETING / DATA",
        title: "Digital Marketing",
        desc: "Build a stronger digital presence with marketing systems, campaigns, content, and customer acquisition workflows connected to measurable business goals.",
        metric1Label: "FOCUS",
        metric1Value: "GROWTH",
        metric1Class: "dics-hero-cap-card__metric-value--red",
        metric2Label: "APPROACH",
        metric2Value: "DATA-DRIVEN",
        metric2Class: "dics-hero-cap-card__metric-value--green",
        href: "/services/digital-marketing",
        stack: "SEO / GROWTH"
    }
];

        let currentIndex = 0;
        let autoPlay;

        const renderSlide = (index, direction = 1) => {
            currentIndex = (index + slides.length) % slides.length;
            const slide = slides[currentIndex];

            card.style.opacity = "0";
            card.style.transform =
                `translateX(${direction > 0 ? "18px" : "-18px"})`;

            setTimeout(() => {
                card.querySelector(
                    ".dics-hero-cap-card__icon span"
                ).textContent = slide.icon;

                const tag = card.querySelector(".dics-hero-cap-card__tag");
                tag.innerHTML = `
                    <span class="dics-hero-cap-card__tag-dot"></span>
                    ${slide.tag}
                    <span class="dics-hero-cap-card__tag-latency">
                        ${slide.latency}
                    </span>
                `;

                card.querySelector(
                    ".dics-hero-cap-card__title"
                ).textContent = slide.title;

                card.querySelector(
                    ".dics-hero-cap-card__desc"
                ).textContent = slide.desc;

                const metrics = card.querySelectorAll(
                    ".dics-hero-cap-card__metric"
                );

                metrics[0].querySelector(
                    ".dics-hero-cap-card__metric-label"
                ).textContent = slide.metric1Label;

                metrics[0].querySelector(
                    ".dics-hero-cap-card__metric-value"
                ).className =
                    `dics-hero-cap-card__metric-value ${slide.metric1Class}`;

                metrics[0].querySelector(
                    ".dics-hero-cap-card__metric-value"
                ).textContent = slide.metric1Value;

                metrics[1].querySelector(
                    ".dics-hero-cap-card__metric-label"
                ).textContent = slide.metric2Label;

                metrics[1].querySelector(
                    ".dics-hero-cap-card__metric-value"
                ).className =
                    `dics-hero-cap-card__metric-value ${slide.metric2Class}`;

                metrics[1].querySelector(
                    ".dics-hero-cap-card__metric-value"
                ).textContent = slide.metric2Value;

                card.querySelector(
                    ".dics-hero-cap-card__link"
                ).href = slide.href;

                card.querySelector(
                    ".dics-hero-cap-card__stack"
                ).textContent = slide.stack;

                if (countEl) {
                    countEl.textContent = String(currentIndex + 1).padStart(2, "0");
                }

                card.style.opacity = "1";
                card.style.transform = "translateX(0)";
            }, 180);
        };

        const nextSlide = () => renderSlide(currentIndex + 1, 1);
        const prevSlide = () => renderSlide(currentIndex - 1, -1);

        nextBtn.addEventListener("click", () => {
            nextSlide();
            restartAutoPlay();
        });

        prevBtn.addEventListener("click", () => {
            prevSlide();
            restartAutoPlay();
        });

        const startAutoPlay = () => {
            autoPlay = setInterval(nextSlide, 5000);
        };

        const restartAutoPlay = () => {
            clearInterval(autoPlay);
            startAutoPlay();
        };

        card.style.transition =
            "opacity 0.18s ease, transform 0.18s ease";

        startAutoPlay();

        heroVisual.addEventListener("mouseenter", () => {
            clearInterval(autoPlay);
        });

        heroVisual.addEventListener("mouseleave", () => {
            startAutoPlay();
        });
    }
}
        return this._super(...arguments);
    },

    destroy() {
        this._revealObserver?.disconnect();
        return this._super(...arguments);
    },

    toggleCapability(event) {
        const row = event.currentTarget;
        const content = row.querySelector(".dics-capability-content");
        if (!content) return;

        const isCollapsed = content.classList.contains("is-collapsed");

        // Collapse every other open capability
        this.el.querySelectorAll(".dics-capability").forEach((other) => {
            if (other === row) return;
            other.classList.remove("is-open");
            other.querySelector(".dics-capability-content")
                ?.classList.add("is-collapsed");
        });

        // Toggle the clicked one
        content.classList.toggle("is-collapsed", !isCollapsed);
        row.classList.toggle("is-open", isCollapsed);
    },

    toggleFaq(event) {
        event.currentTarget.classList.toggle("is-open");
    },

    submitForm(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const status = form.querySelector(".dics-form-status");
        if (status) {
            status.textContent =
                "Thank you. Our engineering team will review your inquiry and contact you shortly.";
            status.hidden = false;
        }
        form.reset();
    },
});



