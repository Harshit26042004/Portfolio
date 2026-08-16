/**
 * RadarChart - Neo-Brutalist Radar / Spider Chart Component
 * Canvas-based radar chart with per-category polygons, animated reveal,
 * pointer-reactive tilt, hover highlighting and tooltips.
 */
(function(global) {
  'use strict';

  const DATA = [
    { name: 'Python', value: 95, cat: 0 },
    { name: 'Java', value: 80, cat: 0 },
    { name: 'SQL', value: 75, cat: 0 },
    { name: 'JavaScript', value: 70, cat: 0 },
    { name: 'Machine Learning', value: 88, cat: 1 },
    { name: 'Deep Learning', value: 85, cat: 1 },
    { name: 'LLM Fine-tune', value: 82, cat: 1 },
    { name: 'NLP', value: 78, cat: 1 },
    { name: 'RAG', value: 80, cat: 1 },
    { name: 'PySpark', value: 72, cat: 2 },
    { name: 'Docker', value: 70, cat: 2 },
    { name: 'Git', value: 85, cat: 2 }
  ];

  const CAT_COLORS = ['#ff7a00', '#22c55e', '#7c3cff'];
  const CAT_NAMES = ['Languages', 'Specializations', 'Tools & Frameworks'];

  class RadarChart {
    constructor(wrap) {
      this.wrap = wrap;
      this.canvas = wrap.querySelector('[data-radar-canvas]');
      this.tooltip = wrap.querySelector('[data-radar-tooltip]');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.progress = 0;
      this.targetProgress = 1;
      this.animating = false;
      this.hovered = -1;
      this.hovering = false;
      this._mouse = { x: 0, y: 0, in: false };
      this._tiltX = 0;
      this._tiltY = 0;
      this._targetTiltX = 0;
      this._targetTiltY = 0;
      this._rafId = null;
      this._reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this._pointer = !('ontouchstart' in window) && navigator.maxTouchPoints === 0;

      this._resize();
      this._bind();
      this._observer = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) {
          this._start();
          this._observer.disconnect();
        }
      }, { threshold: 0.25 });
      this._observer.observe(this.wrap);
    }

    _resize() {
      const rect = this.wrap.getBoundingClientRect();
      const size = Math.min(rect.width || 560, 620);
      this.dpr = window.devicePixelRatio || 1;
      this.size = size;
      this.canvas.width = size * this.dpr;
      this.canvas.height = size * this.dpr;
      this.canvas.style.width = size + 'px';
      this.canvas.style.height = size + 'px';
      this.center = size / 2;
      this.radius = size / 2 - 64;
    }

    _bind() {
      window.addEventListener('resize', () => this._resize());

      if (!this._pointer) return;
      this.wrap.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this._mouse.x = e.clientX - rect.left;
        this._mouse.y = e.clientY - rect.top;
        this._mouse.in = true;
        this._updateHover();
        this._targetTiltX = ((this._mouse.y / this.size) - 0.5) * 0.08;
        this._targetTiltY = ((this._mouse.x / this.size) - 0.5) * -0.08;
        this._ensureLoop();
      });
      this.wrap.addEventListener('mouseleave', () => {
        this._mouse.in = false;
        this.hovered = -1;
        this._targetTiltX = 0;
        this._targetTiltY = 0;
        this._hideTooltip();
      });
    }

    _axisPoint(index, radius) {
      const angle = (index / DATA.length) * Math.PI * 2 - Math.PI / 2;
      return {
        x: this.center + Math.cos(angle) * radius,
        y: this.center + Math.sin(angle) * radius
      };
    }

    _updateHover() {
      const px = this._mouse.x;
      const py = this._mouse.y;
      let best = -1;
      let bestDist = 26;
      for (let i = 0; i < DATA.length; i++) {
        const p = this._axisPoint(i, this.radius * (DATA[i].value / 100) * Math.max(this.progress, 0.05));
        const d = Math.hypot(px - p.x, py - p.y);
        if (d < bestDist) { bestDist = d; best = i; }
      }
      if (best !== this.hovered) {
        this.hovered = best;
        if (best >= 0) {
          const p = this._axisPoint(best, this.radius * (DATA[best].value / 100) * Math.max(this.progress, 0.05));
          this._showTooltip(DATA[best], p);
        } else {
          this._hideTooltip();
        }
      }
    }

    _showTooltip(item, p) {
      if (!this.tooltip) return;
      this.tooltip.innerHTML =
        '<span class="radar-tooltip__dot" style="background:' + CAT_COLORS[item.cat] + '"></span>' +
        '<strong>' + item.name + '</strong><em>' + item.value + '</em>';
      const t = this.tooltip.getBoundingClientRect();
      const x = Math.max(8, Math.min(this.size - t.width - 8, p.x - t.width / 2));
      const y = p.y - t.height - 14;
      this.tooltip.style.transform = 'translate(' + x + 'px,' + Math.max(8, y) + 'px)';
      this.tooltip.style.opacity = '1';
    }

    _hideTooltip() {
      if (this.tooltip) this.tooltip.style.opacity = '0';
    }

    _start() {
      this.animating = true;
      if (this._reduced) {
        this.progress = 1;
        this.animating = false;
      }
      this._ensureLoop();
    }

    _ensureLoop() {
      if (this._rafId !== null) return;
      const tick = () => {
        this._rafId = null;
        if (this.animating) {
          this.progress += (this.targetProgress - this.progress) * 0.045;
          if (this.targetProgress - this.progress < 0.001) {
            this.progress = this.targetProgress;
            this.animating = false;
          }
        }
        this._tiltX += (this._targetTiltX - this._tiltX) * 0.12;
        this._tiltY += (this._targetTiltY - this._tiltY) * 0.12;
        this._draw();
        if (this.animating || this._mouse.in || Math.abs(this._tiltX) > 0.001 || Math.abs(this._tiltY) > 0.001) {
          this._rafId = requestAnimationFrame(tick);
        }
      };
      this._rafId = requestAnimationFrame(tick);
    }

    _draw() {
      const ctx = this.ctx;
      const dpr = this.dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, this.size, this.size);

      const root = getComputedStyle(document.documentElement);
      const gridColor = root.getPropertyValue('--muted-color').trim() || '#8892a0';
      const headingColor = root.getPropertyValue('--heading-color').trim() || '#0f172a';
      const surfaceColor = root.getPropertyValue('--surface-color').trim() || '#ffffff';
      const accentColor = root.getPropertyValue('--accent-color').trim() || '#ff6b35';

      ctx.save();
      ctx.translate(this.center, this.center);
      ctx.rotate(this._tiltY);
      ctx.rotate(this._tiltX * 0.6);

      const n = DATA.length;
      const ease = 1 - Math.pow(1 - this.progress, 3);

      ctx.lineWidth = 1;
      ctx.strokeStyle = gridColor;
      ctx.globalAlpha = 0.35;

      for (let ring = 1; ring <= 5; ring++) {
        const r = (this.radius * ring) / 5 * (0.4 + 0.6 * ease);
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
          const p = this._axisPoint(i % n, r);
          if (i === 0) ctx.moveTo(p.x - this.center, p.y - this.center);
          else ctx.lineTo(p.x - this.center, p.y - this.center);
        }
        ctx.stroke();
      }

      for (let i = 0; i < n; i++) {
        const p = this._axisPoint(i, this.radius * (0.4 + 0.6 * ease));
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(p.x - this.center, p.y - this.center);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.font = '10px Questrial, sans-serif';
      ctx.fillStyle = gridColor;
      ctx.textAlign = 'right';
      for (let ring = 1; ring <= 5; ring++) {
        const r = (this.radius * ring) / 5 * (0.4 + 0.6 * ease);
        const top = this._axisPoint(0, r);
        ctx.globalAlpha = 0.55;
        ctx.fillText(String(ring * 20), top.x - this.center - 6, top.y - this.center + 3);
      }
      ctx.globalAlpha = 1;

      const drawPoly = (cat, alpha) => {
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          if (DATA[i].cat !== cat) continue;
          const r = this.radius * (DATA[i].value / 100) * ease;
          const p = this._axisPoint(i, r);
          if (p.first === undefined) { ctx.moveTo(p.x - this.center, p.y - this.center); p.first = true; }
          else ctx.lineTo(p.x - this.center, p.y - this.center);
        }
        ctx.closePath();
        ctx.fillStyle = CAT_COLORS[cat] + '1f';
        ctx.fill();
        ctx.strokeStyle = CAT_COLORS[cat];
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.stroke();
      };

      for (let cat = 0; cat < 3; cat++) drawPoly(cat, 1);

      for (let i = 0; i < n; i++) {
        const r = this.radius * (DATA[i].value / 100) * ease;
        const p = this._axisPoint(i, r);
        const x = p.x - this.center;
        const y = p.y - this.center;
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = CAT_COLORS[DATA[i].cat];
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = surfaceColor;
        ctx.stroke();

        if (this.hovered === i) {
          const pulse = 7 + Math.sin(performance.now() * 0.006) * 2;
          ctx.beginPath();
          ctx.arc(x, y, pulse, 0, Math.PI * 2);
          ctx.strokeStyle = CAT_COLORS[DATA[i].cat];
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      ctx.fillStyle = gridColor;
      ctx.font = '600 11px Questrial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < n; i++) {
        const lp = this._axisPoint(i, this.radius + 24);
        const x = lp.x - this.center;
        const y = lp.y - this.center;
        const name = DATA[i].name;
        const lines = name.length > 12 ? name.split(' ') : [name];
        ctx.globalAlpha = 0.85;
        lines.forEach((line, li) => {
          const ly = y + (li - (lines.length - 1) / 2) * 12;
          if (i === this.hovered) {
            ctx.fillStyle = CAT_COLORS[DATA[i].cat];
            ctx.font = '700 12px Questrial, sans-serif';
          } else {
            ctx.fillStyle = gridColor;
            ctx.font = '600 11px Questrial, sans-serif';
          }
          ctx.fillText(line, x, ly);
        });
        ctx.globalAlpha = 1;
      }

      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = accentColor;
      ctx.fill();
      ctx.restore();
    }

    destroy() {
      if (this._rafId) cancelAnimationFrame(this._rafId);
      this._observer.disconnect();
    }

    static initAll() {
      const instances = [];
      document.querySelectorAll('[data-radar]').forEach(wrap => {
        instances.push(new RadarChart(wrap));
      });
      return instances;
    }
  }

  global.RadarChart = RadarChart;
})(window);