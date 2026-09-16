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
        "click .dics-faq-item":   "toggleFaq",
        "submit .dics-contact-form": "submitForm",
    },

    start() {
        // Reveal-on-scroll observer for .dics-reveal elements
        this._revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    this._revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        this.el.querySelectorAll(".dics-reveal").forEach((el) =>
            this._revealObserver.observe(el)
        );

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