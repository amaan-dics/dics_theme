/** Home hero: scroll-linked shrink/fade + subtle mouse parallax on the service-orbit cluster. */
(function () {
    "use strict";



    function initOrbitParallax() {
        var wrap = document.querySelector(".dics-service-orbit");
        if (!wrap || window.matchMedia("(max-width: 991px)").matches) return;

        function onMouseMove(e) {
            var x = (e.clientX / window.innerWidth - 0.5) * 22;
            var y = (e.clientY / window.innerHeight - 0.5) * 14;
            wrap.style.transform = "translate(" + x + "px, " + y + "px)";
        }

        window.addEventListener("mousemove", onMouseMove, { passive: true });
    }

    function init() {

        initOrbitParallax();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

/** Services page: scroll-driven expanding image panels (desktop only).
 *  Mirrors services.tsx's useScroll(['start start','end start']) + useTransform chain:
 *    p        = scroll progress through the 200vh container (0 -> 1)
 *    width    = p in [0, 0.48]      -> [48%, 100%]
 *    textOp   = width in [52, 70]   -> [1, 0]
 *    overlayOp= width in [65, 82]   -> [0, 1]
 *    scale    = p in [0.65, 1]      -> [1, 0.9]
 *    sectionOp= p in [0.68, 1]      -> [1, 0]
 *    sectionY = p in [0.68, 1]      -> [0, -28px]
 */
(function () {
    "use strict";

    function clamp(v, min, max) {
        return Math.min(Math.max(v, min), max);
    }

    // Linear interpolation of `value` currently in [inMin, inMax] onto [outMin, outMax], clamped.
    function mapRange(value, inMin, inMax, outMin, outMax) {
        if (inMax === inMin) return outMin;
        var t = clamp((value - inMin) / (inMax - inMin), 0, 1);
        return outMin + t * (outMax - outMin);
    }

    function initPanels() {
        var containers = document.querySelectorAll(".service-scroll");
        if (!containers.length) return;

        var panels = Array.prototype.map.call(containers, function (container) {
            return {
                container: container,
                sticky: container.querySelector(".service-scroll__sticky"),
                image: container.querySelector(".service-scroll__image"),
                textWrap: container.querySelector(".service-scroll__text-wrap"),
                overlay: container.querySelector(".service-scroll__overlay"),
            };
        });

        var ticking = false;

        function update() {
            ticking = false;
            var viewportH = window.innerHeight;

            panels.forEach(function (panel) {
                var rect = panel.container.getBoundingClientRect();
                if (rect.bottom < -viewportH || rect.top > viewportH * 2) {
                    return; // far off-screen, skip work
                }

                var p = clamp(-rect.top / rect.height, 0, 1);

                var width = mapRange(p, 0, 0.48, 48, 100);
                var textOpacity = mapRange(width, 52, 70, 1, 0);
                var overlayOpacity = mapRange(width, 65, 82, 0, 1);

                var scale = mapRange(p, 0.65, 1, 1, 0.9);
                var sectionOpacity = mapRange(p, 0.68, 1, 1, 0);
                var sectionY = mapRange(p, 0.68, 1, 0, -28);

                if (panel.image) panel.image.style.width = width + "%";
                if (panel.overlay) panel.overlay.style.opacity = String(overlayOpacity);
                if (panel.textWrap) {
                    panel.textWrap.style.opacity = String(textOpacity);
                    var isReverse = panel.container.querySelector(".is-reverse") !== null;
                    var dir = isReverse ? -1 : 1;
                    var xOffset = mapRange(width, 52, 70, 0, 55 * dir);
                    panel.textWrap.style.transform = "translateX(" + xOffset + "px)";
                }
                if (panel.sticky) {
                    panel.sticky.style.transform =
                        "translateY(" + sectionY + "px) scale(" + scale + ")";
                    panel.sticky.style.opacity = String(sectionOpacity);
                }
            });
        }

        function onScroll() {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        }

        window.addEventListener("scroll", onScroll, { passive: true, capture: true });
        window.addEventListener("resize", onScroll);
        update();
    }

    function init() {
        if (window.matchMedia("(max-width: 991px)").matches) return; // desktop-only effect
        initPanels();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

/** Contact page: Leaflet map init, with mobile-aware resize handling. */
(function () {
    "use strict";

    function onReady(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initMap() {
        var container = document.getElementById("dics-contact-map");
        if (!container || typeof L === "undefined" || container.dataset.mapInitialized) {
            return;
        }

        var torontoCoordinates = [43.6487, -79.3817];

        var map = L.map(container, {
            center: torontoCoordinates,
            zoom: 15,
            scrollWheelZoom: false,
            zoomControl: true,
        });

        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        var customIcon = L.icon({
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
        });

        L.marker(torontoCoordinates, { icon: customIcon })
            .addTo(map)
            .bindPopup('<b>Datainteger Consultancy Services Solutions</b><br>100 King St W, Suite 5600<br>Toronto, ON M5X 1C9')
            .openPopup();

        container.dataset.mapInitialized = "true";

        function refreshMap() {
            if (map) {
                setTimeout(function () {
                    map.invalidateSize();
                }, 300); // Give CSS time to apply new dimensions
            }
        }

        window.addEventListener("resize", function () {
            clearTimeout(window.mapResizeTimer);
            window.mapResizeTimer = setTimeout(refreshMap, 250);
        });

        window.addEventListener("orientationchange", refreshMap);
        setTimeout(refreshMap, 400);
    }

    onReady(function () {
        var attempts = 0;
        var poll = setInterval(function () {
            attempts += 1;
            if (typeof L !== "undefined") {
                clearInterval(poll);
                initMap();
            } else if (attempts > 50) {
                clearInterval(poll);
            }
        }, 100);
    });
})();

/** About page: dics-console 3D parallax rig, tracked on mousemove. */
document.addEventListener('DOMContentLoaded', function () {
  const wrap = document.getElementById('dics-console');
  if (!wrap) return;

  const rig = wrap.querySelector('.dics-console__rig');
  const glass = document.getElementById('dics-console-glass');
  const particleA = document.getElementById('dics-console-particle-a');
  const particleB = document.getElementById('dics-console-particle-b');
  if (!rig || !glass) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let raf = null;

  const damp = 0.12;

  function tick() {
    currentX += (targetX - currentX) * damp;
    currentY += (targetY - currentY) * damp;

    const rotX = (currentY * -15).toFixed(2);
    const rotY = (currentX * 15).toFixed(2);
    rig.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;

    const glassX = (currentX * 20).toFixed(2);
    const glassY = (currentY * 20).toFixed(2);
    glass.style.transform = `translate3d(${glassX}px, ${glassY}px, 40px)`;

    if (particleA) {
      particleA.style.transform = `translate3d(${(glassX * 1.4).toFixed(2)}px, ${(glassY * 1.4).toFixed(2)}px, 80px)`;
    }
    if (particleB) {
      particleB.style.transform = `translate3d(${(glassX * -1.2).toFixed(2)}px, ${(glassY * -1.2).toFixed(2)}px, 90px)`;
    }

    if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
      raf = window.requestAnimationFrame(tick);
    } else {
      raf = null;
    }
  }

  function requestTick() {
    if (!raf) raf = window.requestAnimationFrame(tick);
  }

  wrap.addEventListener('mousemove', function (e) {
    const rect = wrap.getBoundingClientRect();
    targetX = (e.clientX - rect.left) / rect.width - 0.5;
    targetY = (e.clientY - rect.top) / rect.height - 0.5;
    requestTick();
  });

  wrap.addEventListener('mouseleave', function () {
    targetX = 0;
    targetY = 0;
    requestTick();
  });
});


/** Portal /my home: stamp a class on alert cards that appear before .wrapper
 *  so SCSS can target them without affecting the cards below. */
(function () {
    "use strict";

    function initPortalAlertCards() {
        var wrapper = document.querySelector(".container .wrapper");
        if (!wrapper) return;

        var sibling = wrapper.previousElementSibling;
        while (sibling) {
            sibling
                .querySelectorAll("a.dics-portal-card--stacked.alert.alert-primary")
                .forEach(function (el) {
                    el.classList.add("dics-alert-card--pre-wrapper");
                });
            sibling = sibling.previousElementSibling;
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initPortalAlertCards);
    } else {
        initPortalAlertCards();
    }
})();