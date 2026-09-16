(function () {
    "use strict";

    var CLOSE_DELAY = 180; // ms, matches the React delayClose() timeout

    function onReady(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    onReady(function () {
        var header = document.querySelector(".dics-header");
        if (!header) {
            return;
        }



        /* ---------------------------------------------------------------
         * 2. Desktop mega menu: open on hover, close on delayed hover-out
         * ------------------------------------------------------------- */
        var mega = document.getElementById("dics-mega");
        var megaPanel = document.getElementById("dics-mega-panel");
        var closeTimer = null;

        function openMega() {
            if (closeTimer) {
                clearTimeout(closeTimer);
                closeTimer = null;
            }
            if (mega) {
                mega.classList.add("is-open");
            }
        }

        function scheduleCloseMega() {
            closeTimer = setTimeout(function () {
                if (mega) {
                    mega.classList.remove("is-open");
                }
            }, CLOSE_DELAY);
        }

        if (mega) {
            mega.addEventListener("mouseenter", openMega);
            mega.addEventListener("mouseleave", scheduleCloseMega);

            // Keyboard/focus support: open on focus-in, close on focus-out of the whole block
            mega.addEventListener("focusin", openMega);
            mega.addEventListener("focusout", function (ev) {
                if (!mega.contains(ev.relatedTarget)) {
                    scheduleCloseMega();
                }
            });

            // Close the panel once a service link is clicked
            if (megaPanel) {
                megaPanel.addEventListener("click", function (ev) {
                    if (ev.target.closest("a.dics-mega__item")) {
                        mega.classList.remove("is-open");
                    }
                });
            }
        }

        /* ---------------------------------------------------------------
         * 3. Category switching inside the mega panel
         * ------------------------------------------------------------- */
        var categoryButtons = document.querySelectorAll(".dics-mega__cat");
        var categoryGroups = document.querySelectorAll(".dics-mega__group");

        function setActiveCategory(catKey) {
            categoryButtons.forEach(function (btn) {
                btn.classList.toggle("is-active", btn.getAttribute("data-cat") === catKey);
            });
            categoryGroups.forEach(function (grp) {
                grp.classList.toggle("is-active", grp.getAttribute("data-cat") === catKey);
            });
        }

        categoryButtons.forEach(function (btn) {
            btn.addEventListener("mouseenter", function () {
                setActiveCategory(btn.getAttribute("data-cat"));
            });
            btn.addEventListener("focus", function () {
                setActiveCategory(btn.getAttribute("data-cat"));
            });
            btn.addEventListener("click", function (ev) {
                ev.preventDefault();
                setActiveCategory(btn.getAttribute("data-cat"));
            });
        });

        /* ---------------------------------------------------------------
         * 4. Mobile hamburger drawer
         * ------------------------------------------------------------- */
        var mobileToggle = document.getElementById("dics-mobile-toggle");
        var mobileDrawer = document.getElementById("dics-mobile-drawer");

        function closeMobileDrawer() {
            if (mobileDrawer) {
                mobileDrawer.classList.remove("is-open");
            }
            if (mobileToggle) {
                mobileToggle.classList.remove("is-active");
                mobileToggle.setAttribute("aria-expanded", "false");
            }
            document.body.classList.remove("dics-no-scroll");
        }

        function toggleMobileDrawer() {
            var isOpen = mobileDrawer && mobileDrawer.classList.contains("is-open");
            if (isOpen) {
                closeMobileDrawer();
            } else {
                if (mobileDrawer) {
                    mobileDrawer.classList.add("is-open");
                }
                if (mobileToggle) {
                    mobileToggle.classList.add("is-active");
                    mobileToggle.setAttribute("aria-expanded", "true");
                }
                document.body.classList.add("dics-no-scroll");
            }
        }

        if (mobileToggle) {
            mobileToggle.addEventListener("click", toggleMobileDrawer);
        }

        // Close the drawer whenever a plain nav link inside it is clicked
        if (mobileDrawer) {
            mobileDrawer.addEventListener("click", function (ev) {
                var link = ev.target.closest("a.dics-mobile-drawer__link, a.dics-mobile-drawer__sublink, a.btn");
                if (link) {
                    closeMobileDrawer();
                }
            });
        }

        // Reset drawer state if the viewport grows back to desktop size
        window.addEventListener("resize", function () {
            if (window.innerWidth >= 768) {
                closeMobileDrawer();
            }
        });

        /* ---------------------------------------------------------------
         * 5. Mobile "Services" accordion
         * ------------------------------------------------------------- */
        var mobileServicesToggle = document.getElementById("dics-mobile-services-toggle");
        var mobileServicesBody = document.getElementById("dics-mobile-services-body");

        if (mobileServicesToggle && mobileServicesBody) {
            mobileServicesToggle.addEventListener("click", function () {
                var expanded = mobileServicesBody.classList.toggle("is-open");
                mobileServicesToggle.classList.toggle("is-open", expanded);
            });
        }
    });
})();

//smooth scroll
document.addEventListener('DOMContentLoaded', function () {
  const anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
  anchorLinks.forEach((link) => {
    if (!(link instanceof HTMLElement)) return;
    link.addEventListener('click', function (event) {
      console.log("smooth scroll.js")
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target || !(target instanceof HTMLElement)) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
});


//new navbar scroll
