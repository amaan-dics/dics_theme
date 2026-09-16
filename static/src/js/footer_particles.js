/** @odoo-module **/
// footer.js
import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.DicsFooterCanvas = publicWidget.Widget.extend({
    selector: '.dics-footer', // Hooks onto your footer container class

    start: function () {
        this._super.apply(this, arguments);
        
        // Find the canvas specifically inside this widget instance
        const canvas = this.el.querySelector('#dics-footer-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const footer = this.el;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let width = 0;
        let height = 0;
        let running = false;
        let rafId = null;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        const isSmall = window.innerWidth < 768;
        const orbitCount = isSmall ? 60 : 150;
        const starCount = isSmall ? 45 : 110;

        const orbitParticles = [];
        for (let i = 0; i < orbitCount; i++) {
            orbitParticles.push({
                angle: Math.random() * Math.PI * 2,
                distance: 0.1 + Math.random() * 0.6,
                speed: reduceMotion ? 0 : 0.0005 + Math.random() * 0.001,
                radius: Math.random() * 1.5 + 0.3,
                alpha: Math.random() * 0.5 + 0.1,
            });
        }

        const stars = [];
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random(),
                y: Math.random(),
                radius: Math.random() * 1.1 + 0.2,
                baseAlpha: Math.random() * 0.4 + 0.15,
                twinkleSpeed: reduceMotion ? 0 : 0.0006 + Math.random() * 0.0012,
                twinklePhase: Math.random() * Math.PI * 2,
            });
        }

        const LINK_DISTANCE = 90;

        function resize() {
            const rect = canvas.parentNode.getBoundingClientRect();
            width = rect.width;
            height = rect.height || 350;

            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
        }

        function draw(time) {
            ctx.clearRect(0, 0, width, height);

            stars.forEach(s => {
                const twinkle = reduceMotion
                    ? 0
                    : Math.sin(time * s.twinkleSpeed + s.twinklePhase) * 0.25;
                ctx.beginPath();
                ctx.arc(s.x * width, s.y * height, s.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, s.baseAlpha + twinkle)})`;
                ctx.fill();
            });

            const centerX = width / 2;
            const centerY = height / 1.5;
            const maxRadius = Math.min(width, height) * 0.95;
            const points = [];

            orbitParticles.forEach(p => {
                p.angle += p.speed;
                const currentDist = p.distance * maxRadius;
                const x = centerX + Math.cos(p.angle) * currentDist;
                const y = centerY + Math.sin(p.angle) * currentDist * 0.45;
                points.push({ x, y, alpha: p.alpha });

                ctx.beginPath();
                ctx.arc(x, y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 173, 220, ${p.alpha})`;
                ctx.fill();
            });

            for (let i = 0; i < points.length; i++) {
                for (let j = i + 1; j < points.length; j++) {
                    const dx = points[i].x - points[j].x;
                    const dy = points[i].y - points[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < LINK_DISTANCE) {
                        const lineAlpha = (1 - dist / LINK_DISTANCE) * 0.12;
                        ctx.beginPath();
                        ctx.moveTo(points[i].x, points[i].y);
                        ctx.lineTo(points[j].x, points[j].y);
                        ctx.strokeStyle = `rgba(0, 173, 220, ${lineAlpha})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }
        }

        function animate(time) {
            if (!running) return;
            draw(time);
            rafId = requestAnimationFrame(animate);
        }

        function startAnim() {
            if (running) return;
            running = true;
            rafId = requestAnimationFrame(animate);
        }

        function stopAnim() {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = null;
        }

        resize();
        draw(0);

        if ('IntersectionObserver' in window && footer) {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !document.hidden) startAnim();
                    else stopAnim();
                });
            }, { threshold: 0.05 });
            observer.observe(footer);
        } else {
            startAnim();
        }

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) stopAnim();
            else if (!footer || footer.getBoundingClientRect().top < window.innerHeight) startAnim();
        });

        let resizeTimer = null;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                resize();
                if (!running) draw(0);
            }, 150);
        });

        if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
            const bg = canvas.parentElement;
            document.addEventListener('mousemove', function (e) {
                if (!footer) return;
                const rect = footer.getBoundingClientRect();
                if (rect.top > window.innerHeight || rect.bottom < 0) return;
                const relX = (e.clientX / window.innerWidth - 0.5) * 2;
                const relY = (e.clientY / window.innerHeight - 0.5) * 2;
                bg.style.transform = `translate3d(${relX * 6}px, ${relY * 4}px, 0)`;
            }, { passive: true });
        }

        const yearSpan = this.el.querySelector('#current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear().toString();
        }
    },
});

export default publicWidget.registry.DicsFooterCanvas;
